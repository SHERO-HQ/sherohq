import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { apiResponse, validateCsrf } from "@/lib/api-utils";
import { getUserFromSession, getAdminFromSession } from "@/lib/auth";
import { verifyOrderAccessToken } from "@/lib/orderUtils";
import { toReadableOrderId } from "@/utils/orderId";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  
    const csrfError = await validateCsrf(request);
    if (csrfError) return csrfError;
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

    const orderRes = await db.select({
      id: orders.id,
      shippingInfo: orders.shippingInfo,
      total: orders.total,
      status: orders.status,
      userId: orders.userId,
      orderAccessTokenHash: orders.orderAccessTokenHash,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.id, orderId));

    if (orderRes.length === 0) return apiResponse.notFound("Order not found");

    const order = orderRes[0];
    const user = await getUserFromSession();
    const admin = await getAdminFromSession();

    const tokenHeader = request.headers.get("x-order-access-token");
    const hasValidOrderAccessToken = verifyOrderAccessToken(tokenHeader, order);

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

    // Use host header to get the exact domain the user is accessing
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
      const cancelUrl = `${publicUrl.replace(/\/$/, "")}/shop/checkout/success?orderId=${readableId}&status=Cancelled`;

      const cleanDescription = (
        description || `Order ${readableId}`
      )
        .replace(/#/g, "")
        .trim();

      const payload = {
        totalAmount: Math.round(Number(order.total || 0) * 100) / 100,
        description: cleanDescription,
        callbackUrl,
        returnUrl,
        cancellationUrl: cancelUrl,
        merchantAccountNumber,
        clientReference: readableId,
      };

      console.log(
        "[payment:initialize:request]",
        JSON.stringify(
          {
            provider: "hubtel",
            orderId,
            readableOrderId: readableId,
            payload,
          },
          null,
          2,
        ),
      );

      try {
        const resp = await fetch(`${HUBTEL_API_BASE}/items/initiate`, {
          method: "POST",
          headers: {
            Authorization: auth,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(20_000),
        });

        const data = await resp.json();

        console.log(
          "[payment:initialize:response]",
          JSON.stringify(
            {
              provider: "hubtel",
              orderId,
              status: resp.status,
              statusText: resp.statusText,
              hubtelResponse: data,
            },
            null,
            2,
          ),
        );

        const checkoutUrl =
          data?.data && typeof data.data === "object" && !Array.isArray(data.data)
            ? data.data.checkoutUrl
            : undefined;

        if (!resp.ok || !checkoutUrl) {
          const extractedErrors = Array.isArray(data?.data)
            ? data.data
                .map(
                  (item: any) =>
                    item.message ||
                    item.error ||
                    `${item.field || item.name || "error"}: ${item.error || item.message || JSON.stringify(item)}`,
                )
                .join("; ")
            : data?.message || "Payment initialization failed";

          console.error(
            "[payment:initialize:failed]",
            JSON.stringify(
              {
                provider: "hubtel",
                orderId,
                event: "init_failed",
                response: data,
                extractedErrors,
              },
              null,
              2,
            ),
          );
          return apiResponse.error(
            process.env.NODE_ENV === "development" && extractedErrors
              ? `Hubtel Error: ${extractedErrors}`
              : "We couldn't start the Hubtel payment flow. Please try again or contact support.",
            502,
          );
        }

        return apiResponse.success({
          checkoutUrl: data.data.checkoutUrl,
          checkoutId: data.data.checkoutId,
          clientReference: readableId,
          provider: "hubtel",
          readableOrderId: readableId,
          hubtelResponse: data,
        });
      } catch (err) {
        console.error(
          "[payment:initialize]",
          JSON.stringify(
            {
              provider: "hubtel",
              orderId,
              event: "network_error",
              error: err instanceof Error ? err.message : err,
            },
            null,
            2,
          ),
        );
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

  // Handle parsing stringified JSON safely since we bypassed the parser wrapper here
  const shipping = typeof order.shippingInfo === 'string' ? JSON.parse(order.shippingInfo) : (order.shippingInfo || {});
  const email = shipping.email || "customers@unknown.local";

  const amount = Math.round(Number(order.total || 0) * 100);

  const readableId = toReadableOrderId(orderId);
  const callback_url = `${publicUrl.replace(/\/$/, "")}/shop/checkout/success?orderId=${readableId}`;

  console.log(
    "[payment:initialize:request]",
    JSON.stringify(
      {
        provider: "paystack",
        orderId,
        email,
        amount,
        callback_url,
      },
      null,
      2,
    ),
  );

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
    signal: AbortSignal.timeout(20_000),
  });

  const data = await resp.json();

  console.log(
    "[payment:initialize:response]",
    JSON.stringify(
      {
        provider: "paystack",
        orderId,
        status: resp.status,
        paystackResponse: data,
      },
      null,
      2,
    ),
  );

  if (!data || !data.status) {
    console.error(
      "[payment:initialize:failed]",
      JSON.stringify(
        {
          provider: "paystack",
          orderId,
          event: "init_failed",
          response: data,
        },
        null,
        2,
      ),
    );
    return apiResponse.error("Failed to initialize Paystack payment", 502);
  }

  return apiResponse.success({
    checkoutUrl: data.data.authorization_url,
    provider: "paystack",
    reference: data.data.reference,
    readableOrderId: toReadableOrderId(orderId),
  });
}
