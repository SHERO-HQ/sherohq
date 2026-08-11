import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { apiResponse } from "@/lib/api-utils";
import { safeParse, hashOrderAccessToken } from "@/lib/orderUtils";
import { getUserFromSession, getAdminFromSession } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    const result = await db.transaction(async (tx) => {
      // 1. Fetch order and lock it
      const orderRes = await tx.execute(
        sql`SELECT id, status, "paymentStatus", items, "userId", "orderAccessTokenHash" 
         FROM orders 
         WHERE id = ${id} 
         FOR UPDATE`
      );

      if (orderRes.rows.length === 0) {
        throw new Error("NOT_FOUND");
      }

      const order = orderRes.rows[0];

      const user = await getUserFromSession();
      const admin = await getAdminFromSession();
      
      const tokenHeader = request.headers.get("x-order-access-token");
      const hasValidOrderAccessToken =
        tokenHeader &&
        order.orderAccessTokenHash &&
        hashOrderAccessToken(tokenHeader.trim()) === order.orderAccessTokenHash;

      const isAuthorized =
        !!admin ||
        (!!user && user.id === order.userId) ||
        !!hasValidOrderAccessToken;

      if (!isAuthorized) {
        throw new Error("UNAUTHORIZED");
      }

      // 2. Allow cancellation only for pending orders with unconfirmed payment
      if (order.status !== "pending" || order.paymentStatus === "confirmed") {
        throw new Error("INVALID_STATE");
      }

      // 3. Restore stock for each item in the order
      const items = safeParse(order.items);
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item.id && item.quantity) {
            await tx.execute(
              sql`UPDATE products 
               SET "stockQuantity" = "stockQuantity" + ${item.quantity},
                   "inStock" = true
               WHERE id = ${item.id}`
            );
          }
        }
      }

      // 4. Update order status to 'cancelled'
      await tx.update(orders)
        .set({ status: 'cancelled' })
        .where(eq(orders.id, id));

      return true;
    });

    return apiResponse.success({ success: true, message: "Order cancelled and stock restored." }, 200);
  } catch (error: any) {
    console.error("Error cancelling order:", error);
    if (error.message === "NOT_FOUND") return apiResponse.notFound("Order not found");
    if (error.message === "UNAUTHORIZED") return apiResponse.unauthorized();
    if (error.message === "INVALID_STATE") return apiResponse.error("Order cannot be cancelled because it is no longer pending or payment has been confirmed.", 400);
    return apiResponse.error("Failed to cancel order and restore stock", 500);
  }
}
