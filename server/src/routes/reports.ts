import { Router, Response } from "express";
import db from "../db/database";
import { adminAuth, AdminRequest } from "../middleware/adminAuth";

const router = Router();

interface AnalyticsData {
  date: string;
  revenue: number;
  orders: number;
}

// GET /api/reports/stats - Get dashboard stats
router.get("/stats", adminAuth, (req: AdminRequest, res: Response) => {
  try {
    // Total Revenue
    const revenueResult = db
      .prepare(
        "SELECT SUM(total) as total FROM orders WHERE status != 'cancelled'",
      )
      .get() as { total: number };
    const totalRevenue = revenueResult.total || 0;

    // Total Orders
    const ordersResult = db
      .prepare("SELECT COUNT(*) as count FROM orders")
      .get() as { count: number };
    const totalOrders = ordersResult.count || 0;

    // Total Products
    const productsResult = db
      .prepare("SELECT COUNT(*) as count FROM products")
      .get() as { count: number };
    const totalProducts = productsResult.count || 0;

    // Low Stock Products
    const lowStockResult = db
      .prepare(
        "SELECT COUNT(*) as count FROM products WHERE stockQuantity <= 10",
      )
      .get() as { count: number };
    const lowStockProducts = lowStockResult.count || 0;

    res.json({
      revenue: totalRevenue,
      orders: totalOrders,
      products: totalProducts,
      lowStock: lowStockProducts,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// GET /api/reports/analytics - Get sales analytics over time
router.get("/analytics", adminAuth, (req: AdminRequest, res: Response) => {
  try {
    const { range = "7d" } = req.query; // 7d, 30d, 90d

    let days = 7;
    if (range === "30d") days = 30;
    if (range === "90d") days = 90;

    // Get orders from the last N days
    const orders = db
      .prepare(
        `
        SELECT createdAt, total 
        FROM orders 
        WHERE status != 'cancelled' 
        AND createdAt >= date('now', ?)
        ORDER BY createdAt ASC
      `,
      )
      .all(`-${days} days`) as { createdAt: string; total: number }[];

    // Group by date
    const groupedData: Record<string, { revenue: number; orders: number }> = {};

    // Initialize dates
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      groupedData[dateStr] = { revenue: 0, orders: 0 };
    }

    orders.forEach((order) => {
      const dateStr = order.createdAt.split("T")[0];
      if (groupedData[dateStr]) {
        groupedData[dateStr].revenue += order.total;
        groupedData[dateStr].orders += 1;
      }
    });

    const chartData: AnalyticsData[] = Object.entries(groupedData)
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json(chartData);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// GET /api/reports/top-products - Get top selling products
router.get("/top-products", adminAuth, (req: AdminRequest, res: Response) => {
  try {
    // This assumes items are stored as JSON and hard to query with SQL alone properly without recursion/json_each
    // For simplicity with this schema, we fetch all orders and aggregate in memory.
    // In a production DB with normalized order_items table, we would use SQL.

    const orders = db
      .prepare("SELECT items FROM orders WHERE status != 'cancelled'")
      .all() as { items: string }[];

    const productSales: Record<
      string,
      { name: string; quantity: number; revenue: number }
    > = {};

    orders.forEach((order) => {
      const items = JSON.parse(order.items);
      items.forEach((item: any) => {
        if (!productSales[item.id]) {
          productSales[item.id] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productSales[item.id].quantity += item.quantity;
        productSales[item.id].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    res.json(topProducts);
  } catch (error) {
    console.error("Error fetching top products:", error);
    res.status(500).json({ error: "Failed to fetch top products" });
  }
});

// GET /api/reports/stock-distribution - Get stock status distribution
router.get(
  "/stock-distribution",
  adminAuth,
  (req: AdminRequest, res: Response) => {
    try {
      const inStock = db
        .prepare(
          "SELECT COUNT(*) as count FROM products WHERE inStock = 1 AND stockQuantity > 10",
        )
        .get() as { count: number };

      const lowStock = db
        .prepare(
          "SELECT COUNT(*) as count FROM products WHERE stockQuantity <= 10 AND stockQuantity > 0",
        )
        .get() as { count: number };

      const outOfStock = db
        .prepare(
          "SELECT COUNT(*) as count FROM products WHERE inStock = 0 OR stockQuantity = 0",
        )
        .get() as { count: number };

      res.json([
        { name: "In Stock", value: inStock.count || 0, color: "#10b981" }, // emerald-500
        { name: "Low Stock", value: lowStock.count || 0, color: "#f59e0b" }, // amber-500
        {
          name: "Out of Stock",
          value: outOfStock.count || 0,
          color: "#ef4444",
        }, // red-500
      ]);
    } catch (error) {
      console.error("Error fetching stock distribution:", error);
      res.status(500).json({ error: "Failed to fetch stock distribution" });
    }
  },
);

// GET /api/reports/order-status - Get order status distribution
router.get("/order-status", adminAuth, (req: AdminRequest, res: Response) => {
  try {
    const pending = db
      .prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'")
      .get() as { count: number };

    const processing = db
      .prepare(
        "SELECT COUNT(*) as count FROM orders WHERE status = 'processing'",
      )
      .get() as { count: number };

    const shipped = db
      .prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'shipped'")
      .get() as { count: number };

    const delivered = db
      .prepare(
        "SELECT COUNT(*) as count FROM orders WHERE status = 'delivered'",
      )
      .get() as { count: number };

    const cancelled = db
      .prepare(
        "SELECT COUNT(*) as count FROM orders WHERE status = 'cancelled'",
      )
      .get() as { count: number };

    res.json([
      { name: "Pending", value: pending.count || 0, color: "#f59e0b" },
      { name: "Processing", value: processing.count || 0, color: "#3b82f6" },
      { name: "Shipped", value: shipped.count || 0, color: "#8b5cf6" },
      { name: "Delivered", value: delivered.count || 0, color: "#10b981" },
      { name: "Cancelled", value: cancelled.count || 0, color: "#ef4444" },
    ]);
  } catch (error) {
    console.error("Error fetching order status:", error);
    res.status(500).json({ error: "Failed to fetch order status" });
  }
});

// GET /api/reports/recent-orders - Get recent orders
router.get("/recent-orders", adminAuth, (req: AdminRequest, res: Response) => {
  try {
    const orders = db
      .prepare(
        `
        SELECT id, total, status, createdAt, shippingInfo 
        FROM orders 
        ORDER BY createdAt DESC 
        LIMIT 5
      `,
      )
      .all() as {
      id: string;
      total: number;
      status: string;
      createdAt: string;
      shippingInfo: string;
    }[];

    const parsedOrders = orders.map((order) => ({
      id: order.id,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      customer: JSON.parse(order.shippingInfo),
    }));

    res.json(parsedOrders);
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    res.status(500).json({ error: "Failed to fetch recent orders" });
  }
});

export default router;
