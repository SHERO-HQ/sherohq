import { NextRequest} from "next/server";
import { db } from "@/lib/db";
import { orders, activityLogs, products } from "@/lib/drizzle/schema";
import { eq, like, desc, inArray, and } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import { safeParse } from "@/lib/orderUtils";
import { notificationService, ShippingInfo} from "@/lib/notifications";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const id = (await params).id;
    const result = await db.select().from(orders).where(eq(orders.id, id));
    const order = result[0];

    if (!order) return apiResponse.notFound("Order not found");

    const logsResult = await db
      .select({ details: activityLogs.details })
      .from(activityLogs)
      .where(
        and(
          eq(activityLogs.action, 'order_payment'),
          like(activityLogs.details, `%${id}%`)
        )
      )
      .orderBy(desc(activityLogs.createdAt))
      .limit(1);
    
    const paymentMessage = logsResult[0]?.details || null;

    let parsedItems = safeParse(order.items) as any[];
    if (!Array.isArray(parsedItems)) parsedItems = [];
    const productIds = parsedItems.map((i: any) => i.id).filter(Boolean);
    
    if (productIds.length > 0) {
      const productsRes = await db
        .select({ id: products.id, sku: products.sku, images: products.images })
        .from(products)
        .where(inArray(products.id, productIds));
        
      const productMap = new Map(productsRes.map(r => [r.id, r]));
      for (const item of parsedItems) {
        const p = productMap.get(item.id);
        if (p) {
          if (!item.sku && p.sku) item.sku = p.sku;
          const imgArray = p.images as string[] | null;
          if (!item.image && imgArray && imgArray.length > 0) item.image = imgArray[0];
        }
      }
    }

    return apiResponse.success({
      ...order,
      items: parsedItems,
      shippingInfo: safeParse(order.shippingInfo),
      total: Number(order.total),
      paymentMessage
    });
  } catch (error) {
    console.error("Fetch order error:", error);
    return apiResponse.error("Failed to fetch order");
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const id = (await params).id;
    const { status, paymentMethod } = await request.json();

    const updateData: Partial<typeof orders.$inferInsert> = {};
    if (status) updateData.status = status;
    if (paymentMethod) updateData.paymentMethod = paymentMethod;

    if (Object.keys(updateData).length === 0) return apiResponse.error("No fields to update", 400);

    const result = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();

    if (result.length === 0) return apiResponse.notFound("Order not found");

    const updatedOrder = result[0];

    if (status === "intransit" || status === "delivered") {
      notificationService.sendOrderStatusUpdateNotification(
        id,
        status,
        safeParse(updatedOrder.shippingInfo) as ShippingInfo
      ).catch(console.error);
    }

    const { logActivity } = await import("@/lib/activity");
    await logActivity(admin.id, "order_update", "info", `Updated order ${id}: status=${status || 'N/A'}`);

    return apiResponse.success({
      ...updatedOrder,
      items: safeParse(updatedOrder.items),
      shippingInfo: safeParse(updatedOrder.shippingInfo),
      total: Number(updatedOrder.total)
    });
  } catch (error) {
    console.error("Update order error:", error);
    return apiResponse.error("Failed to update order");
  }
}
