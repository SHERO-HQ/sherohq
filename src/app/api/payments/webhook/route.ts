import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, activityLogs } from "@/lib/drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { apiResponse } from "@/lib/api-utils";
import { createHmac, timingSafeEqual, randomUUID } from "node:crypto";

function isValidPaystackSignature(rawBody: string, signature: string | null) {
  const secret = (
    process.env.PAYSTACK_SECRET || process.env.PAYSTACK_SECRET_KEY
  )?.trim();
  if (!secret || !signature) return false;

  const digest = createHmac("sha512", secret).update(rawBody).digest("hex");
  const expected = Buffer.from(digest, "utf8");
  const received = Buffer.from(signature, "utf8");

  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

export async function POST(request: NextRequest) {
  let provider = "";
  let orderId = "";

  try {
    const rawBody = await request.text();

    if (process.env.NODE_ENV !== "production") {
      console.log("[payment:webhook] incoming", {
        contentLength: rawBody.length,
        contentType: request.headers.get("content-type"),
      });
    }

    const data = JSON.parse(rawBody);
    let status = "";
    let verifiedAmount: number | null = null;

    // ── Paystack webhook ──────────────────────────────────────────────────────
    if (data.event?.startsWith("charge.") && data.data) {
      const signature = request.headers.get("x-paystack-signature");
      if (!isValidPaystackSignature(rawBody, signature)) {
        console.warn("[payment:webhook] Invalid Paystack HMAC signature");
        return new NextResponse("Invalid Paystack signature", { status: 401 });
      }

      provider = "paystack";
      orderId = data.data.metadata?.orderId || data.data.reference;

      if (data.event === "charge.success") {
        status = "Success";
        verifiedAmount = data.data.amount / 100;
      } else if (
        data.event === "charge.failed" ||
        data.event === "charge.reversed"
      ) {
        // Paystack-side decline — treat as a failure that needs DB update + notification
        status = "Failed";
        console.log("[payment:webhook]", {
          event: data.event,
          provider: "paystack",
          orderId,
          paystackStatus: data.data?.status,
        });
      } else {
        // Other Paystack events (e.g. transfer.success) — not relevant
        return new NextResponse("Event ignored", { status: 200 });
      }

      // ── Hubtel webhook ────────────────────────────────────────────────────────
    } else if (
      (data.Data?.ClientReference && (data.Status || data.Data?.Status)) ||
      (data.ClientReference && data.Status && !data.event)
    ) {
      const { normalizeHubtelStatus, verifyHubtelTransaction } =
        await import("@/lib/hubtel");

      provider = "hubtel";

      const nested = data.Data;
      orderId = nested?.ClientReference || data.ClientReference;

      const rawStatus = nested?.Status || data.Status;
      status = normalizeHubtelStatus(rawStatus);

      if (process.env.NODE_ENV !== "production") {
        console.log("[payment:webhook]", {
          provider: "hubtel",
          clientReference: orderId,
          rawStatus,
          normalizedStatus: status,
          checkoutId: nested?.CheckoutId ?? "N/A",
          salesInvoiceId: nested?.SalesInvoiceId ?? "N/A",
          amount: nested?.Amount ?? data.Amount ?? "N/A",
          customerPhone:
            nested?.CustomerPhoneNumber ?? data.CustomerMsisdn ?? "N/A",
          paymentType:
            nested?.PaymentDetails?.PaymentType ?? data.PaymentMethod ?? "N/A",
          channel: nested?.PaymentDetails?.Channel ?? "N/A",
          topLevelResponseCode: data.ResponseCode ?? "N/A",
        });
      }

      // console.log("[payment:webhook]", {
      //   provider: "hubtel",
      //   clientReference: orderId,
      //   rawStatus,
      //   normalizedStatus: status,
      //   checkoutId: nested?.CheckoutId ?? "N/A",
      //   salesInvoiceId: nested?.SalesInvoiceId ?? "N/A",
      //   amount: nested?.Amount ?? data.Amount ?? "N/A",
      //   customerPhone:
      //     nested?.CustomerPhoneNumber ?? data.CustomerMsisdn ?? "N/A",
      //   paymentType:
      //     nested?.PaymentDetails?.PaymentType ?? data.PaymentMethod ?? "N/A",
      //   channel: nested?.PaymentDetails?.Channel ?? "N/A",
      //   topLevelResponseCode: data.ResponseCode ?? "N/A"});

      // Server-side verification: confirm with Hubtel's API before trusting the webhook
      if (status === "Success") {
        const checkoutId = nested?.CheckoutId;
        const {
          verified,
          status: confirmedStatus,
          amount: confirmedAmount,
        } = await verifyHubtelTransaction(orderId, checkoutId);

        verifiedAmount = confirmedAmount;

        const hasValidHubtelTokens = Boolean(
          nested?.CheckoutId || nested?.SalesInvoiceId,
        );

        if (
          !verified &&
          !hasValidHubtelTokens &&
          process.env.NODE_ENV === "production"
        ) {
          console.warn("[payment:webhook]", {
            provider: "hubtel",
            orderId,
            event: "verification_mismatch",
            webhookClaimed: "Success",
            hubtelApiReturned: confirmedStatus,
          });
          return NextResponse.json(
            { success: false, message: "Transaction verification failed" },
            { status: 200 },
          );
        }
      }
    } else {
      console.warn("[payment:webhook] Unknown webhook format received", {
        keys: Object.keys(data),
      });
      return new NextResponse("Unknown webhook format", { status: 400 });
    }

    // ── Database update ───────────────────────────────────────────────────────
    await db.transaction(async (tx) => {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
      const queryCondition = isUUID ? eq(orders.id, orderId) : eq(orders.clientReference, orderId);

      const orderRes = await tx.execute(
        sql`SELECT id, status, "shippingInfo", items, total, "paymentMethod", "paymentStatus"
         FROM orders
         WHERE ${queryCondition}
         FOR UPDATE`
      );

      if (orderRes.rowCount === 0) {
        console.error("[payment:webhook]", { event: "order_not_found", provider, clientReference: orderId });
        throw new Error("ORDER_NOT_FOUND");
      }

      const order = orderRes.rows[0] as any;
      const actualOrderId = order.id as string;

      if (status === "Success") {
        const orderTotal = Number(order.total);

        if (verifiedAmount !== null && verifiedAmount < orderTotal) {
          console.error("[payment:webhook]", { event: "amount_mismatch", provider, orderId: actualOrderId, expected: orderTotal, received: verifiedAmount });
          await tx.insert(activityLogs).values({
            id: randomUUID(), action: "order_payment", type: "failed",
            details: `Amount mismatch via ${provider}. Expected: GHS ${orderTotal}, Received: GHS ${verifiedAmount}`
          });
          throw new Error("AMOUNT_MISMATCH");
        }

        if (order.status === "pending") {
          await tx.update(orders)
            .set({ status: "processing", paymentStatus: "confirmed", paymentMessage: `Payment confirmed via ${provider}` })
            .where(eq(orders.id, actualOrderId));

          await tx.insert(activityLogs).values({
            id: randomUUID(), action: "order_payment", type: "success",
            details: `Payment confirmed via ${provider}. Reference: ${actualOrderId}`
          });

          console.log("[payment:webhook]", { event: "order_confirmed", provider, orderId: actualOrderId, newStatus: "processing" });

          try {
            const { notificationService } = await import("@/lib/notifications");
            const parsedItems = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
            const parsedShipping = typeof order.shippingInfo === "string" ? JSON.parse(order.shippingInfo) : order.shippingInfo;

            notificationService.sendOrderConfirmation(actualOrderId, parsedShipping, parsedItems, Number(order.total), order.paymentMethod)
              .catch((err) => console.error("[payment:webhook] Confirmation notification failed:", { orderId: actualOrderId, error: err instanceof Error ? err.message : err }));
          } catch (err) {
            console.error("[payment:webhook] Failed to import notificationService:", { orderId: actualOrderId, error: err instanceof Error ? err.message : err });
          }
        } else {
          console.log("[payment:webhook]", { event: "order_already_processed", provider, orderId: actualOrderId, currentStatus: order.status });
        }
      } else {
        if (order.status !== "pending") {
          console.log("[payment:webhook]", { event: "failure_skipped_not_pending", provider, orderId: actualOrderId, currentStatus: order.status });
          return;
        }

        await tx.update(orders)
          .set({ paymentStatus: "failed", paymentMessage: `Payment failed via ${provider}` })
          .where(eq(orders.id, actualOrderId));

        await tx.insert(activityLogs).values({
          id: randomUUID(), action: "order_payment", type: "failed",
          details: `Payment failed via ${provider}. Reference: ${actualOrderId}`
        });

        console.log("[payment:webhook]", { event: "payment_failed", provider, orderId: actualOrderId });

        try {
          const { notificationService } = await import("@/lib/notifications");
          const parsedShipping = typeof order.shippingInfo === "string" ? JSON.parse(order.shippingInfo) : order.shippingInfo;

          notificationService.sendPaymentFailureNotification(actualOrderId, parsedShipping)
            .catch((err) => console.error("[payment:webhook] Failure notification failed:", { orderId: actualOrderId, error: err instanceof Error ? err.message : err }));
        } catch (err) {
          console.error("[payment:webhook] Failed to import notificationService for failure:", { orderId: actualOrderId, error: err instanceof Error ? err.message : err });
        }
      }
    });
    
    return apiResponse.success({ received: true });
  } catch (error: any) {
    if (error.message === "ORDER_NOT_FOUND") return apiResponse.error("Order not found", 404);
    if (error.message === "AMOUNT_MISMATCH") return apiResponse.error("Amount mismatch", 400);
    
    console.error("[payment:webhook]", { event: "unhandled_error", provider, orderId, error: error instanceof Error ? error.message : error });
    return apiResponse.error("Internal Error", 500);
  }
}
