import { NextRequest } from "next/server";
import { query, getClient } from "@/lib/db";
import { apiResponse } from "@/lib/api-utils";
import { toReadableOrderId } from "@/utils/orderId";
import { randomUUID } from "node:crypto";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { orderId } = payload;
    let { provider } = payload;

    if (!orderId) {
      return apiResponse.error("Order ID is required", 400);
    }

    const orderRes = await query(`SELECT * FROM orders WHERE id = $1`, [
      orderId,
    ]);

    if (orderRes.rowCount === 0) {
      return apiResponse.notFound("Order not found");
    }

    const order = orderRes.rows[0];

    // If order is already processed, no need to verify again
    if (order.status !== "pending") {
      return apiResponse.success({ status: order.status });
    }

    let verified = false;
    let providerStatus = "";
    let verifiedAmount: number | null = null;

    if (provider === "hubtel") {
      const { verifyHubtelTransaction, normalizeHubtelStatus } = await import(
        "@/lib/hubtel"
      );
      const readableOrderId = toReadableOrderId(orderId);
      const result = await verifyHubtelTransaction(readableOrderId);
      verified = result.verified;
      providerStatus = normalizeHubtelStatus(result.status || "");
      verifiedAmount = result.amount;
      
      if (!verified) {
        // Fallback: check Paystack in case Hubtel failed during initialize and we fell back to Paystack
        const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET || process.env.PAYSTACK_SECRET_KEY;
        if (PAYSTACK_SECRET) {
          try {
            const resp = await fetch(`https://api.paystack.co/transaction/verify/${orderId}`, {
              headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
            });
            const data = await resp.json();
            if (data.status && data.data?.status === "success") {
              verified = true;
              providerStatus = data.data.status;
              verifiedAmount = data.data?.amount ? data.data.amount / 100 : null;
              provider = "paystack (fallback)"; // Update provider for logging
            }
          } catch (err) {}
        }
      }
      
      if (!verified && (providerStatus === "Failed" || providerStatus === "Cancelled")) {
        return apiResponse.success({
          status: "pending",
          hubtelStatus: result.status,
          verified: false,
        });
      }
    } else if (provider === "paystack") {
      const PAYSTACK_SECRET =
        process.env.PAYSTACK_SECRET || process.env.PAYSTACK_SECRET_KEY;
      if (PAYSTACK_SECRET) {
        try {
          const resp = await fetch(`https://api.paystack.co/transaction/verify/${orderId}`, {
            headers: {
              Authorization: `Bearer ${PAYSTACK_SECRET}`,
            },
          });
          const data = await resp.json();
          verified = data.status && data.data?.status === "success";
          providerStatus = data.data?.status || "failed";
          verifiedAmount = data.data?.amount ? data.data.amount / 100 : null;
          
          if (!verified && (providerStatus === "failed" || providerStatus === "abandoned")) {
            return apiResponse.success({
              status: "pending",
              paystackStatus: providerStatus,
              verified: false,
            });
          }
        } catch (err) {
          console.error("Paystack verify error:", err);
        }
      }
    }

    if (verified) {
      const orderTotal = Number(order.total);
      if (verifiedAmount !== null && verifiedAmount < orderTotal) {
        console.error(`[Amount Mismatch] Verify API: Order ${orderId} expected ${orderTotal}, but received ${verifiedAmount}`);
        return apiResponse.error("Payment amount mismatch detected", 400);
      }

      const client = await getClient();
      try {
        await client.query("BEGIN");
        
        const checkRes = await client.query(`SELECT status FROM orders WHERE id = $1 FOR UPDATE`, [orderId]);
        if (checkRes.rows[0].status === "pending") {
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
              `Payment manually verified via ${provider}. Reference: ${orderId}`,
            ]
          );

          // trigger notifications
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
                orderId,
                parsedShipping,
                parsedItems,
                Number(order.total),
                order.paymentMethod
              )
              .catch((err) =>
                console.error("Verify API Notification failed:", err)
              );
          } catch (err) {}
        }
        await client.query("COMMIT");
        return apiResponse.success({ status: "processing" });
      } catch (err) {
        await client.query("ROLLBACK");
        console.error("Manual verify DB error:", err);
        return apiResponse.error("Database error during verification", 500);
      } finally {
        client.release();
      }
    }

    return apiResponse.success({ status: order.status });
  } catch (err) {
    console.error("Manual verify error:", err);
    return apiResponse.error("Server error");
  }
}
