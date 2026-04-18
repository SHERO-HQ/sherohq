import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { createHash, randomBytes } from "node:crypto";
import { rateLimit } from "express-rate-limit";
import db from "../db/database";
import { adminAuth, AdminRequest, requireRole } from "../middleware/adminAuth";
import { logActivity } from "./activity";
import { notificationService } from "../services/NotificationService";
import { validateBody } from "../middleware/validate";
import { CreateOrderSchema, UpdateOrderStatusSchema } from "../schemas";
import {
  ADMIN_SESSION_COOKIE,
  USER_SESSION_COOKIE,
  getTokenFromRequest,
} from "../utils/sessionAuth";

const router = Router();

/** UUID v4 format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

const safeParse = (val: unknown): unknown => {
  if (!val) return null;
  if (typeof val !== "string") return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    console.error("Failed to parse JSON field:", e);
    return val;
  }
};

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  postalCode?: string;
}

interface CreateOrderBody {
  guestId?: string;
  items: OrderItem[];
  total: number;
  shippingInfo: ShippingInfo;
  paymentMethod: string;
  referralCode?: string;
}

interface ProductPricingRow {
  id: string;
  name: string;
  price: string | number;
  image?: string | null;
  stockQuantity: number;
  inStock: boolean;
}

interface OrderAccessContext {
  userId: string | null;
  adminId: string | null;
  hasValidOrderAccessToken: boolean;
}

const ORDER_PAYMENT_METHODS = new Set([
  "card",
  "momo",
  "cash",
  "cod",
  "cash_on_delivery",
  "paystack",
  "store_pickup",
  "invoice_payment",
]);

const PAYMENT_METHOD_ALIASES: Record<string, string> = {
  mobile_money: "momo",
};

const roundCurrency = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

const normalizePaymentMethod = (value: string): string =>
  PAYMENT_METHOD_ALIASES[value] || value;

const hashOrderAccessToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

const readOrderAccessToken = (req: Request): string | null => {
  const tokenHeader = req.headers["x-order-access-token"];
  if (typeof tokenHeader !== "string") return null;

  const token = tokenHeader.trim();
  return token.length > 0 ? token : null;
};

async function resolveUserIdFromRequest(req: Request): Promise<string | null> {
  const token = getTokenFromRequest(req, USER_SESSION_COOKIE);
  if (!token) return null;

  const result = await db.query(
    `SELECT "userId" FROM user_sessions WHERE token = $1 AND "expiresAt" > NOW()`,
    [token],
  );

  return result.rows[0]?.userId || null;
}

async function resolveAdminIdFromRequest(req: Request): Promise<string | null> {
  const token = getTokenFromRequest(req, ADMIN_SESSION_COOKIE);
  if (!token) return null;

  const result = await db.query(
    `SELECT "adminId" FROM sessions WHERE token = $1 AND "expiresAt" > NOW()`,
    [token],
  );

  return result.rows[0]?.adminId || null;
}

async function resolveOrderAccessContext(
  req: Request,
  orderAccessTokenHash: string | null,
): Promise<OrderAccessContext> {
  const [userId, adminId] = await Promise.all([
    resolveUserIdFromRequest(req),
    resolveAdminIdFromRequest(req),
  ]);

  const providedOrderAccessToken = readOrderAccessToken(req);
  const hasValidOrderAccessToken =
    Boolean(providedOrderAccessToken) &&
    Boolean(orderAccessTokenHash) &&
    hashOrderAccessToken(String(providedOrderAccessToken)) ===
      orderAccessTokenHash;

  return {
    userId,
    adminId,
    hasValidOrderAccessToken,
  };
}

// Database row type (items and shippingInfo are stored as JSON strings)
interface OrderRow {
  id: string;
  guestId: string;
  items: string;
  total: number; // Postgres decimal returns as string/number usually, check driver
  shippingInfo: string;
  paymentMethod: string;
  status: string;
  createdAt: Date;
  referralCode?: string;
}

// Valid order statuses
const ORDER_STATUSES = new Set([
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "quote",
]);

// Rate limiter for the guest orders lookup to slow down enumeration
const guestOrdersLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// POST /api/orders/admin - Admin Create Order/Quote
router.post(
  "/admin",
  adminAuth,
  requireRole("admin"),
  validateBody(CreateOrderSchema),
  async (req: AdminRequest, res: Response) => {
    try {
      const { items, total, shippingInfo } = req.body;

      // Determine type: use "quote" status to create a quote, otherwise "pending"
      const isQuote = req.body.status === "quote";
      const status = isQuote ? "quote" : "pending";

      const orderId = uuidv4();
      // guestId is required by DB currently, so generate one or use a placeholder
      const guestId = `admin_${uuidv4().substring(0, 8)}`;

      await db.query(
        `
      INSERT INTO orders (id, "guestId", "userId", items, total, "shippingInfo", "paymentMethod", status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
        [
          orderId,
          guestId,
          req.admin?.id || null, // Track which admin created it? Or leave null. Schema says userId.
          JSON.stringify(items),
          total,
          JSON.stringify(shippingInfo), // Object to JSON string
          "invoice_payment", // Default payment method for invoices
          status,
        ],
      );

      console.log(
        `📦 Admin created ${isQuote ? "Quote" : "Order"}: ${orderId} by ${req.admin?.username}`,
      );

      // 🔥 Send Admin Invoice or Quote Notification
      if (isQuote) {
        notificationService
          .sendQuote(orderId, shippingInfo, items, total)
          .catch((err: unknown) =>
            console.error("Quote notification failed:", err),
          );
      } else {
        notificationService
          .sendInvoice(orderId, shippingInfo, items, total)
          .catch((err: unknown) =>
            console.error("Invoice notification failed:", err),
          );
      }

      res.status(201).json({
        success: true,
        order: {
          id: orderId,
          status,
        },
        message: `${isQuote ? "Quote" : "Order"} created successfully`,
      });
    } catch (error) {
      console.error("Error creating order:", error);
      const isDev = process.env.NODE_ENV === "development";
      res.status(500).json({
        error: "Failed to create order",
        ...(isDev && {
          details: error instanceof Error ? error.message : "Unknown error",
        }),
      });
    }
  },
);

// POST /api/orders - Create new order
router.post(
  "/",
  validateBody(CreateOrderSchema),
  async (req: Request, res: Response) => {
    const client = await db.getClient();

    try {
      const {
        guestId,
        items,
        shippingInfo,
        paymentMethod,
        referralCode,
      }: CreateOrderBody = req.body;

      const requesterUserId = await resolveUserIdFromRequest(req);

      // Validate required fields
      if (!items || !shippingInfo) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const normalizedPaymentMethod = normalizePaymentMethod(paymentMethod);
      if (!ORDER_PAYMENT_METHODS.has(normalizedPaymentMethod)) {
        return res.status(400).json({ error: "Invalid payment method" });
      }

      const requestedQuantities = new Map<string, number>();
      for (const item of items) {
        requestedQuantities.set(
          item.id,
          (requestedQuantities.get(item.id) || 0) + item.quantity,
        );
      }

      const productIds = [...requestedQuantities.keys()];
      if (productIds.length === 0) {
        return res
          .status(400)
          .json({ error: "Order must include at least one item" });
      }

      const orderId = uuidv4();
      const orderAccessToken = randomBytes(32).toString("hex");
      const orderAccessTokenHash = hashOrderAccessToken(orderAccessToken);

      await client.query("BEGIN");

      const productsRes = await client.query(
        `
      SELECT
        id,
        name,
        price,
        image,
        "stockQuantity",
        "inStock"
      FROM products
      WHERE id = ANY($1::text[])
      FOR UPDATE
      `,
        [productIds],
      );

      const productRows = productsRes.rows as ProductPricingRow[];
      const productMap = new Map(productRows.map((row) => [row.id, row]));

      if (productMap.size !== productIds.length) {
        const missing = productIds.filter((id) => !productMap.has(id));
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: "Some products no longer exist",
          missingProductIds: missing,
        });
      }

      const normalizedItems: OrderItem[] = [];
      let serverTotal = 0;

      for (const item of items) {
        const product = productMap.get(item.id);
        if (!product) {
          await client.query("ROLLBACK");
          return res
            .status(400)
            .json({ error: `Product not found: ${item.id}` });
        }

        if (!product.inStock || product.stockQuantity < item.quantity) {
          await client.query("ROLLBACK");
          return res.status(400).json({
            error: `Insufficient stock for ${product.name}`,
          });
        }

        const unitPrice = roundCurrency(Number(product.price));
        serverTotal += unitPrice * item.quantity;

        normalizedItems.push({
          id: product.id,
          name: product.name,
          price: unitPrice,
          quantity: item.quantity,
          image: product.image || undefined,
        });
      }

      for (const [productId, quantity] of requestedQuantities.entries()) {
        const product = productMap.get(productId);
        if (!product) continue;

        const newQuantity = product.stockQuantity - quantity;
        await client.query(
          `
        UPDATE products
        SET "stockQuantity" = $1,
            "inStock" = $2
        WHERE id = $3
        `,
          [newQuantity, newQuantity > 0, productId],
        );
      }

      const finalTotal = roundCurrency(serverTotal);
      const resolvedGuestId = guestId || uuidv4();

      await client.query(
        `
      INSERT INTO orders (id, "guestId", "userId", items, total, "shippingInfo", "paymentMethod", status, "referralCode", "orderAccessTokenHash")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `,
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
        ],
      );

      await client.query("COMMIT");

      console.log(
        `📦 New order created: ${orderId} for guest ${resolvedGuestId}`,
      );

      // 🔥 Send Notifications (Async)
      notificationService
        .sendOrderConfirmation(
          orderId,
          shippingInfo,
          normalizedItems,
          finalTotal,
        )
        .catch((err) => console.error("Notification trigger failed:", err));

      res.status(201).json({
        success: true,
        orderId,
        total: finalTotal,
        orderAccessToken,
        message: "Order created successfully",
      });
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // noop
      }

      console.error("Order creation error:", error);
      const isDev = process.env.NODE_ENV === "development";
      res.status(500).json({
        error: "Failed to create order",
        ...(isDev && {
          details: error instanceof Error ? error.message : "Unknown error",
        }),
      });
    } finally {
      client.release();
    }
  },
);

// GET /api/orders/user/:userId - Get orders by User ID
router.get("/user/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const requesterUserId = await resolveUserIdFromRequest(req);

    if (!requesterUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (requesterUserId !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to access these orders" });
    }

    const result = await db.query(
      `
      SELECT * FROM orders
      WHERE "userId" = $1
      ORDER BY "createdAt" DESC
    `,
      [requesterUserId],
    );

    const orders = result.rows as OrderRow[];

    const parsedOrders = orders.map((order) => ({
      ...order,
      items: safeParse(order.items),
      shippingInfo: safeParse(order.shippingInfo),
      total: Number(order.total),
    }));

    res.json(parsedOrders);
  } catch (error) {
    console.error("Error fetching order:", error);
    const isDev = process.env.NODE_ENV === "development";
    res.status(500).json({
      error: "Failed to fetch order",
      ...(isDev && {
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    });
  }
});

// GET /api/orders/guest/:guestId - Get orders by guest ID
router.get(
  "/guest/:guestId",
  guestOrdersLimiter,
  async (req: Request, res: Response) => {
    try {
      const { guestId } = req.params;

      // Validate that guestId is a proper UUID to prevent arbitrary DB lookups
      if (typeof guestId !== "string" || !UUID_RE.test(guestId)) {
        return res.status(400).json({ error: "Invalid guest ID" });
      }

      const result = await db.query(
        `
      SELECT * FROM orders
      WHERE "guestId" = $1
      ORDER BY "createdAt" DESC
    `,
        [guestId],
      );

      const orders = result.rows as OrderRow[];

      const parsedOrders = orders.map((order) => ({
        id: order.id,
        guestId: order.guestId,
        status: order.status,
        total: Number(order.total),
        createdAt: order.createdAt,
        paymentMethod: order.paymentMethod,
        referralCode: order.referralCode,
      }));

      res.json(parsedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      const isDev = process.env.NODE_ENV === "development";
      res.status(500).json({
        error: "Failed to fetch orders",
        ...(isDev && {
          details: error instanceof Error ? error.message : "Unknown error",
        }),
      });
    }
  },
);

// GET /api/orders/track/:orderId - Track specific order
router.get("/track/:orderId", async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const rawOrderId = String(orderId || "").trim();

    let orderQuery = "";
    let orderParams: string[] = [];

    if (UUID_RE.test(rawOrderId)) {
      orderQuery = `
        SELECT *, "orderAccessTokenHash"
        FROM orders
        WHERE id = $1
      `;
      orderParams = [rawOrderId];
    } else {
      const compactCandidate = rawOrderId
        .toLowerCase()
        .replace(/^ord-/, "")
        .replace(/[^0-9a-f]/g, "");

      if (compactCandidate.length === 32) {
        orderQuery = `
          SELECT *, "orderAccessTokenHash"
          FROM orders
          WHERE replace(lower(id), '-', '') = $1
        `;
        orderParams = [compactCandidate];
      } else if (compactCandidate.length >= 8) {
        orderQuery = `
          SELECT *, "orderAccessTokenHash"
          FROM orders
          WHERE replace(lower(id), '-', '') LIKE $1 || '%'
          ORDER BY "createdAt" DESC
          LIMIT 2
        `;
        orderParams = [compactCandidate.slice(0, 8)];
      } else {
        return res.status(400).json({ error: "Invalid order identifier" });
      }
    }

    const result = await db.query(orderQuery, orderParams);

    if (result.rowCount && result.rowCount > 1) {
      return res.status(409).json({
        error:
          "Multiple orders match this short tracking identifier. Use the full tracking link.",
      });
    }

    const order = result.rows[0] as
      | (OrderRow & { userId?: string; orderAccessTokenHash?: string })
      | undefined;

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const accessContext = await resolveOrderAccessContext(
      req,
      order.orderAccessTokenHash || null,
    );

    const isAuthorized =
      Boolean(accessContext.adminId) ||
      (Boolean(accessContext.userId) &&
        Boolean(order.userId) &&
        accessContext.userId === order.userId) ||
      accessContext.hasValidOrderAccessToken;

    if (!isAuthorized) {
      return res.json({
        id: order.id,
        status: order.status,
        createdAt: order.createdAt,
        paymentMethod: order.paymentMethod,
      });
    }

    res.json({
      ...order,
      items: safeParse(order.items),
      shippingInfo: safeParse(order.shippingInfo),
      total: Number(order.total),
      orderAccessTokenHash: undefined,
    });
  } catch (error) {
    console.error("Error tracking order:", error);
    res.status(500).json({
      error: "Failed to track order",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// PATCH /api/orders/:id/payment-method - Update payment method (Public/Auth)
router.patch("/:id/payment-method", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({ error: "Payment method is required" });
    }

    const normalizedPaymentMethod = normalizePaymentMethod(paymentMethod);
    if (!ORDER_PAYMENT_METHODS.has(normalizedPaymentMethod)) {
      return res.status(400).json({ error: "Invalid payment method" });
    }

    // Verify order ownership
    const check = await db.query(
      'SELECT "guestId", "userId", status, "orderAccessTokenHash" FROM orders WHERE id = $1',
      [id],
    );

    if (check.rowCount === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = check.rows[0];
    const accessContext = await resolveOrderAccessContext(
      req,
      order.orderAccessTokenHash || null,
    );

    // Security: Ensure the requester is an authenticated owner or has valid per-order guest token.
    const isOwner =
      Boolean(accessContext.adminId) ||
      (Boolean(accessContext.userId) &&
        Boolean(order.userId) &&
        order.userId === accessContext.userId) ||
      accessContext.hasValidOrderAccessToken;

    if (!isOwner) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this order" });
    }

    // Only allow updating if order is still pending
    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Order cannot be updated in its current status" });
    }

    await db.query('UPDATE orders SET "paymentMethod" = $1 WHERE id = $2', [
      normalizedPaymentMethod,
      id,
    ]);

    res.json({ success: true, message: "Payment method updated successfully" });
  } catch (error) {
    console.error("Error updating order payment method:", error);
    res.status(500).json({ error: "Failed to update payment method" });
  }
});

// ============ ADMIN ROUTES (Protected) ============

// GET /api/orders - Admin: List all orders with optional filtering
router.get(
  "/",
  adminAuth,
  requireRole("manager"),
  async (req: AdminRequest, res: Response) => {
    try {
      const { status, limit = 100, startDate, endDate } = req.query;
      const safeLimit = Math.min(
        200,
        Math.max(1, Number.parseInt(String(limit), 10) || 100),
      );

      let queryText = "SELECT * FROM orders";
      const params: (string | number)[] = [];
      const conditions: string[] = [];
      let paramIndex = 1;

      if (status && typeof status === "string" && ORDER_STATUSES.has(status)) {
        conditions.push(`status = $${paramIndex}`);
        params.push(status);
        paramIndex++;
      }

      if (startDate && typeof startDate === "string") {
        conditions.push(`"createdAt" >= $${paramIndex}`);
        params.push(startDate);
        paramIndex++;
      }

      if (endDate && typeof endDate === "string") {
        conditions.push(`"createdAt" <= $${paramIndex}`);
        params.push(endDate);
        paramIndex++;
      }

      if (conditions.length > 0) {
        queryText += " WHERE " + conditions.join(" AND ");
      }

      queryText += ` ORDER BY "createdAt" DESC LIMIT $${paramIndex}`;
      params.push(safeLimit);

      const result = await db.query(queryText, params);
      const orders = result.rows as OrderRow[];

      const parsedOrders = orders.map((order) => ({
        ...order,
        items: safeParse(order.items),
        shippingInfo: safeParse(order.shippingInfo),
        total: Number(order.total),
      }));

      res.json(parsedOrders);
    } catch (error) {
      console.error("Error fetching all orders (Admin):", error);
      res.status(500).json({
        error: "Failed to fetch orders",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

// GET /api/orders/:id - Admin: Get single order details
router.get(
  "/:id",
  adminAuth,
  requireRole("manager"),
  async (req: AdminRequest, res: Response) => {
    try {
      const { id } = req.params;

      const result = await db.query("SELECT * FROM orders WHERE id = $1", [id]);
      const order = result.rows[0] as OrderRow | undefined;

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.json({
        ...order,
        items: safeParse(order.items),
        shippingInfo: safeParse(order.shippingInfo),
        total: Number(order.total),
      });
    } catch (error) {
      console.error("Error fetching order detail (Admin):", error);
      res.status(500).json({
        error: "Failed to fetch order",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

// PATCH /api/orders/:id/status - Admin: Update order status
// PATCH /api/orders/:id/status - Update order status (Admin only)
router.patch(
  "/:id/status",
  adminAuth,
  requireRole("manager"),
  validateBody(UpdateOrderStatusSchema),
  async (req: AdminRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Check if order exists
      const check = await db.query(
        "SELECT id, status FROM orders WHERE id = $1",
        [id],
      );
      if (check.rowCount === 0) {
        return res.status(404).json({ error: "Order not found" });
      }

      const existing = check.rows[0];

      await db.query("UPDATE orders SET status = $1 WHERE id = $2", [
        status,
        id,
      ]);

      console.log(
        `📦 Order ${id} status: ${existing.status} → ${status} by ${req.admin?.username}`,
      );

      // 🔥 Trigger Payment Receipt if manually marked as paid (processing)
      if (status === "processing" && existing.status === "pending") {
        try {
          const orderResult = await db.query(
            "SELECT * FROM orders WHERE id = $1",
            [id],
          );
          if (orderResult.rowCount && orderResult.rowCount > 0) {
            const order = orderResult.rows[0];
            const items = safeParse(order.items) as OrderItem[];
            const shippingInfo = safeParse(order.shippingInfo) as ShippingInfo;

            notificationService
              .sendPaymentReceipt(
                String(id),
                shippingInfo,
                items,
                Number(order.total),
                {
                  method: order.paymentMethod,
                  transactionId: "ADMIN_MANUAL_CONFIRM",
                },
              )
              .catch((err) =>
                console.error(
                  "Manual receipt notification trigger failed:",
                  err,
                ),
              );
          }
        } catch (err) {
          console.error("Failed to trigger manual receipt:", err);
        }
      }
      const orderIdStr = String(id);
      let activityType: "info" | "success" | "warning" | "error" = "info";
      if (status === "delivered") activityType = "success";
      if (status === "cancelled") activityType = "warning";

      if (req.admin?.id) {
        await logActivity(
          req.admin.id,
          "order_status_update",
          activityType,
          `Changed order status for #${orderIdStr.substring(0, 8)}: ${existing.status} → ${status}`,
        );
      }

      const result = await db.query("SELECT * FROM orders WHERE id = $1", [
        String(id),
      ]);
      const order = result.rows[0] as OrderRow;

      res.json({
        success: true,
        order: {
          ...order,
          items: safeParse(order.items),
          shippingInfo: safeParse(order.shippingInfo),
          total: Number(order.total),
        },
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      const isDev = process.env.NODE_ENV === "development";
      res.status(500).json({
        error: "Failed to update order status",
        ...(isDev && {
          details: error instanceof Error ? error.message : "Unknown error",
        }),
      });
    }
  },
);

export default router;
