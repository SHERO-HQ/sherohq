import { apiResponse, validateCsrf } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { orders, products, newsletterSubscribers } from "@/lib/drizzle/schema";
import { desc, eq, and, gte, lte, inArray, sql, SQL } from "drizzle-orm";

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
import { toReadableOrderId } from "@/utils/orderId";

// GET handler for admin list
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin || !["admin", "superadmin", "manager"].includes(admin.role)) {
      return apiResponse.unauthorized();
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const limit = Math.min(200, parseInt(searchParams.get("limit") || "100"));
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const conditions: SQL[] = [];

    if (status && ORDER_STATUSES.has(status)) {
      conditions.push(eq(orders.status, status));
    }

    if (startDate) {
      conditions.push(gte(orders.createdAt, new Date(startDate).toISOString()));
    }

    if (endDate) {
      conditions.push(lte(orders.createdAt, new Date(endDate).toISOString()));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
      .select()
      .from(orders)
      .where(whereClause)
      .orderBy(desc(orders.createdAt))
      .limit(limit);

    const ordersData = result.map((order) => ({
      ...order,
      items: safeParse(order.items),
      shippingInfo: safeParse(order.shippingInfo),
      total: Number(order.total),
    }));

    return apiResponse.success(ordersData);
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return apiResponse.error("Failed to fetch orders", 500);
  }
}

// POST handler for creating orders
export async function POST(request: NextRequest) {
  try {
    const csrfError = await validateCsrf(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const { items, shippingInfo, paymentMethod, guestId, referralCode } = body;

    const user = await getUserFromSession();
    const requesterUserId = user?.id || null;

    if (!items || !shippingInfo) {
      return apiResponse.error("Missing required fields", 400);
    }

    const normalizedPaymentMethod = normalizePaymentMethod(paymentMethod);
    if (!ORDER_PAYMENT_METHODS.has(normalizedPaymentMethod)) {
      return apiResponse.error("Invalid payment method", 400);
    }

    const productIds = items.map((i: any) => i.id);
    const orderId = uuidv4();
    const clientReference = toReadableOrderId(orderId); // e.g. "ORD-A1B2C3D4"
    const orderAccessToken = randomBytes(32).toString("hex");
    const orderAccessTokenHash = hashOrderAccessToken(orderAccessToken);

    const txResult = await db.transaction(async (tx) => {
      const productsRes = await tx
        .select({
          id: products.id,
          name: products.name,
          price: products.price,
          costPrice: products.costPrice,
          stockQuantity: products.stockQuantity,
          inStock: products.inStock,
          sku: products.sku,
          images: products.images
        })
        .from(products)
        .where(inArray(products.id, productIds))
        .for("update");

      const productMap = new Map(productsRes.map(r => [r.id, r]));
      const normalizedItems = [];
      let serverTotal = 0;
      let serverCogs = 0;

      for (const item of items) {
        const product = productMap.get(item.id);
        if (!product || !product.inStock || (product.stockQuantity ?? 0) < item.quantity) {
          throw new Error(`Insufficient stock for ${product?.name || 'unknown product'}. Only ${product?.stockQuantity || 0} left.`);
        }

        const unitPrice = roundCurrency(Number(product.price));
        const costPrice = roundCurrency(Number(product.costPrice || 0));
        serverTotal += unitPrice * item.quantity;
        serverCogs += costPrice * item.quantity;

        const imagesArr = product.images as string[] | null;
        normalizedItems.push({
          id: product.id,
          name: product.name,
          price: unitPrice,
          costPrice: costPrice,
          quantity: item.quantity,
          sku: product.sku || undefined,
          image: item.image || (imagesArr && imagesArr.length > 0 ? imagesArr[0] : undefined),
        });

        // Update stock
        const newQuantity = (product.stockQuantity ?? 0) - item.quantity;
        await tx
          .update(products)
          .set({ 
            stockQuantity: newQuantity, 
            inStock: newQuantity > 0 
          })
          .where(eq(products.id, product.id));

        if (newQuantity <= 5) {
          notificationService.sendLowStockAlert(product.name, newQuantity).catch(console.error);
        }
      }

      const finalTotal = roundCurrency(serverTotal);
      const finalCogs = roundCurrency(serverCogs);
      const resolvedGuestId = guestId || uuidv4();

      await tx.insert(orders).values({
        id: orderId,
        guestId: resolvedGuestId,
        userId: requesterUserId,
        items: normalizedItems,
        total: finalTotal.toString(),
        cogs: finalCogs.toString(),
        shippingInfo: shippingInfo,
        paymentMethod: normalizedPaymentMethod,
        status: "pending",
        referralCode: referralCode || null,
        orderAccessTokenHash,
        clientReference,
      });

      // Capture contact for campaigns
      const contactEmail = body.email || shippingInfo?.email;
      const contactPhone = body.phone || shippingInfo?.phone;
      const contactName = [shippingInfo?.firstName, shippingInfo?.lastName].filter(Boolean).join(" ");
      
      if (contactEmail) {
        try {
          await tx.insert(newsletterSubscribers).values({
            id: uuidv4(),
            email: contactEmail,
            name: contactName || null,
            phone: contactPhone || null,
            source: 'checkout',
            status: 'active',
            unsubscribeToken: uuidv4()
          }).onConflictDoUpdate({
            target: newsletterSubscribers.email,
            set: {
              name: sql`COALESCE(EXCLUDED.name, ${newsletterSubscribers.name})`,
              phone: sql`COALESCE(EXCLUDED.phone, ${newsletterSubscribers.phone})`,
              updatedAt: sql`CURRENT_TIMESTAMP`
            }
          });
        } catch (err) {
          console.error("Failed to capture newsletter subscriber from checkout:", err);
        }
      }

      return { finalTotal, normalizedItems };
    });

    // Notifications (Async) - Delay sending email unless Cash on Delivery
    if (normalizedPaymentMethod === "cash_on_delivery") {
      try {
        await notificationService.sendOrderConfirmation(
          orderId, 
          shippingInfo, 
          txResult.normalizedItems, 
          txResult.finalTotal, 
          normalizedPaymentMethod
        );
      } catch (err) {
        console.error("Notification failed:", err);
      }
    }
    
    logActivity(null, "New Order Received", "success", `Order ${orderId.substring(0,8)} placed by ${shippingInfo.firstName}`)
      .catch(err => console.error("Log failed:", err));

    return apiResponse.success({
      success: true,
      orderId,
      total: txResult.finalTotal,
      orderAccessToken,
      message: "Order created successfully",
    }, 201);

  } catch (error) {
    console.error("Order creation error:", error);
    return apiResponse.error(error instanceof Error ? error.message : "Failed to create order", 500);
  }
}
