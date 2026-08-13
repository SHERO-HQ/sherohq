import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { apiResponse, validateCronAuth } from "@/lib/api-utils";
import { safeParse } from "@/lib/orderUtils";
import { logActivity } from "@/lib/activity";

export async function GET(request: NextRequest) {
  return handleCleanupPendingOrders(request);
}

export async function POST(request: NextRequest) {
  return handleCleanupPendingOrders(request);
}

async function handleCleanupPendingOrders(request: NextRequest) {
  try {
    const cronError = validateCronAuth(request);
    if (cronError) return cronError;

    // Find unconfirmed online orders older than 48 hours (after reminder window)
    const staleOrdersRes = await db.execute(sql`
      SELECT id, status, "paymentStatus", "paymentMethod", items, "createdAt"
      FROM orders
      WHERE status = 'pending'
        AND "paymentStatus" != 'confirmed'
        AND "paymentMethod" IN ('momo', 'card', 'hubtel', 'paystack')
        AND "createdAt" < NOW() - INTERVAL '48 hours'
      ORDER BY "createdAt" ASC
      LIMIT 100
    `);

    const staleOrders = staleOrdersRes.rows || staleOrdersRes;
    let cancelledCount = 0;

    for (const order of staleOrders as any[]) {
      try {
        await db.transaction(async (tx) => {
          // Lock the order row
          const lockedRes = await tx.execute(
            sql`SELECT id, status, "paymentStatus", items 
                FROM orders 
                WHERE id = ${order.id} 
                FOR UPDATE`
          );

          if (lockedRes.rows.length === 0) return;
          const currentOrder = lockedRes.rows[0] as any;

          // Only cancel if still pending and not confirmed
          if (
            currentOrder.status !== "pending" ||
            currentOrder.paymentStatus === "confirmed"
          ) {
            return;
          }

          // Restore stock for each item in the order
          const items = safeParse(currentOrder.items);
          if (Array.isArray(items)) {
            for (const item of items) {
              if (item.id && item.quantity) {
                await tx.execute(
                  sql`UPDATE products 
                      SET "stockQuantity" = "stockQuantity" + ${item.quantity},
                          "inStock" = true
                      WHERE id = ${item.id}`
                );
              }
            }
          }

          // Mark order as cancelled and payment failed
          await tx
            .update(orders)
            .set({
              status: "cancelled",
              paymentStatus: "failed",
              paymentMessage:
                "Order expired: payment was not completed within the time limit.",
            })
            .where(eq(orders.id, order.id));

          await logActivity(
            null,
            "order_auto_cancelled",
            "info",
            `Stale pending order ${order.id} was automatically cancelled and stock restored.`
          );

          cancelledCount++;
        });
      } catch (orderErr) {
        console.error(`Failed to auto-cancel stale order ${order.id}:`, orderErr);
      }
    }

    return apiResponse.success({
      success: true,
      processed: (staleOrders as any[]).length,
      cancelled: cancelledCount,
    });
  } catch (error) {
    console.error("Stale order cleanup cron error:", error);
    return apiResponse.error("Internal Server Error", 500);
  }
}
