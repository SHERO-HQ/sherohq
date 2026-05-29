import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { apiResponse } from "@/lib/api-utils";
import { getUserFromSession, getAdminFromSession } from "@/lib/auth";
import { createHash } from "node:crypto";

const hashOrderAccessToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

const toReadableOrderId = (orderId: string): string => {
  const compact = String(orderId ?? "")
    .replace(/-/g, "")
    .trim();
  if (!compact) return "ORD-UNKNOWN";
  return `ORD-${compact.slice(0, 8).toUpperCase()}`;
};

export async function POST(request: NextRequest) {
  try {
    const { orderId, description, provider } = await request.json();

    const orderRes = await query(
      `SELECT "shippingInfo", total, status, "userId", "orderAccessTokenHash" FROM orders WHERE id = $1`,
      [orderId],
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
      return apiResponse.error(
        "Payment can only be initialized for pending orders",
        400,
      );
    }

    const publicUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Provider-specific initializations
    if (provider === "paystack") {
      const PAYSTACK_SECRET =
        process.env.PAYSTACK_SECRET || process.env.PAYSTACK_SECRET_KEY;
      if (!PAYSTACK_SECRET) {
        return apiResponse.error("Paystack not configured on server", 500);
      }

      const shipping = order.shippingInfo || {};
      const email = shipping.email || "customers@unknown.local";

      // Paystack expects amount in the smallest currency unit (e.g., kobo/pesewa)
      const amount = Math.round((order.total ?? 0) * 100);
      const callback_url = `${publicUrl.replace(/\/$/, "")}/api/payments/webhook`;

      const resp = await fetch(
        "https://api.paystack.co/transaction/initialize",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            amount,
            reference: orderId,
            callback_url,
            metadata: { orderId },
          }),
        },
      );

      const data = await resp.json();
      if (!data || !data.status) {
        console.error("Paystack initialize failed:", data);
        return apiResponse.error("Failed to initialize Paystack payment", 502);
      }

      return apiResponse.success({
        checkoutUrl: data.data.authorization_url,
        provider: "paystack",
        reference: data.data.reference,
        readableOrderId: toReadableOrderId(orderId),
      });
    }

    if (provider === "hubtel") {
      // Optional: proxy to a configured Hubtel initializer if available
      const HUBTEL_INITIALIZE_URL = process.env.HUBTEL_INITIALIZE_URL;
      if (HUBTEL_INITIALIZE_URL) {
        try {
          const resp = await fetch(HUBTEL_INITIALIZE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId, description }),
          });
          const data = await resp.json();
          if (data?.checkoutUrl) {
            return apiResponse.success({
              checkoutUrl: data.checkoutUrl,
              provider: "hubtel",
              readableOrderId: toReadableOrderId(orderId),
            });
          }
        } catch (err) {
          console.error("Hubtel proxy failed:", err);
        }
      }
    }

    // Fallback: return a mock checkout URL so frontend flows keep working in dev
    const checkoutUrl = `${publicUrl}/checkout/mock-payment?orderId=${orderId}&provider=${provider || "unknown"}`;
    return apiResponse.success({
      checkoutUrl,
      readableOrderId: toReadableOrderId(orderId),
    });
  } catch (error) {
    console.error("Payment init error:", error);
    return apiResponse.error("Failed to initialize payment");
  }
}
