import { Router, Response } from "express";
import db from "../db/database";
import { adminAuth, AdminRequest } from "../middleware/adminAuth";

const router = Router();

interface AnalyticsData {
  date: string;
  revenue: number;
  orders: number;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

// GET /api/reports/stats - Get dashboard stats
router.get("/stats", adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    // Total Revenue
    const revenueResult = await db.query(
      "SELECT SUM(total) as total FROM orders WHERE status != 'cancelled'",
    );
    const totalRevenue = parseFloat(revenueResult.rows[0]?.total || "0");

    // Total Orders
    const ordersResult = await db.query("SELECT COUNT(*) as count FROM orders");
    const totalOrders = parseInt(ordersResult.rows[0]?.count || "0", 10);

    // Total Products
    const productsResult = await db.query(
      "SELECT COUNT(*) as count FROM products",
    );
    const totalProducts = parseInt(productsResult.rows[0]?.count || "0", 10);

    // Low Stock Products
    // Using generic query assuming columns might vary, checking stockQuantity or inStock
    let lowStockProducts = 0;
    try {
      const lowStockResult = await db.query(
        'SELECT COUNT(*) as count FROM products WHERE "stockQuantity" <= 10 AND "stockQuantity" > 0',
      );
      lowStockProducts = parseInt(lowStockResult.rows[0]?.count || "0", 10);
    } catch {
      // Fallback if stockQuantity missing
      const lowStockResult = await db.query(
        'SELECT COUNT(*) as count FROM products WHERE "inStock" = false', // approximating low stock as OOS for fallback
      );
      lowStockProducts = parseInt(lowStockResult.rows[0]?.count || "0", 10);
    }

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
router.get(
  "/analytics",
  adminAuth,
  async (req: AdminRequest, res: Response) => {
    try {
      const { range = "7d" } = req.query; // 7d, 30d, 90d

      let days = 7;
      if (range === "30d") days = 30;
      if (range === "90d") days = 90;

      // Get orders from the last N days
      // Postgres date math: "createdAt" >= NOW() - INTERVAL '7 days'
      const ordersResult = await db.query(
        `
      SELECT "createdAt", total 
      FROM orders 
      WHERE status != 'cancelled' 
      AND "createdAt" >= NOW() - INTERVAL '${days} days'
      ORDER BY "createdAt" ASC
    `,
      );

      const orders = ordersResult.rows as { createdAt: Date; total: string }[];

      // Group by date
      const groupedData: Record<string, { revenue: number; orders: number }> =
        {};

      // Initialize dates
      for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        groupedData[dateStr] = { revenue: 0, orders: 0 };
      }

      orders.forEach((order) => {
        const dateStr = new Date(order.createdAt).toISOString().split("T")[0];
        if (groupedData[dateStr]) {
          groupedData[dateStr].revenue += parseFloat(order.total);
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
  },
);

// GET /api/reports/top-products - Get top selling products
router.get(
  "/top-products",
  adminAuth,
  async (req: AdminRequest, res: Response) => {
    try {
      const ordersResult = await db.query(
        "SELECT items FROM orders WHERE status != 'cancelled'",
      );
      const orders = ordersResult.rows as { items: string }[];

      const productSales: Record<
        string,
        { name: string; quantity: number; revenue: number }
      > = {};

      orders.forEach((order) => {
        const items = JSON.parse(order.items);
        items.forEach((item: OrderItem) => {
          if (!productSales[item.id]) {
            productSales[item.id] = {
              name: item.name,
              quantity: 0,
              revenue: 0,
            };
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
  },
);

// GET /api/reports/stock-distribution - Get stock status distribution
router.get(
  "/stock-distribution",
  adminAuth,
  async (req: AdminRequest, res: Response) => {
    try {
      let inStock = 0,
        lowStock = 0,
        outOfStock = 0;

      try {
        const inStockRes = await db.query(
          'SELECT COUNT(*) as count FROM products WHERE "inStock" = true AND "stockQuantity" > 10',
        );
        inStock = parseInt(inStockRes.rows[0]?.count || "0", 10);

        const lowStockRes = await db.query(
          'SELECT COUNT(*) as count FROM products WHERE "stockQuantity" <= 10 AND "stockQuantity" > 0',
        );
        lowStock = parseInt(lowStockRes.rows[0]?.count || "0", 10);

        const outOfStockRes = await db.query(
          'SELECT COUNT(*) as count FROM products WHERE "inStock" = false OR "stockQuantity" = 0',
        );
        outOfStock = parseInt(outOfStockRes.rows[0]?.count || "0", 10);
      } catch {
        // Fallback
        const inStockRes = await db.query(
          'SELECT COUNT(*) as count FROM products WHERE "inStock" = true',
        );
        const outOfStockRes = await db.query(
          'SELECT COUNT(*) as count FROM products WHERE "inStock" = false',
        );
        inStock = parseInt(inStockRes.rows[0]?.count || "0", 10);
        outOfStock = parseInt(outOfStockRes.rows[0]?.count || "0", 10);
      }

      res.json([
        { name: "In Stock", value: inStock, color: "#10b981" },
        { name: "Low Stock", value: lowStock, color: "#f59e0b" },
        { name: "Out of Stock", value: outOfStock, color: "#ef4444" },
      ]);
    } catch (error) {
      console.error("Error fetching stock distribution:", error);
      res.status(500).json({ error: "Failed to fetch stock distribution" });
    }
  },
);

// GET /api/reports/order-status - Get order status distribution
router.get(
  "/order-status",
  adminAuth,
  async (req: AdminRequest, res: Response) => {
    try {
      const distributionResult = await db.query(
        "SELECT status, COUNT(*) as count FROM orders GROUP BY status",
      );
      const distribution = distributionResult.rows as {
        status: string;
        count: string;
      }[];

      const statusColors: Record<string, string> = {
        pending: "#f59e0b",
        processing: "#3b82f6",
        shipped: "#8b5cf6",
        delivered: "#10b981",
        cancelled: "#ef4444",
      };

      const data = distribution.map((item) => ({
        name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
        value: parseInt(item.count, 10),
        color: statusColors[item.status] || "#64748b",
      }));

      res.json(data);
    } catch (error) {
      console.error("Error fetching order status:", error);
      res.status(500).json({ error: "Failed to fetch order status" });
    }
  },
);

// GET /api/reports/recent-orders - Get recent orders
router.get(
  "/recent-orders",
  adminAuth,
  async (req: AdminRequest, res: Response) => {
    try {
      const ordersResult = await db.query(
        `SELECT id, total, status, "createdAt", "shippingInfo" 
         FROM orders 
         ORDER BY "createdAt" DESC 
         LIMIT 5`,
      );
      const orders = ordersResult.rows;

      const recentOrders = orders.map(
        (order: {
          id: string;
          total: string;
          status: string;
          createdAt: string;
          shippingInfo: string;
        }) => {
          const shipping = JSON.parse(order.shippingInfo);
          return {
            id: order.id,
            total: parseFloat(order.total),
            status: order.status,
            createdAt: order.createdAt,
            customer: {
              firstName: shipping.firstName,
              lastName: shipping.lastName,
              email: shipping.email,
            },
          };
        },
      );

      res.json(recentOrders);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      res.status(500).json({ error: "Failed to fetch recent orders" });
    }
  },
);

export default router;
