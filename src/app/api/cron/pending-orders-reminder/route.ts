import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { apiResponse, validateCronAuth } from "@/lib/api-utils";
import { notificationService, ShippingInfo, OrderItem } from "@/lib/notifications";
import { safeParse, generateOrderSecurityToken } from "@/lib/orderUtils";
import { logActivity } from "@/lib/activity";

export async function GET(request: NextRequest) {
  return handlePendingReminders(request);
}

export async function POST(request: NextRequest) {
  return handlePendingReminders(request);
}

async function handlePendingReminders(request: NextRequest) {
  try {
    const cronError = validateCronAuth(request);
    if (cronError) return cronError;

    // Find unconfirmed pending orders between 1 hour and 48 hours old
    const pendingOrdersRes = await db.execute(sql`
      SELECT 
        o.id, 
        o.status, 
        o."paymentStatus", 
        o."paymentMethod", 
        o.items, 
        o."shippingInfo", 
        o.total, 
        o."createdAt",
        o."userId",
        o."guestId"
      FROM orders o
      WHERE o.status = 'pending'
        AND o."paymentStatus" != 'confirmed'
        AND o."paymentMethod" IN ('momo', 'card', 'hubtel', 'paystack')
        AND o."createdAt" <= NOW() - INTERVAL '60 minutes'
        AND o."createdAt" >= NOW() - INTERVAL '48 hours'
      ORDER BY o."createdAt" ASC
      LIMIT 100
    `);

    const pendingOrders = (pendingOrdersRes.rows || pendingOrdersRes) as any[];

    let stage1Sent = 0;
    let stage2Sent = 0;
    let skipped = 0;
    let errorCount = 0;

    for (const order of pendingOrders) {
      try {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        const ageInHours = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);

        const shippingInfo = safeParse(order.shippingInfo) as ShippingInfo | null;
        if (!shippingInfo || !shippingInfo.email) {
          skipped++;
          continue;
        }

        const items = (safeParse(order.items) as OrderItem[]) || [];
        const total = Number(order.total) || 0;
        const securityToken = generateOrderSecurityToken(order.id, order.createdAt, total);

        // Check if reminders were already sent for this order
        const existingLogsRes = await db.execute(sql`
          SELECT action 
          FROM activity_logs 
          WHERE action IN ('order_pending_reminder_1h', 'order_pending_reminder_24h')
            AND details LIKE ${'%' + order.id + '%'}
        `);
        const sentActions = new Set((existingLogsRes.rows || existingLogsRes).map((r: any) => r.action));

        // Determine which stage applies
        if (ageInHours >= 24 && !sentActions.has("order_pending_reminder_24h")) {
          // Stage 2: 24-hour reminder
          await notificationService.sendPendingOrderReminderNotification({
            orderId: order.id,
            shippingInfo,
            items,
            total,
            paymentMethod: order.paymentMethod,
            createdAt: order.createdAt,
            stage: "24hr",
            securityToken,
          });

          await logActivity(
            null,
            "order_pending_reminder_24h",
            "info",
            `24hr pending reminder sent for order ${order.id} to ${shippingInfo.email}`
          );

          stage2Sent++;
        } else if (ageInHours >= 1 && ageInHours < 24 && !sentActions.has("order_pending_reminder_1h")) {
          // Stage 1: 1-hour (60 minute) reminder
          await notificationService.sendPendingOrderReminderNotification({
            orderId: order.id,
            shippingInfo,
            items,
            total,
            paymentMethod: order.paymentMethod,
            createdAt: order.createdAt,
            stage: "1hr",
            securityToken,
          });

          await logActivity(
            null,
            "order_pending_reminder_1h",
            "info",
            `1hr pending reminder sent for order ${order.id} to ${shippingInfo.email}`
          );

          stage1Sent++;
        } else {
          skipped++;
        }
      } catch (orderErr) {
        console.error(`Failed to process reminder for pending order ${order.id}:`, orderErr);
        errorCount++;
      }
    }

    return apiResponse.success({
      success: true,
      processed: pendingOrders.length,
      stage1Sent,
      stage2Sent,
      skipped,
      errors: errorCount,
    });
  } catch (error) {
    console.error("Pending orders reminder cron error:", error);
    return apiResponse.error("Internal Server Error", 500);
  }
}
