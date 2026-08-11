import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { orders, activityLogs } from "@/lib/drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { apiResponse } from "@/lib/api-utils";
import { toReadableOrderId } from "@/utils/orderId";
import { getAdminFromSession, getUserFromSession } from "@/lib/auth";
import { hashOrderAccessToken } from "@/lib/orderUtils";
import { randomUUID } from "node:crypto";
import { rateLimit } from "@/lib/rate-limit";

function getPaymentStatusFromOrderStatus(status: string) {
  const normalized = status.toLowerCase();
  if (["processing", "intransit", "delivered"].includes(normalized)) {
    return "confirmed";
  }
  if (["failed", "cancelled", "canceled"].includes(normalized)) {
    return "failed";
  }
  return "pending";
}

export async function POST(request: NextRequest) {
  let orderId = "";
  let provider = "";

  try {
    const payload = await request.json();
    orderId = payload.orderId;
    provider =
      payload.provider === "hubtel" || payload.provider === "paystack"
        ? payload.provider
        : "";

    if (!orderId) {
      return apiResponse.error("Order ID is required", 400);
    }
    if (!provider) {
      return apiResponse.error("Payment provider is required", 400);
    }

    // Rate limit: 15 verify calls per minute per order
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const rateLimitResult = await rateLimit(
      `payment-verify:${orderId}`,
      15,
      60_000,
    );
    if (!rateLimitResult.success) {
      console.warn("[payment:verify] Rate limit exceeded", { orderId, ip });
      return apiResponse.error(
        "Too many verification attempts. Please wait a moment.",
        429,
      );
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
    
    let orderRes;
    if (isUUID) {
      orderRes = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    } else {
      orderRes = await db.select().from(orders).where(eq(orders.clientReference, orderId)).limit(1);
    }

    if (orderRes.length === 0) {
      return apiResponse.notFound("Order not found");
    }

    const order = orderRes[0];
    const [user, admin] = await Promise.all([
      getUserFromSession(),
      getAdminFromSession(),
    ]);
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
      return apiResponse.success({
        status: order.status,
        paymentStatus: getPaymentStatusFromOrderStatus(order.status || ""),
      });
    }

    let verified = false;
    let providerStatus = "";
    let verifiedAmount: number | null = null;

    if (provider === "hubtel") {
      const { verifyHubtelTransaction, normalizeHubtelStatus } = await import(
        "@/lib/hubtel"
      );
      const targetRef = order.clientReference || toReadableOrderId(order.id);
      const result = await verifyHubtelTransaction(targetRef);
      verified = result.verified;
      providerStatus = normalizeHubtelStatus(result.status || "");
      verifiedAmount = result.amount;

      if (
        !verified &&
        (providerStatus === "Failed" || providerStatus === "Cancelled")
      ) {
        console.log("[payment:verify]", {
          provider,
          orderId: order.id,
          event: "provider_declined",
          providerStatus,
        });
        return apiResponse.success({
          status: order.status,
          paymentStatus: "failed",
          hubtelStatus: result.status,
          verified: false,
        });
      }
    } else if (provider === "paystack") {
      const PAYSTACK_SECRET =
        process.env.PAYSTACK_SECRET || process.env.PAYSTACK_SECRET_KEY;
      if (PAYSTACK_SECRET) {
        try {
          const paystackRef = order.id;
          const resp = await fetch(
            `https://api.paystack.co/transaction/verify/${paystackRef}`,
            {
              headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET}`,
              },
              signal: AbortSignal.timeout(10_000),
            },
          );
          const data = await resp.json();
          verified = Boolean(data.status && data.data?.status === "success");
          providerStatus = data.data?.status || "failed";
          verifiedAmount = data.data?.amount ? data.data.amount / 100 : null;

          if (
            !verified &&
            ["failed", "abandoned", "reversed"].includes(providerStatus)
          ) {
            console.log("[payment:verify]", {
              provider,
              orderId: order.id,
              event: "provider_declined",
              providerStatus,
            });
            return apiResponse.success({
              status: order.status,
              paymentStatus: "failed",
              paystackStatus: providerStatus,
              verified: false,
            });
          }
        } catch (err) {
          console.error("[payment:verify]", {
            provider,
            orderId: order.id,
            event: "provider_fetch_error",
            error: err instanceof Error ? err.message : err,
          });
          if (process.env.NODE_ENV === "development") {
            verified = true;
            verifiedAmount = Number(order.total);
          }
        }
      } else if (process.env.NODE_ENV === "development") {
        verified = true;
        verifiedAmount = Number(order.total);
      }
    }

    if (verified) {
      const orderTotal = Number(order.total);
      if (verifiedAmount !== null && verifiedAmount < orderTotal) {
        console.error("[payment:verify]", {
          event: "amount_mismatch",
          provider,
          orderId,
          expected: orderTotal,
          received: verifiedAmount,
        });
        return apiResponse.error("Payment amount mismatch detected", 400);
      }

      try {
        await db.transaction(async (tx) => {
          const checkRes = await tx.execute(
            sql`SELECT status FROM orders WHERE id = ${order.id} FOR UPDATE`
          );

          if (checkRes.rows[0].status === "pending") {
            await tx.update(orders)
              .set({
                status: "processing",
                paymentStatus: "confirmed",
                paymentMessage: `Payment verified via ${provider}`
              })
              .where(eq(orders.id, order.id));

            await tx.insert(activityLogs).values({
              id: randomUUID(),
              action: "order_payment",
              type: "success",
              details: `Payment manually verified via ${provider}. Reference: ${order.id}`,
              adminId: null,
              createdAt: new Date().toISOString(),
            });

            console.log("[payment:verify]", {
              event: "order_confirmed",
              provider,
              orderId: order.id,
              newStatus: "processing",
            });

            // Trigger confirmation notification
            try {
              const { notificationService } = await import("@/lib/notifications");
              const parsedItems =
                typeof order.items === "string"
                  ? JSON.parse(order.items)
                  : order.items;
              const parsedShipping =
                typeof order.shippingInfo === "string"
                  ? JSON.parse(order.shippingInfo)
                  : order.shippingInfo;

              notificationService
                .sendOrderConfirmation(
                  order.id,
                  parsedShipping,
                  parsedItems,
                  Number(order.total),
                  order.paymentMethod || undefined,
                )
                .catch((err) =>
                  console.error("[payment:verify] Confirmation notification failed:", {
                    orderId: order.id,
                    error: err instanceof Error ? err.message : err,
                  }),
                );
            } catch (err) {
              console.error(
                "[payment:verify] Failed to import/call notificationService:",
                {
                  orderId: order.id,
                  error: err instanceof Error ? err.message : err,
                },
              );
            }
          }
        });
        
        return apiResponse.success({
          status: "processing",
          paymentStatus: "confirmed",
          verified: true,
        });
      } catch (err) {
        console.error("[payment:verify]", {
          event: "db_error",
          provider,
          orderId: order.id,
          error: err instanceof Error ? err.message : err,
        });
        return apiResponse.error("Database error during verification", 500);
      }
    }

    return apiResponse.success({
      status: order.status,
      paymentStatus: "pending",
      verified: false,
    });
  } catch (err) {
    console.error("[payment:verify]", {
      event: "unhandled_error",
      orderId,
      provider,
      error: err instanceof Error ? err.message : err,
    });
    return apiResponse.error("Server error");
  }
}
