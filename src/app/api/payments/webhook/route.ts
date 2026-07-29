import { NextRequest, NextResponse } from "next/server";
import { query, getClient } from "@/lib/db";
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
  let client: any = null;
  let provider = "";
  let orderId = "";

  try {
    const rawBody = await request.text();

    console.log("[payment:webhook] incoming", {
      contentLength: rawBody.length,
      contentType: request.headers.get("content-type"),
    });

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

      // Server-side verification: confirm with Hubtel's API before trusting the webhook
      if (status === "Success") {
        const {
          verified,
          status: confirmedStatus,
          amount: confirmedAmount,
        } = await verifyHubtelTransaction(orderId);

        verifiedAmount = confirmedAmount;

        const hasValidHubtelTokens = Boolean(nested?.CheckoutId || nested?.SalesInvoiceId);

        if (!verified && !hasValidHubtelTokens && process.env.NODE_ENV === "production") {
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
    client = await getClient();
    await client.query("BEGIN");

    // Extract UUID if orderId is a UUID, otherwise it's a clientReference
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
    const queryCondition = isUUID ? `id = $1` : `"clientReference" = $1`;

    const orderRes = await client.query(
      `SELECT id, status, "shippingInfo", items, total, "paymentMethod", "paymentStatus"
       FROM orders
       WHERE ${queryCondition}
       FOR UPDATE`,
      [orderId],
    );

    if (orderRes.rowCount === 0) {
      await client.query("ROLLBACK");
      console.error("[payment:webhook]", {
        event: "order_not_found",
        provider,
        clientReference: orderId,
      });
      return new NextResponse("Order not found", { status: 404 });
    }

    const order = orderRes.rows[0];
    const actualOrderId = order.id;

    if (status === "Success") {
      const orderTotal = Number(order.total);

      if (verifiedAmount !== null && verifiedAmount < orderTotal) {
        console.error("[payment:webhook]", {
          event: "amount_mismatch",
          provider,
          orderId: actualOrderId,
          expected: orderTotal,
          received: verifiedAmount,
        });
        await client.query(
          `INSERT INTO activity_logs (id, action, type, details, "createdAt")
           VALUES ($1, $2, $3, $4, NOW())`,
          [
            randomUUID(),
            "order_payment",
            "failed",
            `Amount mismatch via ${provider}. Expected: GHS ${orderTotal}, Received: GHS ${verifiedAmount}`,
          ],
        );
        await client.query("COMMIT");
        return new NextResponse("Amount mismatch", { status: 400 });
      }

      if (order.status === "pending") {
        await client.query(
          `UPDATE orders
           SET status = $1, "paymentStatus" = $2, "paymentMessage" = $3
           WHERE id = $4`,
          [
            "processing",
            "confirmed",
            `Payment confirmed via ${provider}`,
            actualOrderId,
          ],
        );

        await client.query(
          `INSERT INTO activity_logs (id, action, type, details, "createdAt")
           VALUES ($1, $2, $3, $4, NOW())`,
          [
            randomUUID(),
            "order_payment",
            "success",
            `Payment confirmed via ${provider}. Reference: ${actualOrderId}`,
          ],
        );

        console.log("[payment:webhook]", {
          event: "order_confirmed",
          provider,
          orderId: actualOrderId,
          newStatus: "processing",
        });

        // Trigger order confirmation notification
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
              actualOrderId,
              parsedShipping,
              parsedItems,
              Number(order.total),
              order.paymentMethod,
            )
            .catch((err) =>
              console.error("[payment:webhook] Confirmation notification failed:", {
                orderId: actualOrderId,
                error: err instanceof Error ? err.message : err,
              }),
            );
        } catch (err) {
          console.error("[payment:webhook] Failed to import notificationService:", {
            orderId: actualOrderId,
            error: err instanceof Error ? err.message : err,
          });
        }
      } else {
        console.log("[payment:webhook]", {
          event: "order_already_processed",
          provider,
          orderId: actualOrderId,
          currentStatus: order.status,
        });
      }
    } else {
      // Payment failed / cancelled
      // Idempotency: only act on still-pending orders
      if (order.status !== "pending") {
        await client.query("COMMIT");
        console.log("[payment:webhook]", {
          event: "failure_skipped_not_pending",
          provider,
          orderId: actualOrderId,
          currentStatus: order.status,
        });
        return new NextResponse("OK", { status: 200 });
      }

      // Write failure outcome — keep order pending so customer can retry
      await client.query(
        `UPDATE orders
         SET "paymentStatus" = $1, "paymentMessage" = $2
         WHERE id = $3`,
        ["failed", `Payment failed via ${provider}`, actualOrderId],
      );

      await client.query(
        `INSERT INTO activity_logs (id, action, type, details, "createdAt")
         VALUES ($1, $2, $3, $4, NOW())`,
        [
          randomUUID(),
          "order_payment",
          "failed",
          `Payment failed via ${provider}. Reference: ${actualOrderId}`,
        ],
      );

      console.log("[payment:webhook]", {
        event: "payment_failed",
        provider,
        orderId: actualOrderId,
      });

      // Trigger failure notification
      try {
        const { notificationService } = await import("@/lib/notifications");
        const parsedShipping =
          typeof order.shippingInfo === "string"
            ? JSON.parse(order.shippingInfo)
            : order.shippingInfo;

        notificationService
          .sendPaymentFailureNotification(actualOrderId, parsedShipping)
          .catch((err) =>
            console.error("[payment:webhook] Failure notification failed:", {
              orderId: actualOrderId,
              error: err instanceof Error ? err.message : err,
            }),
          );
      } catch (err) {
        console.error("[payment:webhook] Failed to import notificationService for failure:", {
          orderId: actualOrderId,
          error: err instanceof Error ? err.message : err,
        });
      }
    }

    await client.query("COMMIT");
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    if (client) await client.query("ROLLBACK");
    console.error("[payment:webhook]", {
      event: "unhandled_error",
      provider,
      orderId,
      error: error instanceof Error ? error.message : error,
    });
    return new NextResponse("Internal Error", { status: 500 });
  } finally {
    if (client) client.release();
  }
}
