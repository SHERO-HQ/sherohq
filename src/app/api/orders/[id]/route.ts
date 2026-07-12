import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import { safeParse } from "@/lib/orderUtils";
import { notificationService, ShippingInfo, OrderItem } from "@/lib/notifications";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const id = (await params).id;
    const result = await query("SELECT * FROM orders WHERE id = $1", [id]);
    const order = result.rows[0];

    if (!order) return apiResponse.notFound("Order not found");

    const logsResult = await query(
      `SELECT details FROM activity_logs WHERE action = 'order_payment' AND details LIKE $1 ORDER BY "createdAt" DESC LIMIT 1`,
      [`%${id}%`]
    );
    const paymentMessage = logsResult.rows[0]?.details || null;

    return apiResponse.success({
      ...order,
      items: safeParse(order.items),
      shippingInfo: safeParse(order.shippingInfo),
      total: parseFloat(order.total),
      paymentMessage,
    });
  } catch (error) {
    console.error("Fetch order error:", error);
    return apiResponse.error("Failed to fetch order");
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const id = (await params).id;
    const { status, paymentMethod } = await request.json();

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (status) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    if (paymentMethod) {
      updates.push(`"paymentMethod" = $${paramIndex++}`);
      values.push(paymentMethod);
    }

    if (updates.length === 0) return apiResponse.error("No fields to update", 400);

    values.push(id);
    const result = await query(
      `UPDATE orders SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rowCount === 0) return apiResponse.notFound("Order not found");

    const updatedOrder = result.rows[0];

    if (status === "shipped" || status === "delivered") {
      notificationService.sendOrderStatusUpdateNotification(
        id,
        status,
        safeParse(updatedOrder.shippingInfo) as ShippingInfo,
        safeParse(updatedOrder.items) as OrderItem[],
        parseFloat(updatedOrder.total)
      ).catch(console.error);
    }

    const { logActivity } = await import("@/lib/activity");
    await logActivity(admin.id, "order_update", "info", `Updated order ${id}: status=${status || 'N/A'}`);

    return apiResponse.success({
      ...result.rows[0],
      items: safeParse(result.rows[0].items),
      shippingInfo: safeParse(result.rows[0].shippingInfo),
      total: parseFloat(result.rows[0].total),
    });
  } catch (error) {
    console.error("Update order error:", error);
    return apiResponse.error("Failed to update order");
  }
}
