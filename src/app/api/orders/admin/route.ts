import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { 
  roundCurrency,
  hashOrderAccessToken
} from "@/lib/orderUtils";
import { v4 as uuidv4 } from "uuid";
import { randomBytes } from "node:crypto";
import { notificationService } from "@/lib/notifications";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  const admin = await getAdminFromSession();
  if (!admin || !["admin", "superadmin", "manager"].includes(admin.role)) {
    return apiResponse.unauthorized();
  }

  const client = await getClient();

  try {
    const body = await request.json();
    const { items, shippingInfo, total, status } = body;

    if (!items || !shippingInfo || typeof total === "undefined" || !status) {
      return apiResponse.error("Missing required fields", 400);
    }

    if (status !== "pending" && status !== "quote") {
      return apiResponse.error("Invalid order status specified", 400);
    }

    const orderId = uuidv4();
    const resolvedGuestId = uuidv4();
    const orderAccessToken = randomBytes(32).toString("hex");
    const orderAccessTokenHash = hashOrderAccessToken(orderAccessToken);

    await client.query("BEGIN");

    // Gather catalog product IDs to check stock
    const productIds = items.filter((i: any) => i.id).map((i: any) => i.id);
    let productMap = new Map();

    if (productIds.length > 0) {
      const productsRes = await client.query(
        `SELECT id, name, price, "stockQuantity", "inStock" FROM products WHERE id = ANY($1) FOR UPDATE`,
        [productIds]
      );
      productMap = new Map(productsRes.rows.map(r => [r.id, r]));
    }

    const normalizedItems = [];
    let serverTotal = 0;

    for (const item of items) {
      if (item.id && productMap.has(item.id)) {
        // catalog product
        const product = productMap.get(item.id);
        if (!product || !product.inStock || product.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product?.name || "unknown product"}`);
        }

        const unitPrice = roundCurrency(Number(product.price));
        serverTotal += unitPrice * item.quantity;

        normalizedItems.push({
          id: product.id,
          name: product.name,
          price: unitPrice,
          quantity: item.quantity,
          image: item.image || product.image || null,
        });

        // Decrement stock
        const newQuantity = product.stockQuantity - item.quantity;
        await client.query(
          `UPDATE products SET "stockQuantity" = $1, "inStock" = $2 WHERE id = $3`,
          [newQuantity, newQuantity > 0, product.id]
        );
      } else {
        // Custom item or service
        const unitPrice = roundCurrency(Number(item.price));
        serverTotal += unitPrice * item.quantity;

        normalizedItems.push({
          id: item.id || null,
          name: item.name,
          price: unitPrice,
          quantity: item.quantity,
          image: item.image || null,
        });
      }
    }

    const finalTotal = roundCurrency(serverTotal);

    await client.query(
      `INSERT INTO orders (id, "guestId", "userId", items, total, "shippingInfo", "paymentMethod", status, "referralCode", "orderAccessTokenHash")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        orderId,
        resolvedGuestId,
        null,
        JSON.stringify(normalizedItems),
        finalTotal,
        JSON.stringify(shippingInfo),
        "invoice_payment",
        status,
        null,
        orderAccessTokenHash,
      ]
    );

    await client.query("COMMIT");

    // Send order confirmation via email if status is pending (invoice)
    if (status === "pending") {
      notificationService.sendOrderConfirmation(orderId, shippingInfo, normalizedItems, finalTotal)
        .catch(err => console.error("Notification failed:", err));
    }

    logActivity(
      admin.id,
      "order_create",
      "success",
      `Admin ${admin.username} manually created ${status === "quote" ? "quote" : "invoice"} ${orderId.substring(0, 8)} for ${shippingInfo.firstName} ${shippingInfo.lastName}`
    ).catch(err => console.error("Log failed:", err));

    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        total: finalTotal,
        status,
      },
      message: `${status === "quote" ? "Quote" : "Invoice"} created successfully`,
    }, { status: 201 });

  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Manual order creation error:", error);
    return apiResponse.error(
      error instanceof Error ? error.message : "Failed to create manual order"
    );
  } finally {
    client.release();
  }
}
