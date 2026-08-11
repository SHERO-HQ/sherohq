import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { products, orders } from "@/lib/drizzle/schema";
import { eq, sql } from "drizzle-orm";
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

    const finalResult = await db.transaction(async (tx) => {
      // Gather catalog product IDs to check stock
      const productIds = items.filter((i: any) => i.id).map((i: any) => i.id);
      let productMap = new Map();

      if (productIds.length > 0) {
        // Use FOR UPDATE to lock rows during transaction
        const productsRes = await tx.execute(
          sql`SELECT id, name, price, "costPrice", "stockQuantity", "inStock" FROM products WHERE id = ANY(${productIds}) FOR UPDATE`
        );
        productMap = new Map(productsRes.rows.map(r => [r.id, r]));
      }

      const normalizedItems = [];
      let serverTotal = 0;
      let serverCogs = 0;
      const lowStockAlerts = [];

      for (const item of items) {
        if (item.id && productMap.has(item.id)) {
          // catalog product
          const product = productMap.get(item.id);
          if (!product || !product.inStock || product.stockQuantity < item.quantity) {
            throw new Error(`Insufficient stock for ${product?.name || "unknown product"}`);
          }

          const unitPrice = roundCurrency(Number(product.price));
          const costPrice = roundCurrency(Number(product.costPrice || 0));
          serverTotal += unitPrice * item.quantity;
          serverCogs += costPrice * item.quantity;

          normalizedItems.push({
            id: product.id,
            name: product.name,
            price: unitPrice,
            costPrice: costPrice,
            quantity: item.quantity,
            image: item.image || product.image || null,
          });

          // Decrement stock
          const newQuantity = product.stockQuantity - item.quantity;
          await tx.update(products)
            .set({ 
              stockQuantity: newQuantity, 
              inStock: newQuantity > 0 
            })
            .where(eq(products.id, product.id));

          if (newQuantity <= 5) {
            lowStockAlerts.push({ name: product.name, quantity: newQuantity });
          }
        } else {
          // Custom item or service
          const unitPrice = roundCurrency(Number(item.price));
          serverTotal += unitPrice * item.quantity;

          normalizedItems.push({
            id: item.id || null,
            name: item.name,
            price: unitPrice,
            costPrice: 0,
            quantity: item.quantity,
            image: item.image || null,
          });
        }
      }

      const finalTotal = roundCurrency(serverTotal);
      const finalCogs = roundCurrency(serverCogs);

      await tx.insert(orders).values({
        id: orderId,
        guestId: resolvedGuestId,
        userId: null,
        items: normalizedItems,
        total: finalTotal.toString(),
        cogs: finalCogs.toString(),
        shippingInfo: shippingInfo,
        paymentMethod: "invoice_payment",
        status: status,
        referralCode: null,
        orderAccessTokenHash: orderAccessTokenHash,
      });

      return { finalTotal, normalizedItems, lowStockAlerts };
    });

    // Send low stock alerts (outside transaction)
    for (const alert of finalResult.lowStockAlerts) {
      notificationService.sendLowStockAlert(alert.name, alert.quantity).catch(console.error);
    }

    // Send order confirmation via email if status is pending (invoice)
    if (status === "pending") {
      notificationService.sendOrderConfirmation(orderId, shippingInfo, finalResult.normalizedItems, finalResult.finalTotal, "cash_on_delivery")
        .catch(err => console.error("Notification failed:", err));
    }

    logActivity(
      admin.id,
      "order_create",
      "success",
      `Admin ${admin.username} manually created ${status === "quote" ? "quote" : "invoice"} ${orderId.substring(0, 8)} for ${shippingInfo.firstName} ${shippingInfo.lastName}`
    ).catch(err => console.error("Log failed:", err));

    return apiResponse.success({
      success: true,
      order: {
        id: orderId,
        total: finalResult.finalTotal,
        status,
      },
      message: `${status === "quote" ? "Quote" : "Invoice"} created successfully`,
    }, 201);

  } catch (error: any) {
    console.error("Manual order creation error:", error);
    return apiResponse.error(
      error instanceof Error ? error.message : "Failed to create manual order",
      500
    );
  }
}
