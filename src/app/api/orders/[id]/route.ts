import { NextRequest} from "next/server";
import { query } from "@/lib/db";
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
    const result = await query("SELECT * FROM orders WHERE id = $1", [id]);
    const order = result.rows[0];

    if (!order) return apiResponse.notFound("Order not found");

    const logsResult = await query(
      `SELECT details FROM activity_logs WHERE action = 'order_payment' AND details LIKE $1 ORDER BY "createdAt" DESC LIMIT 1`,
      [`%${id}%`]
    );
    const paymentMessage = logsResult.rows[0]?.details || null;

    let parsedItems = safeParse(order.items) as any[];
    if (!Array.isArray(parsedItems)) parsedItems = [];
    const productIds = parsedItems.map((i: any) => i.id).filter(Boolean);
    if (productIds.length > 0) {
      const productsRes = await query(`SELECT id, sku, images FROM products WHERE id = ANY($1)`, [productIds]);
      const productMap = new Map(productsRes.rows.map((r: any) => [r.id, r]));
      for (const item of parsedItems) {
        const p = productMap.get(item.id);
        if (p) {
          if (!item.sku && p.sku) item.sku = p.sku;
          if (!item.image && p.images && p.images.length > 0) item.image = p.images[0];
        }
      }
    }

    return apiResponse.success({
      ...order,
      items: parsedItems,
      shippingInfo: safeParse(order.shippingInfo),
      total: parseFloat(order.total),
      paymentMessage});
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

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (status) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    if (paymentMethod) {
      updates.push(`"paymentMethod" = $${paramIndex++}`);
      values.push(paymentMethod);
    }

    if (updates.length === 0) return apiResponse.error("No fields to update", 400);

    values.push(id);
    const result = await query(
      `UPDATE orders SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rowCount === 0) return apiResponse.notFound("Order not found");

    const updatedOrder = result.rows[0];

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
      ...result.rows[0],
      items: safeParse(result.rows[0].items),
      shippingInfo: safeParse(result.rows[0].shippingInfo),
      total: parseFloat(result.rows[0].total)});
  } catch (error) {
    console.error("Update order error:", error);
    return apiResponse.error("Failed to update order");
  }
}
