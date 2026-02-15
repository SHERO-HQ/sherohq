import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db/database";
import { adminAuth, AdminRequest } from "../middleware/adminAuth";
import { logActivity } from "./activity";
import { notificationService } from "../services/NotificationService";
import { validateBody } from "../middleware/validate";
import { CreateOrderSchema, UpdateOrderStatusSchema } from "../schemas";

const router = Router();

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
    guestId: string;
    items: OrderItem[];
    total: number;
    shippingInfo: ShippingInfo;
    paymentMethod: string;
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
}

// Valid order statuses
const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "quote"];

// POST /api/orders/admin - Admin Create Order/Quote
router.post("/admin", adminAuth, validateBody(CreateOrderSchema), async (req: AdminRequest, res: Response) => {
    try {
        const { items, total, shippingInfo } = req.body;

        const status = "pending"; // Default to pending for admin orders

        // Determine type based on status or infer logic
        const isQuote = false; // Admin orders are not quotes by default

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

        console.log(`📦 Admin created ${isQuote ? "Quote" : "Order"}: ${orderId} by ${req.admin?.username}`);

        // 🔥 Send Admin Invoice or Quote Notification
        if (isQuote) {
            notificationService.sendQuote(orderId, shippingInfo, items, total).catch((err: unknown) => console.error("Quote notification failed:", err));
        } else {
            notificationService.sendInvoice(orderId, shippingInfo, items, total).catch((err: unknown) => console.error("Invoice notification failed:", err));
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
        console.error("Error deleting order:", error);
        const isDev = process.env.NODE_ENV === "development";
        res.status(500).json({
            error: "Failed to delete order",
            ...(isDev && { details: error instanceof Error ? error.message : "Unknown error" }),
        });
    }
});

// POST /api/orders - Create new order
router.post("/", async (req: Request, res: Response) => {
    try {
        const { guestId, userId, items, total, shippingInfo, paymentMethod }: CreateOrderBody & { userId?: string } = req.body;

        // Validate required fields
        if (!guestId || !items || !total || !shippingInfo) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const orderId = uuidv4();

        await db.query(
            `
      INSERT INTO orders (id, "guestId", "userId", items, total, "shippingInfo", "paymentMethod", status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
            [
                orderId,
                guestId,
                userId || null, // Optional userId
                JSON.stringify(items),
                total,
                JSON.stringify(shippingInfo),
                paymentMethod || "cash_on_delivery",
                "pending",
            ],
        );

        console.log(`📦 New order created: ${orderId} for guest ${guestId}`);

        // 🔥 Send Notifications (Async)
        notificationService.sendOrderConfirmation(orderId, shippingInfo, items, total).catch((err) => console.error("Notification trigger failed:", err));

        res.status(201).json({
            success: true,
            orderId,
            message: "Order created successfully",
        });
    } catch (error) {
        console.error("Order creation error:", error);
        const isDev = process.env.NODE_ENV === "development";
        res.status(500).json({
            error: "Failed to create order",
            ...(isDev && { details: error instanceof Error ? error.message : "Unknown error" }),
        });
    }
});

// GET /api/orders/user/:userId - Get orders by User ID
router.get("/user/:userId", async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const result = await db.query(
            `
      SELECT * FROM orders
      WHERE "userId" = $1
      ORDER BY "createdAt" DESC
    `,
            [userId],
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
            ...(isDev && { details: error instanceof Error ? error.message : "Unknown error" }),
        });
    }
});

// GET /api/orders/guest/:guestId - Get orders by guest ID
router.get("/guest/:guestId", async (req: Request, res: Response) => {
    try {
        const { guestId } = req.params;

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
            ...order,
            items: safeParse(order.items),
            shippingInfo: safeParse(order.shippingInfo),
            total: Number(order.total),
        }));

        res.json(parsedOrders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        const isDev = process.env.NODE_ENV === "development";
        res.status(500).json({
            error: "Failed to fetch orders",
            ...(isDev && { details: error instanceof Error ? error.message : "Unknown error" }),
        });
    }
});

// GET /api/orders/track/:orderId - Track specific order
router.get("/track/:orderId", async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;

        const result = await db.query("SELECT * FROM orders WHERE id = $1", [orderId]);
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
        const { paymentMethod, guestId, userId } = req.body;

        if (!paymentMethod) {
            return res.status(400).json({ error: "Payment method is required" });
        }

        // Verify order ownership
        const check = await db.query('SELECT "guestId", "userId", status FROM orders WHERE id = $1', [id]);

        if (check.rowCount === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        const order = check.rows[0];

        // Security: Ensure the requester matches guestId or userId
        const isOwner = (guestId && order.guestId === guestId) || (userId && order.userId === userId);

        if (!isOwner) {
            return res.status(403).json({ error: "Unauthorized to update this order" });
        }

        // Only allow updating if order is still pending
        if (order.status !== "pending") {
            return res.status(400).json({ error: "Order cannot be updated in its current status" });
        }

        await db.query('UPDATE orders SET "paymentMethod" = $1 WHERE id = $2', [paymentMethod, id]);

        res.json({ success: true, message: "Payment method updated successfully" });
    } catch (error) {
        console.error("Error updating order payment method:", error);
        res.status(500).json({ error: "Failed to update payment method" });
    }
});

// ============ ADMIN ROUTES (Protected) ============

// GET /api/orders - Admin: List all orders with optional filtering
router.get("/", adminAuth, async (req: AdminRequest, res: Response) => {
    try {
        const { status, limit = 100, startDate, endDate } = req.query;

        let queryText = "SELECT * FROM orders";
        const params: (string | number)[] = [];
        const conditions: string[] = [];
        let paramIndex = 1;

        if (status && typeof status === "string" && ORDER_STATUSES.includes(status)) {
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
        params.push(Number(limit));

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
});

// GET /api/orders/:id - Admin: Get single order details
router.get("/:id", adminAuth, async (req: AdminRequest, res: Response) => {
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
});

// PATCH /api/orders/:id/status - Admin: Update order status
// PATCH /api/orders/:id/status - Update order status (Admin only)
router.patch("/:id/status", adminAuth, validateBody(UpdateOrderStatusSchema), async (req: AdminRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Check if order exists
        const check = await db.query("SELECT id, status FROM orders WHERE id = $1", [id]);
        if (check.rowCount === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        const existing = check.rows[0];

        await db.query("UPDATE orders SET status = $1 WHERE id = $2", [status, id]);

        console.log(`📦 Order ${id} status: ${existing.status} → ${status} by ${req.admin?.username}`);

        // 🔥 Trigger Payment Receipt if manually marked as paid (processing)
        if (status === "processing" && existing.status === "pending") {
            try {
                const orderResult = await db.query("SELECT * FROM orders WHERE id = $1", [id]);
                if (orderResult.rowCount && orderResult.rowCount > 0) {
                    const order = orderResult.rows[0];
                    const items = safeParse(order.items) as OrderItem[];
                    const shippingInfo = safeParse(order.shippingInfo) as ShippingInfo;

                    notificationService
                        .sendPaymentReceipt(String(id), shippingInfo, items, Number(order.total), {
                            method: order.paymentMethod,
                            transactionId: "ADMIN_MANUAL_CONFIRM",
                        })
                        .catch((err) => console.error("Manual receipt notification trigger failed:", err));
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
            await logActivity(req.admin.id, "order_status_update", activityType, `Changed order status for #${orderIdStr.substring(0, 8)}: ${existing.status} → ${status}`);
        }

        const result = await db.query("SELECT * FROM orders WHERE id = $1", [String(id)]);
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
            ...(isDev && { details: error instanceof Error ? error.message : "Unknown error" }),
        });
    }
});

export default router;
