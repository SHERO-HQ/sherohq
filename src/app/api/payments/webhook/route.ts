import { NextRequest, NextResponse } from "next/server";
import { query, getClient } from "@/lib/db";
import { createHmac, timingSafeEqual, randomUUID } from "node:crypto";

function isValidPaystackSignature(rawBody: string, signature: string | null) {
  const secret = process.env.PAYSTACK_SECRET || process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;

  const digest = createHmac("sha512", secret).update(rawBody).digest("hex");
  const expected = Buffer.from(digest, "utf8");
  const received = Buffer.from(signature, "utf8");

  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

export async function POST(request: NextRequest) {
  let client: any = null;
  try {
    const rawBody = await request.text();
    
    // Log the exact raw payload for debugging with Hubtel
    if (process.env.NODE_ENV !== "production") {
      console.log("=== RAW WEBHOOK PAYLOAD ===");
      console.log(rawBody);
      console.log("===========================");
    }
    
    const data = JSON.parse(rawBody);
    let orderId = "";
    let provider = "";
    let status = "";
    let verifiedAmount: number | null = null;

    // Basic logic mirroring legacy webhook
    if (data.event?.startsWith("charge.") && data.data) {
      const signature = request.headers.get("x-paystack-signature");
      if (!isValidPaystackSignature(rawBody, signature)) {
        return new NextResponse("Invalid Paystack signature", { status: 401 });
      }

      // Only process successful charge events
      if (data.event !== "charge.success") {
        return new NextResponse("Event ignored", { status: 200 });
      }

      provider = "paystack";
      orderId = data.data.metadata?.orderId || data.data.reference;
      status = data.data.status === "success" ? "Success" : "Failed";
      if (status === "Success") {
        verifiedAmount = data.data.amount / 100;
      }
    } else if (
      // Nested format: { ResponseCode, Status, Data: { ClientReference, ... } }
      (data.Data?.ClientReference && (data.Status || data.Data?.Status)) ||
      // Legacy flat format: { ClientReference, Status, ... }
      (data.ClientReference && data.Status && !data.event)
    ) {
      // ── Hubtel webhook ──────────────────────────────────────────────
      const {
        normalizeHubtelStatus,
        verifyHubtelTransaction,
      } = await import("@/lib/hubtel");

      provider = "hubtel";

      // Extract fields from nested Data object first, fall back to flat
      const nested = data.Data;
      orderId = nested?.ClientReference || data.ClientReference;
      
      const rawStatus = nested?.Status || data.Status;
      status = normalizeHubtelStatus(rawStatus);

      console.log("[Hubtel webhook]", {
        clientReference: orderId,
        rawStatus,
        normalizedStatus: status,
        checkoutId: nested?.CheckoutId ?? "N/A",
        salesInvoiceId: nested?.SalesInvoiceId ?? "N/A",
        amount: nested?.Amount ?? data.Amount ?? "N/A",
        customerPhone: nested?.CustomerPhoneNumber ?? data.CustomerMsisdn ?? "N/A",
        paymentType: nested?.PaymentDetails?.PaymentType ?? data.PaymentMethod ?? "N/A",
        channel: nested?.PaymentDetails?.Channel ?? "N/A",
        description: nested?.Description ?? data.Description ?? "N/A",
        topLevelResponseCode: data.ResponseCode ?? "N/A",
      });

      // Server-side verification: confirm the transaction with Hubtel's API
      // This is the recommended best practice since Hubtel does not use HMAC signatures
      if (status === "Success") {
        const { verified, status: confirmedStatus, amount: confirmedAmount } =
          await verifyHubtelTransaction(orderId);

        verifiedAmount = confirmedAmount;

        if (!verified) {
          console.warn(
            `[Hubtel webhook] Verification failed for ${orderId}. ` +
              `Webhook claimed Success but Hubtel API returned: ${confirmedStatus}`,
          );
          return NextResponse.json(
            { success: false, message: "Transaction verification failed" },
            { status: 200 },
          );
        }
      }
    } else {
      return new NextResponse("Unknown webhook format", { status: 400 });
    }

    // Do not return early on failure, we want to update the database to failed
    // and notify the customer.

    client = await getClient();
    await client.query("BEGIN");

    let dbQuery = `SELECT id, status, "shippingInfo", items, total, "paymentMethod" FROM orders WHERE id = $1 FOR UPDATE`;
    let dbParams = [orderId];

    if (orderId && orderId.toUpperCase().startsWith("ORD-")) {
      const hexPrefix = orderId.substring(4).toLowerCase();
      dbQuery = `SELECT id, status, "shippingInfo", items, total, "paymentMethod" FROM orders WHERE replace(id::text, '-', '') LIKE $1 ORDER BY "createdAt" DESC LIMIT 1 FOR UPDATE`;
      dbParams = [`${hexPrefix}%`];
    }

    const orderRes = await client.query(dbQuery, dbParams);

    if (orderRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return new NextResponse("Order not found", { status: 404 });
    }

    const actualOrderId = orderRes.rows[0].id;

    if (status === "Success") {
      const orderTotal = Number(orderRes.rows[0].total);

      if (verifiedAmount !== null && verifiedAmount < orderTotal) {
        console.error(`[Amount Mismatch] Order ${actualOrderId} expected ${orderTotal}, but received ${verifiedAmount}`);
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

      if (orderRes.rows[0].status === "pending") {
        await client.query("UPDATE orders SET status = $1 WHERE id = $2", [
          "processing",
          actualOrderId,
        ]);

        await client.query(
          `INSERT INTO activity_logs (id, action, type, details, "createdAt")
           VALUES ($1, $2, $3, $4, NOW())`,
          [
            randomUUID(),
            "order_payment",
            "success",
            `Payment received via ${provider}. Reference: ${actualOrderId}`,
          ],
        );

        // Trigger email and whatsapp notification since payment is now successful
        try {
          const { notificationService } = await import("@/lib/notifications");
          const order = orderRes.rows[0];
          const parsedItems = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
          const parsedShipping = typeof order.shippingInfo === "string" ? JSON.parse(order.shippingInfo) : order.shippingInfo;
          
          notificationService.sendOrderConfirmation(
            actualOrderId, 
            parsedShipping, 
            parsedItems, 
            Number(order.total),
            order.paymentMethod
          ).catch(err => console.error("Webhook Notification failed:", err));
        } catch (err) {
          console.error("Failed to parse order details for notification:", err);
        }
      }
    } else {
      // Payment failed handling
      // We do NOT cancel the order so the user can retry checkout.
      // We only log the failure and notify the customer.
      if (orderRes.rows[0].status === "pending") {
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

        // Trigger failure notification
        try {
          const { notificationService } = await import("@/lib/notifications");
          const order = orderRes.rows[0];
          const parsedShipping = typeof order.shippingInfo === "string" ? JSON.parse(order.shippingInfo) : order.shippingInfo;
          
          notificationService.sendPaymentFailureNotification(
            actualOrderId, 
            parsedShipping
          ).catch(err => console.error("Webhook Failure Notification failed:", err));
        } catch (err) {
          console.error("Failed to parse order details for failure notification:", err);
        }
      }
    }

    await client.query("COMMIT");
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    if (client) await client.query("ROLLBACK");
    console.error("Webhook error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  } finally {
    if (client) client.release();
  }
}
