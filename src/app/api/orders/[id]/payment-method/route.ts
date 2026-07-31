import { NextRequest} from "next/server";
import { query } from "@/lib/db";
import { getUserFromSession, getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import { 
  normalizePaymentMethod, 
  ORDER_PAYMENT_METHODS, 
  hashOrderAccessToken 
} from "@/lib/orderUtils";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const body = await request.json();
    const { paymentMethod } = body;

    if (!paymentMethod) {
      return apiResponse.error("Payment method is required", 400);
    }

    const normalizedMethod = normalizePaymentMethod(paymentMethod);
    if (!ORDER_PAYMENT_METHODS.has(normalizedMethod)) {
      return apiResponse.error("Invalid payment method", 400);
    }

    // Retrieve order to check authorization and status
    const orderRes = await query(
      `SELECT status, "userId", "orderAccessTokenHash" FROM orders WHERE id = $1`,
      [id]
    );

    if (orderRes.rowCount === 0) {
      return apiResponse.notFound("Order not found");
    }

    const order = orderRes.rows[0];

    // Authorization checks
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
      return apiResponse.unauthorized();
    }

    // Only allow updating if the order is still pending
    if (order.status !== "pending") {
      return apiResponse.error(
        "Payment method can only be modified for pending orders",
        400
      );
    }

    // Update payment method in the database
    const updateRes = await query(
      `UPDATE orders SET "paymentMethod" = $1 WHERE id = $2 RETURNING *`,
      [normalizedMethod, id]
    );

    if (updateRes.rowCount === 0) {
      return apiResponse.error("Failed to update payment method", 500);
    }

    // Log the action
    const { logActivity } = await import("@/lib/activity");
    const actorId = admin?.id || user?.id || null;
    await logActivity(
      actorId,
      "order_update",
      "info",
      `Updated order ${id} payment method to ${normalizedMethod}`
    );

    return apiResponse.success({
      success: true,
      message: "Payment method updated successfully"});
  } catch (error) {
    console.error("Failed to update order payment method:", error);
    return apiResponse.error("Failed to update payment method");
  }
}
