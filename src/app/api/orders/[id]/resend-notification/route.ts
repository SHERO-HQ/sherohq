import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import { safeParse, generateOrderSecurityToken } from "@/lib/orderUtils";
import { notificationService, ShippingInfo, OrderItem } from "@/lib/notifications";
import { logActivity } from "@/lib/activity";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return apiResponse.unauthorized();
    }

    const id = (await params).id;
    const body = await request.json().catch(() => ({}));
    const forcedType = body.type as "auto" | "confirmation" | "reminder" | "status" | undefined;

    const orderRes = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (orderRes.length === 0) {
      return apiResponse.notFound("Order not found");
    }

    const order = orderRes[0];
    const shippingInfo = safeParse(order.shippingInfo) as ShippingInfo | null;
    const items = (safeParse(order.items) as OrderItem[]) || [];
    const total = Number(order.total) || 0;

    if (!shippingInfo || !shippingInfo.email) {
      return apiResponse.error("Customer email address is missing on this order", 400);
    }

    const securityToken = generateOrderSecurityToken(order.id, order.createdAt, total);
    let notificationType = forcedType || "auto";

    if (notificationType === "auto") {
      if (order.status === "pending") {
        notificationType = "reminder";
      } else if (order.status === "processing") {
        notificationType = "confirmation";
      } else {
        notificationType = "status";
      }
    }

    if (notificationType === "reminder") {
      await notificationService.sendPendingOrderReminderNotification({
        orderId: order.id,
        shippingInfo,
        items,
        total,
        paymentMethod: order.paymentMethod || undefined,
        createdAt: order.createdAt || undefined,
        stage: "1hr",
        securityToken,
      });

      await logActivity(
        admin.id,
        "admin_order_notification_sent",
        "info",
        `Admin ${admin.username || admin.email} sent payment reminder email for order ${order.id} to ${shippingInfo.email}`
      );

      return apiResponse.success({
        success: true,
        type: "reminder",
        message: `Payment reminder email sent directly to ${shippingInfo.email}`,
      });
    }

    if (notificationType === "confirmation") {
      await notificationService.sendOrderConfirmation(
        order.id,
        shippingInfo,
        items,
        total,
        order.paymentMethod || undefined
      );

      await logActivity(
        admin.id,
        "admin_order_notification_sent",
        "info",
        `Admin ${admin.username || admin.email} resent order confirmation email for order ${order.id} to ${shippingInfo.email}`
      );

      return apiResponse.success({
        success: true,
        type: "confirmation",
        message: `Order confirmation email resent directly to ${shippingInfo.email}`,
      });
    }

    // Default: status update notification
    await notificationService.sendOrderStatusUpdateNotification(
      order.id,
      order.status || "processing",
      shippingInfo
    );

    await logActivity(
      admin.id,
      "admin_order_notification_sent",
      "info",
      `Admin ${admin.username || admin.email} sent order status update (${order.status}) email for order ${order.id} to ${shippingInfo.email}`
    );

    return apiResponse.success({
      success: true,
      type: "status",
      message: `Order status notification sent directly to ${shippingInfo.email}`,
    });
  } catch (error) {
    console.error("Resend order notification error:", error);
    return apiResponse.error(
      error instanceof Error ? error.message : "Failed to send notification email",
      500
    );
  }
}
