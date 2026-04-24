import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { apiResponse } from "@/lib/api-utils";
import { getUserFromSession, getAdminFromSession } from "@/lib/auth";
import { createHash } from "node:crypto";

const hashOrderAccessToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

const toReadableOrderId = (orderId: string): string => {
  const compact = String(orderId ?? "").replace(/-/g, "").trim();
  if (!compact) return "ORD-UNKNOWN";
  return `ORD-${compact.slice(0, 8).toUpperCase()}`;
};

export async function POST(request: NextRequest) {
  try {
    const { orderId, description, provider } = await request.json();

    const orderRes = await query(
      `SELECT "shippingInfo", total, status, "userId", "orderAccessTokenHash" FROM orders WHERE id = $1`,
      [orderId]
    );

    if (orderRes.rowCount === 0) return apiResponse.notFound("Order not found");

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

    if (!isAuthorized) return apiResponse.unauthorized();

    if (order.status !== "pending") {
      return apiResponse.error("Payment can only be initialized for pending orders", 400);
    }

    // In a real app, you'd call a payment service here.
    // For now, we return a mock URL or mirror legacy behavior if services/PaymentService is available.
    const publicUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const checkoutUrl = `${publicUrl}/checkout/mock-payment?orderId=${orderId}&provider=${provider}`;

    return apiResponse.success({ checkoutUrl });
  } catch (error) {
    console.error("Payment init error:", error);
    return apiResponse.error("Failed to initialize payment");
  }
}
