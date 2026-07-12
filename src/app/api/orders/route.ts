import { NextRequest, NextResponse } from "next/server";
import { getClient, query } from "@/lib/db";

import { getUserFromSession, getAdminFromSession } from "@/lib/auth";
import { 
  safeParse, 
  ORDER_STATUSES, 
  normalizePaymentMethod, 
  ORDER_PAYMENT_METHODS,
  roundCurrency,
  hashOrderAccessToken
} from "@/lib/orderUtils";
import { v4 as uuidv4 } from "uuid";
import { randomBytes } from "node:crypto";
import { notificationService } from "@/lib/notifications";
import { logActivity } from "@/lib/activity";

// GET handler for admin list
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin || !["admin", "superadmin", "manager"].includes(admin.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const limit = Math.min(200, parseInt(searchParams.get("limit") || "100"));
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let queryText = `
      SELECT o.*, 
        (SELECT details 
         FROM activity_logs a 
         WHERE a.action = 'order_payment' AND a.details LIKE '%' || o.id::text || '%' 
         ORDER BY a."createdAt" DESC LIMIT 1
        ) as "paymentMessage"
      FROM orders o
    `;
    const sqlParams: (string | number)[] = [];
    const conditions: string[] = [];
    let paramIndex = 1;

    if (status && ORDER_STATUSES.has(status)) {
      conditions.push(`status = $${paramIndex}`);
      sqlParams.push(status);
      paramIndex++;
    }

    if (startDate) {
      conditions.push(`"createdAt" >= $${paramIndex}`);
      sqlParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      conditions.push(`"createdAt" <= $${paramIndex}`);
      sqlParams.push(endDate);
      paramIndex++;
    }

    if (conditions.length > 0) {
      queryText += " WHERE " + conditions.join(" AND ");
    }

    queryText += ` ORDER BY "createdAt" DESC LIMIT $${paramIndex}`;
    sqlParams.push(limit);

    const result = await query(queryText, sqlParams);
    const orders = result.rows.map((order) => ({
      ...order,
      items: safeParse(order.items),
      shippingInfo: safeParse(order.shippingInfo),
      total: Number(order.total),
      paymentMessage: order.paymentMessage,
    }));

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// POST handler for creating orders
export async function POST(request: NextRequest) {
  const client = await getClient();

  try {
    const body = await request.json();
    const { items, shippingInfo, paymentMethod, guestId, referralCode } = body;

    const user = await getUserFromSession();
    const requesterUserId = user?.id || null;

    if (!items || !shippingInfo) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const normalizedPaymentMethod = normalizePaymentMethod(paymentMethod);
    if (!ORDER_PAYMENT_METHODS.has(normalizedPaymentMethod)) {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    const productIds = items.map((i: any) => i.id);
    const orderId = uuidv4();
    const orderAccessToken = randomBytes(32).toString("hex");
    const orderAccessTokenHash = hashOrderAccessToken(orderAccessToken);

    await client.query("BEGIN");

    // Lock and check stock
    const productsRes = await client.query(
      `SELECT id, name, price, "stockQuantity", "inStock" FROM products WHERE id = ANY($1) FOR UPDATE`,
      [productIds]
    );

    const productMap = new Map(productsRes.rows.map(r => [r.id, r]));
    const normalizedItems = [];
    let serverTotal = 0;

    for (const item of items) {
      const product = productMap.get(item.id);
      if (!product || !product.inStock || product.stockQuantity < item.quantity) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: `Insufficient stock for ${product?.name || 'unknown product'}. Only ${product?.stockQuantity || 0} left.` }, 
          { status: 400 }
        );
      }

      const unitPrice = roundCurrency(Number(product.price));
      serverTotal += unitPrice * item.quantity;

      normalizedItems.push({
        id: product.id,
        name: product.name,
        price: unitPrice,
        quantity: item.quantity,
      });

      // Update stock
      const newQuantity = product.stockQuantity - item.quantity;
      await client.query(
        `UPDATE products SET "stockQuantity" = $1, "inStock" = $2 WHERE id = $3`,
        [newQuantity, newQuantity > 0, product.id]
      );
    }

    const finalTotal = roundCurrency(serverTotal);
    const resolvedGuestId = guestId || uuidv4();

    await client.query(
      `INSERT INTO orders (id, "guestId", "userId", items, total, "shippingInfo", "paymentMethod", status, "referralCode", "orderAccessTokenHash")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        orderId,
        resolvedGuestId,
        requesterUserId,
        JSON.stringify(normalizedItems),
        finalTotal,
        JSON.stringify(shippingInfo),
        normalizedPaymentMethod,
        "pending",
        referralCode || null,
        orderAccessTokenHash,
      ]
    );

    await client.query("COMMIT");

    // Notifications (Async) - Delay sending email unless Cash on Delivery
    if (normalizedPaymentMethod === "cash_on_delivery") {
      notificationService.sendOrderConfirmation(orderId, shippingInfo, normalizedItems, finalTotal, normalizedPaymentMethod)
        .catch(err => console.error("Notification failed:", err));
    }
    
    logActivity(null, "New Order Received", "success", `Order ${orderId.substring(0,8)} placed by ${shippingInfo.firstName}`)
      .catch(err => console.error("Log failed:", err));

    return NextResponse.json({
      success: true,
      orderId,
      total: finalTotal,
      orderAccessToken,
      message: "Order created successfully",
    }, { status: 201 });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Order creation error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to create order" 
    }, { status: 500 });
  } finally {
    client.release();
  }
}
