import { apiResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { orders, activityLogs, products } from "@/lib/drizzle/schema";
import { eq, sql, inArray, desc, asc } from "drizzle-orm";
import { getUserFromSession, getAdminFromSession } from "@/lib/auth";
import { safeParse, hashOrderAccessToken } from "@/lib/orderUtils";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const orderId = (await params).orderId;
    const rawOrderId = String(orderId || "").trim();

    let orderRows = [];

    if (UUID_RE.test(rawOrderId)) {
      orderRows = await db.select().from(orders).where(eq(orders.id, rawOrderId)).limit(2);
    } else {
      const compactCandidate = rawOrderId.toLowerCase().replace(/^ord-/, "").replace(/[^0-9a-f]/g, "");
      if (compactCandidate.length === 32) {
        orderRows = await db.select().from(orders).where(sql`replace(lower(${orders.id}::text), '-', '') = ${compactCandidate}`).limit(2);
      } else if (compactCandidate.length >= 8) {
        orderRows = await db.select().from(orders)
          .where(sql`replace(lower(${orders.id}::text), '-', '') LIKE ${compactCandidate.slice(0, 8) + '%'}`)
          .orderBy(desc(orders.createdAt))
          .limit(2);
      } else {
        return apiResponse.error("Invalid order identifier", 400);
      }
    }

    if (orderRows.length > 1) {
      return apiResponse.error("Multiple orders match this identifier. Use the full tracking link.", 409);
    }

    const order = orderRows[0];
    if (!order) {
      return apiResponse.notFound("Order not found");
    }

    // Auth logic
    const [user, admin] = await Promise.all([getUserFromSession(), getAdminFromSession()]);
    const providedToken = request.headers.get("x-order-access-token")?.trim() || null;
    const hasValidToken = providedToken && order.orderAccessTokenHash && hashOrderAccessToken(providedToken) === order.orderAccessTokenHash;

    const activityLogsRows = await db.select({
      action: activityLogs.action,
      createdAt: activityLogs.createdAt
    })
    .from(activityLogs)
    .where(
      sql`${activityLogs.action} LIKE 'order_%' AND ${activityLogs.details} LIKE ${'%' + order.id + '%'}`
    )
    .orderBy(asc(activityLogs.createdAt));

    const isAuthorized = Boolean(admin) || (user && order.userId === user.id) || hasValidToken;

    if (!isAuthorized) {
      return apiResponse.success({
        id: order.id,
        status: order.status,
        createdAt: order.createdAt,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        paymentMessage: order.paymentMessage,
        total: Number(order.total),
        activityLogs: activityLogsRows.map(l => ({ action: l.action, createdAt: l.createdAt })),
      });
    }

    let parsedItems = safeParse(order.items) as any[];
    if (!Array.isArray(parsedItems)) parsedItems = [];
    
    const productIds = parsedItems.map((i: any) => i.id).filter(Boolean);
    if (productIds.length > 0) {
      const productsRes = await db.select({
        id: products.id,
        sku: products.sku,
        images: products.images
      })
      .from(products)
      .where(inArray(products.id, productIds));
      
      const productMap = new Map(productsRes.map((r: any) => [r.id, r]));
      
      for (const item of parsedItems) {
        const p = productMap.get(item.id);
        if (p) {
          if (!item.sku && p.sku) item.sku = p.sku;
          const pImages = safeParse(p.images) as string[];
          if (!item.image && Array.isArray(pImages) && pImages.length > 0) {
            item.image = pImages[0];
          }
        }
      }
    }

    const { orderAccessTokenHash, ...cleanOrder } = order as any;

    return apiResponse.success({
      ...cleanOrder,
      items: parsedItems,
      shippingInfo: safeParse(order.shippingInfo),
      total: Number(order.total),
      paymentStatus: order.paymentStatus,
      paymentMessage: order.paymentMessage,
      activityLogs: activityLogsRows,
    });
  } catch (error) {
    console.error("Error tracking order:", error);
    return apiResponse.error("Failed to track order", 500);
  }
}
