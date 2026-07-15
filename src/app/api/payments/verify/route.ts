import { NextRequest } from "next/server";
import { query, getClient } from "@/lib/db";
import { apiResponse } from "@/lib/api-utils";
import { toReadableOrderId } from "@/utils/orderId";
import { randomUUID } from "node:crypto";

export async function POST(request: NextRequest) {
  try {
    const { orderId, provider } = await request.json();

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

    if (provider === "hubtel") {
      const { verifyHubtelTransaction, normalizeHubtelStatus } = await import(
        "@/lib/hubtel"
      );
      const readableOrderId = toReadableOrderId(orderId);
      const { verified, status: confirmedStatus } =
        await verifyHubtelTransaction(readableOrderId);

      if (verified) {
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
                `Payment manually verified via Hubtel. Reference: ${orderId}`,
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

      const normStatus = normalizeHubtelStatus(confirmedStatus || "");
      if (normStatus === "Failed" || normStatus === "Cancelled") {
        // We could also update the DB to cancelled here if we wanted to
        // But the webhook also handles it. Let's just return it for now.
        return apiResponse.success({
          status: "pending",
          hubtelStatus: confirmedStatus,
          verified: false,
        });
      }
    }

    return apiResponse.success({ status: order.status });
  } catch (err) {
    console.error("Manual verify error:", err);
    return apiResponse.error("Server error");
  }
}
