import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { apiResponse } from "@/lib/api-utils";
import { getUserFromSession, getAdminFromSession } from "@/lib/auth";
import { hashOrderAccessToken } from "@/lib/orderUtils";
import { toReadableOrderId } from "@/utils/orderId";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  let orderId: string = "";
  let normalizedProvider: "hubtel" | "paystack" | undefined;
  let description: string | undefined;

  try {
    const body = await request.json();
    orderId = body.orderId || "";
    const provider = body.provider;
    description = body.description;
    normalizedProvider =
      provider === "hubtel" || provider === "paystack" ? provider : undefined;

    if (!normalizedProvider) {
      return apiResponse.error("Payment provider is required", 400);
    }

    // Rate limit: 5 initialize calls per minute per order
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const rateLimitResult = await rateLimit(
      `payment-init:${orderId ?? ip}`,
      5,
      60_000,
    );
    if (!rateLimitResult.success) {
      console.warn("[payment:initialize] Rate limit exceeded", { orderId, ip });
      return apiResponse.error(
        "Too many payment requests. Please wait a moment.",
        429,
      );
    }

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

    // Use host header to get the exact domain the user is accessing (e.g. sherohq.com or shop.sherohq.com)
    // This avoids Vercel's internal localhost/0.0.0.0 origins leaking into webhooks
    const host = request.headers.get("host") || "localhost:3000";
    const protocol =
      request.headers.get("x-forwarded-proto") ||
      (host.includes("localhost") ? "http" : "https");
    const publicUrl =
      process.env.NEXT_PUBLIC_SITE_URL && process.env.NODE_ENV === "development"
        ? process.env.NEXT_PUBLIC_SITE_URL
        : `${protocol}://${host}`;

    // Provider-specific initializations
    if (normalizedProvider === "paystack") {
      return await initializePaystackTransaction(order, orderId, publicUrl);
    }

    if (normalizedProvider === "hubtel") {
      const { buildHubtelAuth, getHubtelMerchantAccount, HUBTEL_API_BASE } =
        await import("@/lib/hubtel");
      const auth = buildHubtelAuth();
      const merchantAccountNumber = getHubtelMerchantAccount();

      if (!auth || !merchantAccountNumber) {
        return apiResponse.error(
          "Hubtel payment setup is incomplete. Please contact support.",
          503,
        );
      }

      const readableId = toReadableOrderId(orderId);
      const callbackUrl = `${publicUrl.replace(/\/$/, "")}/api/payments/webhook`;
      const returnUrl = `${publicUrl.replace(/\/$/, "")}/shop/checkout/success?orderId=${readableId}`;
      // Separate cancellation URL with status param so frontend shows failure instantly
      const cancelUrl = `${publicUrl.replace(/\/$/, "")}/shop/checkout/success?orderId=${readableId}&status=Cancelled`;

      const payload = {
        totalAmount: Math.round((order.total ?? 0) * 100) / 100,
        description: description || `Order ${toReadableOrderId(orderId)}`,
        callbackUrl,
        returnUrl,
        cancellationUrl: cancelUrl,
        merchantAccountNumber,
        clientReference: readableId,
      };

      console.log("[payment:initialize]", {
        provider: "hubtel",
        orderId,
        callbackUrl,
        returnUrl,
        amount: payload.totalAmount,
      });

      try {
        const resp = await fetch(`${HUBTEL_API_BASE}/items/initiate`, {
          method: "POST",
          headers: {
            Authorization: auth,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10_000),
        });

        const data = await resp.json();

        if (!resp.ok || !data?.data?.checkoutUrl) {
          console.error("[payment:initialize]", {
            provider: "hubtel",
            orderId,
            event: "init_failed",
            response: data,
          });
          return apiResponse.error(
            "We couldn't start the Hubtel payment flow. Please try again or contact support.",
            502,
          );
        }

        return apiResponse.success({
          checkoutUrl: data.data.checkoutUrl,
          provider: "hubtel",
          readableOrderId: toReadableOrderId(orderId),
        });
      } catch (err) {
        console.error("[payment:initialize]", {
          provider: "hubtel",
          orderId,
          event: "network_error",
          error: err instanceof Error ? err.message : err,
        });
        return apiResponse.error(
          "We couldn't reach the Hubtel payment service. Please try again or contact support.",
          502,
        );
      }
    }

    return apiResponse.error("Unsupported payment provider", 400);
  } catch (error) {
    console.error("[payment:initialize]", {
      orderId,
      provider: normalizedProvider,
      event: "unhandled_error",
      error: error instanceof Error ? error.message : error,
    });
    return apiResponse.error("Failed to initialize payment");
  }
}

async function initializePaystackTransaction(
  order: any,
  orderId: string,
  publicUrl: string,
) {
  const PAYSTACK_SECRET =
    process.env.PAYSTACK_SECRET || process.env.PAYSTACK_SECRET_KEY;
  if (!PAYSTACK_SECRET) {
    return apiResponse.error("Paystack not configured on server", 500);
  }

  const shipping = order.shippingInfo || {};
  const email = shipping.email || "customers@unknown.local";

  // Paystack expects amount in the smallest currency unit (e.g., kobo/pesewa)
  const amount = Math.round((order.total ?? 0) * 100);

  // Redirect customer to confirmation page after payment
  const readableId = toReadableOrderId(orderId);
  const callback_url = `${publicUrl.replace(/\/$/, "")}/shop/checkout/success?orderId=${readableId}`;

  const resp = await fetch("https://api.paystack.co/transaction/initialize", {
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
    signal: AbortSignal.timeout(10_000),
  });

  const data = await resp.json();
  if (!data || !data.status) {
    console.error("[payment:initialize]", {
      provider: "paystack",
      orderId,
      event: "init_failed",
      response: data,
    });
    return apiResponse.error("Failed to initialize Paystack payment", 502);
  }

  return apiResponse.success({
    checkoutUrl: data.data.authorization_url,
    provider: "paystack",
    reference: data.data.reference,
    readableOrderId: toReadableOrderId(orderId),
  });
}
