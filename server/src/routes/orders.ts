import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db/database";
import { adminAuth, AdminRequest } from "../middleware/adminAuth";
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
  total: number;
  shippingInfo: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
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
router.post("/", (req: Request, res: Response) => {
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

    const insertOrder = db.prepare(`
      INSERT INTO orders (id, guestId, userId, items, total, shippingInfo, paymentMethod, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertOrder.run(
      orderId,
      guestId,
      userId || null, // Optional userId
      JSON.stringify(items),
      total,
      JSON.stringify(shippingInfo),
      paymentMethod || "cash_on_delivery",
      "pending",
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
router.get("/user/:userId", (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const orders = db
      .prepare(
        `
      SELECT * FROM orders 
      WHERE userId = ? 
      ORDER BY createdAt DESC
    `,
      )
      .all(userId);

    const parsedOrders = (orders as OrderRow[]).map((order) => ({
      ...order,
      items: JSON.parse(order.items),
      shippingInfo: JSON.parse(order.shippingInfo),
    }));

    res.json(parsedOrders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET /api/orders/guest/:guestId - Get orders by guest ID
router.get("/guest/:guestId", (req: Request, res: Response) => {
  try {
    const { guestId } = req.params;

    const orders = db
      .prepare(
        `
      SELECT * FROM orders 
      WHERE guestId = ? 
      ORDER BY createdAt DESC
    `,
      )
      .all(guestId);

    const parsedOrders = (orders as OrderRow[]).map((order) => ({
      ...order,
      items: JSON.parse(order.items),
      shippingInfo: JSON.parse(order.shippingInfo),
    }));

    res.json(parsedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET /api/orders/track/:orderId - Track specific order
router.get("/track/:orderId", (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = db
      .prepare("SELECT * FROM orders WHERE id = ?")
      .get(orderId) as OrderRow | undefined;

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      ...order,
      items: JSON.parse(order.items),
      shippingInfo: JSON.parse(order.shippingInfo),
    });
  } catch (error) {
    console.error("Error tracking order:", error);
    res.status(500).json({ error: "Failed to track order" });
  }
});

// ============ ADMIN ROUTES (Protected) ============

// GET /api/orders - Admin: List all orders with optional filtering
router.get("/", adminAuth, (req: AdminRequest, res: Response) => {
  try {
    const { status, limit = 100, startDate, endDate } = req.query;

    let query = "SELECT * FROM orders";
    const params: (string | number)[] = [];
    const conditions: string[] = [];

    if (status && ORDER_STATUSES.includes(String(status))) {
      conditions.push("status = ?");
      params.push(String(status));
    }

    if (startDate) {
      conditions.push("createdAt >= ?");
      params.push(String(startDate));
    }

    if (endDate) {
      conditions.push("createdAt <= ?");
      params.push(String(endDate));
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY createdAt DESC LIMIT ?";
    params.push(Number(limit));

    const orders = db.prepare(query).all(...params);

    const parsedOrders = (orders as OrderRow[]).map((order) => ({
      ...order,
      items: JSON.parse(order.items),
      shippingInfo: JSON.parse(order.shippingInfo),
    }));

    res.json(parsedOrders);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET /api/orders/:id - Admin: Get single order details
router.get("/:id", adminAuth, (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as
      | OrderRow
      | undefined;

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      ...order,
      items: JSON.parse(order.items),
      shippingInfo: JSON.parse(order.shippingInfo),
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// PATCH /api/orders/:id/status - Admin: Update order status
router.patch("/:id/status", adminAuth, (req: AdminRequest, res: Response) => {
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
    const existing = db
      .prepare("SELECT id, status FROM orders WHERE id = ?")
      .get(id) as { id: string; status: string } | undefined;

    if (!existing) {
      return res.status(404).json({ error: "Order not found" });
    }

    db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);

    console.log(
      `📦 Order ${id} status: ${existing.status} → ${status} by ${req.admin?.username}`,
    );

    const order = db
      .prepare("SELECT * FROM orders WHERE id = ?")
      .get(id) as OrderRow;

    res.json({
      success: true,
      order: {
        ...order,
        items: JSON.parse(order.items),
        shippingInfo: JSON.parse(order.shippingInfo),
      },
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

export default router;
