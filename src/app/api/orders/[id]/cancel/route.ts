import { NextRequest } from "next/server";
import { query, getClient } from "@/lib/db";
import { apiResponse } from "@/lib/api-utils";
import { safeParse, hashOrderAccessToken } from "@/lib/orderUtils";
import { getUserFromSession, getAdminFromSession } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await getClient();
  try {
    const id = (await params).id;

    await client.query("BEGIN");

    // 1. Fetch order and lock it
    const orderRes = await client.query(
      `SELECT id, status, "paymentStatus", items, "userId", "orderAccessTokenHash" 
       FROM orders 
       WHERE id = $1 
       FOR UPDATE`,
      [id]
    );

    if (orderRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return apiResponse.notFound("Order not found");
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
      await client.query("ROLLBACK");
      return apiResponse.unauthorized();
    }

    // 2. Allow cancellation only for pending orders with unconfirmed payment
    if (order.status !== "pending" || order.paymentStatus === "confirmed") {
      await client.query("ROLLBACK");
      return apiResponse.error(
        "Order cannot be cancelled because it is no longer pending or payment has been confirmed.",
        400
      );
    }

    // 3. Restore stock for each item in the order
    const items = safeParse(order.items);
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item.id && item.quantity) {
          await client.query(
            `UPDATE products 
             SET "stockQuantity" = "stockQuantity" + $1,
                 "inStock" = true
             WHERE id = $2`,
            [item.quantity, item.id]
          );
        }
      }
    }

    // 4. Update order status to 'cancelled'
    await client.query(
      `UPDATE orders 
       SET status = 'cancelled' 
       WHERE id = $1`,
      [id]
    );

    await client.query("COMMIT");

    return apiResponse.success({ success: true, message: "Order cancelled and stock restored." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error cancelling order:", error);
    return apiResponse.error("Failed to cancel order and restore stock", 500);
  } finally {
    client.release();
  }
}
