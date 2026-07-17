import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { apiResponse } from "@/lib/api-utils";
import { getUserFromSession, getAdminFromSession } from "@/lib/auth";
import { hashOrderAccessToken } from "@/lib/orderUtils";
import { toReadableOrderId } from "@/utils/orderId";

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

    // Use host header to get the exact domain the user is accessing (e.g. sherohq.com or shop.sherohq.com)
    // This avoids Vercel's internal localhost/0.0.0.0 origins leaking into webhooks
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const publicUrl = process.env.NEXT_PUBLIC_SITE_URL && process.env.NODE_ENV === "development"
      ? process.env.NEXT_PUBLIC_SITE_URL 
      : `${protocol}://${host}`;

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
      // Redirect customer to confirmation page after payment (webhook handles server-side processing)
      const callback_url = `${publicUrl.replace(/\/$/, "")}/shop/checkout/success?orderId=${orderId}`;

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
      const { buildHubtelAuth, getHubtelMerchantAccount, HUBTEL_API_BASE } = await import("@/lib/hubtel");
      const auth = buildHubtelAuth();
      const merchantAccountNumber = getHubtelMerchantAccount();

      if (!auth || !merchantAccountNumber) {
        return apiResponse.error("Hubtel not configured on server", 500);
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

      if (process.env.NODE_ENV !== "production") {
        console.log("=== HUBTEL INIT PAYLOAD ===");
        console.log(JSON.stringify(payload, null, 2));
      }

      try {
        const resp = await fetch(`${HUBTEL_API_BASE}/items/initiate`, {
          method: "POST",
          headers: {
            Authorization: auth,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await resp.json();
        
        if (!resp.ok || !data?.data?.checkoutUrl) {
          console.error("Hubtel initialize failed:", data);
          return apiResponse.error("Failed to initialize Hubtel payment", 502);
        }

        return apiResponse.success({
          checkoutUrl: data.data.checkoutUrl,
          provider: "hubtel",
          readableOrderId: toReadableOrderId(orderId),
        });
      } catch (err) {
        console.error("Hubtel initialize network error:", err);
        return apiResponse.error("Failed to connect to Hubtel", 502);
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
