import { NextRequest} from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { getUserFromSession, getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import { 
  normalizePaymentMethod, 
  ORDER_PAYMENT_METHODS,
  verifyOrderAccessToken
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

    const normalizedPaymentMethod = normalizePaymentMethod(paymentMethod);
    if (!ORDER_PAYMENT_METHODS.has(normalizedPaymentMethod)) {
      return apiResponse.error("Invalid payment method", 400);
    }

    // Retrieve order to check authorization and status
    const orderRes = await db
      .select({
        id: orders.id,
        status: orders.status,
        userId: orders.userId,
        orderAccessTokenHash: orders.orderAccessTokenHash,
        createdAt: orders.createdAt,
        total: orders.total,
      })
      .from(orders)
      .where(eq(orders.id, id));

    if (orderRes.length === 0) {
      return apiResponse.notFound("Order not found");
    }

    const order = orderRes[0];

    // Authorization checks
    const user = await getUserFromSession();
    const admin = await getAdminFromSession();

    const tokenHeader = request.headers.get("x-order-access-token");
    const hasValidOrderAccessToken = verifyOrderAccessToken(tokenHeader, order);

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
    const updateRes = await db
      .update(orders)
      .set({ paymentMethod: normalizedPaymentMethod })
      .where(eq(orders.id, id))
      .returning();

    if (updateRes.length === 0) {
      return apiResponse.error("Failed to update payment method", 500);
    }

    // Log the action
    const { logActivity } = await import("@/lib/activity");
    const actorId = admin?.id || user?.id || null;
    await logActivity(
      actorId,
      "order_update",
      "info",
      `Updated order ${id} payment method to ${normalizedPaymentMethod}`
    );

    return apiResponse.success({
      success: true,
      message: "Payment method updated successfully"
    });
  } catch (error) {
    console.error("Failed to update order payment method:", error);
    return apiResponse.error("Failed to update payment method");
  }
}
