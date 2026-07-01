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
    const data = JSON.parse(rawBody);
    let orderId = "";
    let provider = "";
    let status = "";

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
    } else if (data.ClientReference && data.Status) {
      // ── Hubtel webhook ──────────────────────────────────────────────
      const {
        normalizeHubtelStatus,
        verifyHubtelTransaction,
      } = await import("@/lib/hubtel");

      provider = "hubtel";
      orderId = data.ClientReference;

      // Normalize the various Hubtel status values
      status = normalizeHubtelStatus(data.Status);

      console.log("[Hubtel webhook]", {
        clientReference: orderId,
        rawStatus: data.Status,
        normalizedStatus: status,
        transactionId: data.TransactionId ?? "N/A",
        amount: data.Amount ?? "N/A",
        paymentMethod: data.PaymentMethod ?? "N/A",
      });

      // Server-side verification: confirm the transaction with Hubtel's API
      // This is the recommended best practice since Hubtel does not use HMAC signatures
      if (status === "Success") {
        const { verified, status: confirmedStatus } =
          await verifyHubtelTransaction(orderId);

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

    if (status !== "Success") {
      return new NextResponse("Payment failed acknowledged", { status: 200 });
    }

    client = await getClient();
    await client.query("BEGIN");

    const orderRes = await client.query(
      `SELECT status, "shippingInfo", items, total FROM orders WHERE id = $1 FOR UPDATE`,
      [orderId],
    );

    if (orderRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return new NextResponse("Order not found", { status: 200 });
    }

    if (orderRes.rows[0].status === "pending") {
      await client.query("UPDATE orders SET status = $1 WHERE id = $2", [
        "processing",
        orderId,
      ]);

      await client.query(
        `INSERT INTO activity_logs (id, action, type, details, "createdAt")
         VALUES ($1, $2, $3, $4, NOW())`,
        [
          randomUUID(),
          "order_payment",
          "success",
          `Payment received via ${provider}. Reference: ${orderId}`,
        ],
      );

      // Trigger email and whatsapp notification since payment is now successful
      try {
        const { notificationService } = await import("@/lib/notifications");
        const order = orderRes.rows[0];
        const parsedItems = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
        const parsedShipping = typeof order.shippingInfo === "string" ? JSON.parse(order.shippingInfo) : order.shippingInfo;
        
        notificationService.sendOrderConfirmation(
          orderId, 
          parsedShipping, 
          parsedItems, 
          Number(order.total)
        ).catch(err => console.error("Webhook Notification failed:", err));
      } catch (err) {
        console.error("Failed to parse order details for notification:", err);
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
