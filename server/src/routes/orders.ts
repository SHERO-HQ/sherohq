import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db/database";
import { adminAuth, AdminRequest } from "../middleware/adminAuth";
import { logActivity } from "./activity";
import { notificationService } from "../services/NotificationService";

const router = Router();

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

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
const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

// POST /api/orders - Create new order
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      guestId,
      userId,
      items,
      total,
      shippingInfo,
      paymentMethod,
    }: CreateOrderBody & { userId?: string } = req.body;

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
    notificationService
      .sendOrderConfirmation(orderId, shippingInfo, items, total)
      .catch((err) => console.error("Notification trigger failed:", err));

    res.status(201).json({
      success: true,
      orderId,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
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
      items: JSON.parse(order.items),
      shippingInfo: JSON.parse(order.shippingInfo),
      total: Number(order.total),
    }));

    res.json(parsedOrders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
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
      items: JSON.parse(order.items),
      shippingInfo: JSON.parse(order.shippingInfo),
      total: Number(order.total),
    }));

    res.json(parsedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET /api/orders/track/:orderId - Track specific order
router.get("/track/:orderId", async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const result = await db.query("SELECT * FROM orders WHERE id = $1", [
      orderId,
    ]);
    const order = result.rows[0] as OrderRow | undefined;

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      ...order,
      items: JSON.parse(order.items),
      shippingInfo: JSON.parse(order.shippingInfo),
      total: Number(order.total),
    });
  } catch (error) {
    console.error("Error tracking order:", error);
    res.status(500).json({ error: "Failed to track order" });
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

    if (status && ORDER_STATUSES.includes(String(status))) {
      conditions.push(`status = $${paramIndex}`);
      params.push(String(status));
      paramIndex++;
    }

    if (startDate) {
      conditions.push(`"createdAt" >= $${paramIndex}`);
      params.push(String(startDate));
      paramIndex++;
    }

    if (endDate) {
      conditions.push(`"createdAt" <= $${paramIndex}`);
      params.push(String(endDate));
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
      items: JSON.parse(order.items),
      shippingInfo: JSON.parse(order.shippingInfo),
      total: Number(order.total),
    }));

    res.json(parsedOrders);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
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
      items: JSON.parse(order.items),
      shippingInfo: JSON.parse(order.shippingInfo),
      total: Number(order.total),
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// PATCH /api/orders/:id/status - Admin: Update order status
router.patch(
  "/:id/status",
  adminAuth,
  async (req: AdminRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      if (!status || !ORDER_STATUSES.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Valid statuses: ${ORDER_STATUSES.join(", ")}`,
        });
      }

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

      const result = await db.query("SELECT * FROM orders WHERE id = $1", [id]);
      const order = result.rows[0] as OrderRow;

      res.json({
        success: true,
        order: {
          ...order,
          items: JSON.parse(order.items),
          shippingInfo: JSON.parse(order.shippingInfo),
          total: Number(order.total),
        },
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  },
);

export default router;
