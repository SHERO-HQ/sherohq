import { db } from "@/lib/db";
import { orders, abandonedCarts, users, campaignTemplates } from "@/lib/drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { notificationService, ShippingInfo, OrderItem } from "@/lib/notifications";
import { safeParse, generateOrderSecurityToken } from "@/lib/orderUtils";
import { logActivity } from "@/lib/activity";
import { processNewsletterCron } from "@/lib/newsletter";
import { processPendingRetries } from "@/lib/whatsapp-retry";
import { sendWhatsAppMessageDirect, storeOutgoingMessage } from "@/lib/whatsapp-messages";

/**
 * 1. Process Due Newsletter Campaigns
 */
export async function processNewsletterTask() {
  try {
    const result = await processNewsletterCron();
    return { success: true, result };
  } catch (error) {
    console.error("[CronTask] Newsletter error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * 2. Process Failed WhatsApp Message Retries
 */
export async function processWhatsAppRetriesTask() {
  try {
    const result = await processPendingRetries();
    return { success: true, ...result };
  } catch (error) {
    console.error("[CronTask] WhatsApp retries error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * 3. Process Pending Order Reminders (1h and 24h)
 */
export async function processPendingOrdersRemindersTask() {
  try {
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

        const existingLogsRes = await db.execute(sql`
          SELECT action 
          FROM activity_logs 
          WHERE action IN ('order_pending_reminder_1h', 'order_pending_reminder_24h')
            AND details LIKE ${'%' + order.id + '%'}
        `);
        const sentActions = new Set((existingLogsRes.rows || existingLogsRes).map((r: any) => r.action));

        if (ageInHours >= 24 && !sentActions.has("order_pending_reminder_24h")) {
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
        console.error(`[CronTask] Reminder error for order ${order.id}:`, orderErr);
        errorCount++;
      }
    }

    return {
      success: true,
      processed: pendingOrders.length,
      stage1Sent,
      stage2Sent,
      skipped,
      errors: errorCount,
    };
  } catch (error) {
    console.error("[CronTask] Pending orders reminder error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * 4. Process Cleanup of Stale Orders (> 48 hours pending)
 */
export async function processCleanupPendingOrdersTask() {
  try {
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

    const staleOrders = (staleOrdersRes.rows || staleOrdersRes) as any[];
    let cancelledCount = 0;

    for (const order of staleOrders) {
      try {
        await db.transaction(async (tx) => {
          const lockedRes = await tx.execute(
            sql`SELECT id, status, "paymentStatus", items 
                FROM orders 
                WHERE id = ${order.id} 
                FOR UPDATE`
          );

          if (lockedRes.rows.length === 0) return;
          const currentOrder = lockedRes.rows[0] as any;

          if (
            currentOrder.status !== "pending" ||
            currentOrder.paymentStatus === "confirmed"
          ) {
            return;
          }

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
        console.error(`[CronTask] Auto-cancel error for order ${order.id}:`, orderErr);
      }
    }

    return {
      success: true,
      processed: staleOrders.length,
      cancelled: cancelledCount,
    };
  } catch (error) {
    console.error("[CronTask] Stale order cleanup error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * 5. Process Abandoned Carts (Email)
 */
export async function processAbandonedCartsEmailTask() {
  try {
    const result = await db.execute(sql`
      SELECT ac.id, ac.items, ac."userId", u.email, u.name as "firstName" 
      FROM abandoned_carts ac
      JOIN users u ON ac."userId" = u.id
      WHERE ac."emailSent" = false 
      AND ac."lastActive" < NOW() - INTERVAL '1 hour'
      AND ac."lastActive" > NOW() - INTERVAL '48 hours'
      AND jsonb_array_length(ac.items) > 0
    `);

    const carts = (result.rows || result) as any[];
    let emailsSent = 0;

    for (const cart of carts) {
      const items = cart.items;
      try {
        await notificationService.sendAbandonedCartEmail(
          cart.email,
          cart.firstName,
          items,
          `${process.env.NEXT_PUBLIC_SITE_URL || "https://shop.sherohq.com"}/shop/checkout`
        );
        
        await db.execute(sql`
          UPDATE abandoned_carts SET "emailSent" = true WHERE id = ${cart.id}
        `);
        emailsSent++;
      } catch (err) {
        console.error(`[CronTask] Failed to send abandoned cart email to ${cart.email}:`, err);
      }
    }

    return { success: true, processed: carts.length, emailsSent };
  } catch (error) {
    console.error("[CronTask] Abandoned carts email error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * 6. Process Abandoned Carts (WhatsApp)
 */
export async function processAbandonedCartsWhatsAppTask() {
  try {
    const carts = await db
      .select({
        id: abandonedCarts.id,
        userId: abandonedCarts.userId,
        guestId: abandonedCarts.guestId,
        items: abandonedCarts.items,
        phone: sql<string>`COALESCE(${users.phone}, ${abandonedCarts.guestPhone})`,
        name: sql<string>`COALESCE(${users.name}, 'there')`,
      })
      .from(abandonedCarts)
      .leftJoin(users, eq(abandonedCarts.userId, users.id))
      .where(
        and(
          eq(abandonedCarts.whatsappSent, false),
          sql`${abandonedCarts.lastActive} < NOW() - INTERVAL '2 hours'`,
          sql`COALESCE(${users.phone}, ${abandonedCarts.guestPhone}) IS NOT NULL`,
          sql`COALESCE(${users.phone}, ${abandonedCarts.guestPhone}) <> ''`,
          sql`${abandonedCarts.items} IS NOT NULL`,
          sql`${abandonedCarts.items}::text <> '[]'`
        )
      )
      .limit(100);

    let sentCount = 0;
    let errorCount = 0;

    for (const cart of carts) {
      const phone = cart.phone;
      const name = cart.name;
      
      let items: any[] = [];
      try {
        items = typeof cart.items === 'string' ? JSON.parse(cart.items) : cart.items;
      } catch {
        /* ignore parsing error */
      }

      if (!items || !Array.isArray(items) || items.length === 0) continue;

      // Find the template in the database
      let templateName: string | null = null;
      let templateLanguage: string | null = null;
      let templateParams: string[] = [];

      try {
        const templateRecord = await db.query.campaignTemplates.findFirst({
          where: and(
            eq(campaignTemplates.name, "abandoned_cart_reminder"),
            eq(campaignTemplates.channel, "whatsapp")
          ),
        });

        if (templateRecord) {
          templateName = templateRecord.name;
          templateLanguage = templateRecord.whatsappTemplateLanguage || "en";
          templateParams = [name.split(" ")[0]];
        }
      } catch (e) {
        console.error("[CronTask] Failed to fetch template:", e);
      }

      const content = `Hi ${name.split(" ")[0]}! We noticed you left some great items in your cart at SHERO Technologies. Complete your order today before they run out! Reply to this message if you need any help with checkout.`;

      try {
        const sendResult = await sendWhatsAppMessageDirect(
          phone,
          content,
          templateName,
          templateLanguage,
          templateParams
        );

        if (sendResult.success && sendResult.messageId) {
          await storeOutgoingMessage(
            sendResult.messageId,
            null,
            phone.replace(/[^\d]/g, ""),
            process.env.WHATSAPP_PHONE_NUMBER_ID || "unknown",
            content
          );

          await db
            .update(abandonedCarts)
            .set({ whatsappSent: true })
            .where(eq(abandonedCarts.id, cart.id));

          sentCount++;
        } else {
          errorCount++;
        }
      } catch (err) {
        console.error(`[CronTask] WhatsApp send failed for cart ${cart.id}:`, err);
        errorCount++;
      }
    }

    return { success: true, processed: carts.length, sentCount, errorCount };
  } catch (error) {
    console.error("[CronTask] Abandoned carts WhatsApp error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
