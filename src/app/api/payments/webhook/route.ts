import { NextRequest, NextResponse } from "next/server";
import { query, getClient } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { createHmac, timingSafeEqual } from "node:crypto";

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
      provider = "hubtel";
      orderId = data.ClientReference;
      status = data.Status;
    } else {
      return new NextResponse("Unknown webhook format", { status: 400 });
    }

    if (status !== "Success") {
      return new NextResponse("Payment failed acknowledged", { status: 200 });
    }

    client = await getClient();
    await client.query("BEGIN");

    const orderRes = await client.query(
      "SELECT status FROM orders WHERE id = $1 FOR UPDATE",
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
          uuidv4(),
          "order_payment",
          "success",
          `Payment received via ${provider}. Reference: ${orderId}`,
        ],
      );
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
