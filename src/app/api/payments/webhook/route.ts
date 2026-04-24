import { NextRequest, NextResponse } from "next/server";
import { query, getClient } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  let client: any = null;
  try {
    const data = await request.json();
    let orderId = "";
    let provider = "";
    let status = "";

    // Basic logic mirroring legacy webhook
    if (data.event?.startsWith("charge.") && data.data) {
      provider = "paystack";
      orderId = data.data.reference;
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
      'SELECT status FROM orders WHERE id = $1 FOR UPDATE',
      [orderId]
    );

    if (orderRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return new NextResponse("Order not found", { status: 200 });
    }

    if (orderRes.rows[0].status === "pending") {
      await client.query("UPDATE orders SET status = $1 WHERE id = $2", ["processing", orderId]);
      
      await client.query(
        `INSERT INTO activity_logs (id, action, type, details, "createdAt")
         VALUES ($1, $2, $3, $4, NOW())`,
        [uuidv4(), "order_payment", "success", `Payment received via ${provider}. Reference: ${orderId}`]
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
