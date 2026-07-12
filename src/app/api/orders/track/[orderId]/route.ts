import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getUserFromSession, getAdminFromSession } from "@/lib/auth";
import { safeParse, hashOrderAccessToken } from "@/lib/orderUtils";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const orderId = (await params).orderId;
    const rawOrderId = String(orderId || "").trim();

    let orderQuery = "";
    let orderParams: string[] = [];

    if (UUID_RE.test(rawOrderId)) {
      orderQuery = `SELECT *, "orderAccessTokenHash" FROM orders WHERE id = $1`;
      orderParams = [rawOrderId];
    } else {
      const compactCandidate = rawOrderId.toLowerCase().replace(/^ord-/, "").replace(/[^0-9a-f]/g, "");
      if (compactCandidate.length === 32) {
        orderQuery = `SELECT *, "orderAccessTokenHash" FROM orders WHERE replace(lower(id), '-', '') = $1`;
        orderParams = [compactCandidate];
      } else if (compactCandidate.length >= 8) {
        orderQuery = `SELECT *, "orderAccessTokenHash" FROM orders WHERE replace(lower(id), '-', '') LIKE $1 || '%' ORDER BY "createdAt" DESC LIMIT 2`;
        orderParams = [compactCandidate.slice(0, 8)];
      } else {
        return NextResponse.json({ error: "Invalid order identifier" }, { status: 400 });
      }
    }

    const result = await query(orderQuery, orderParams);

    if (result.rowCount && result.rowCount > 1) {
      return NextResponse.json({ error: "Multiple orders match this identifier. Use the full tracking link." }, { status: 409 });
    }

    const order = result.rows[0];
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Auth logic
    const [user, admin] = await Promise.all([getUserFromSession(), getAdminFromSession()]);
    const providedToken = request.headers.get("x-order-access-token")?.trim() || null;
    const hasValidToken = providedToken && order.orderAccessTokenHash && hashOrderAccessToken(providedToken) === order.orderAccessTokenHash;

    const logsResult = await query(
      `SELECT action, type, details, "createdAt" FROM activity_logs WHERE action LIKE 'order_%' AND details LIKE $1 ORDER BY "createdAt" ASC`,
      [`%${order.id}%`]
    );
    const activityLogs = logsResult.rows;

    const isAuthorized = Boolean(admin) || (user && order.userId === user.id) || hasValidToken;

    if (!isAuthorized) {
      return NextResponse.json({
        id: order.id,
        status: order.status,
        createdAt: order.createdAt,
        paymentMethod: order.paymentMethod,
        activityLogs: activityLogs.map(l => ({ action: l.action, createdAt: l.createdAt })),
      });
    }

    return NextResponse.json({
      ...order,
      items: safeParse(order.items),
      shippingInfo: safeParse(order.shippingInfo),
      total: Number(order.total),
      orderAccessTokenHash: undefined,
      activityLogs,
    });
  } catch (error) {
    console.error("Error tracking order:", error);
    return NextResponse.json({ error: "Failed to track order" }, { status: 500 });
  }
}
