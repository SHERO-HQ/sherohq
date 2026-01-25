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
router.get("/stats", adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    // Total Revenue
    const revenueResult = await db.query(
      "SELECT SUM(total) as total FROM orders WHERE status != 'cancelled'",
    );
    const totalRevenue = Number(revenueResult.rows[0].total) || 0;

    // Total Orders
    const ordersResult = await db.query("SELECT COUNT(*) as count FROM orders");
    const totalOrders = Number(ordersResult.rows[0].count) || 0;

    // Total Products
    const productsResult = await db.query(
      "SELECT COUNT(*) as count FROM products",
    );
    const totalProducts = Number(productsResult.rows[0].count) || 0;

    // Low Stock Products
    const lowStockResult = await db.query(
      'SELECT COUNT(*) as count FROM products WHERE "stockQuantity" <= 10',
    );
    const lowStockProducts = Number(lowStockResult.rows[0].count) || 0;

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
      const result = await db.query(
        `
        SELECT "createdAt", total 
        FROM orders 
        WHERE status != 'cancelled' 
        AND "createdAt" >= NOW() - ($1 || ' days')::INTERVAL
        ORDER BY "createdAt" ASC
      `,
        [days],
      );

      const orders = result.rows as { createdAt: Date; total: number }[];

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
        // Postgres returns Date object for timestamp
        const dateStr = new Date(order.createdAt).toISOString().split("T")[0];
        if (groupedData[dateStr]) {
          groupedData[dateStr].revenue += Number(order.total);
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
      const result = await db.query(
        "SELECT items FROM orders WHERE status != 'cancelled'",
      );
      const orders = result.rows as { items: any }[]; // items is JSONB or JSON string, pg returns object if jsonb/json type in db usually

      const productSales: Record<
        string,
        { name: string; quantity: number; revenue: number }
      > = {};

      orders.forEach((order) => {
        // If we stored as TEXT/VARCHAR, parse it. If JSON/JSONB, it might be object.
        // Assuming init.ts set it as TEXT, then parse. If JSONB, no need.
        // Based on previous code: JSON.stringify(items). So likely TEXT or JSONB.
        // If TEXT, `pg` driver returns string.
        const items =
          typeof order.items === "string"
            ? JSON.parse(order.items)
            : order.items;

        items.forEach((item: any) => {
          if (!productSales[item.id]) {
            productSales[item.id] = {
              name: item.name,
              quantity: 0,
              revenue: 0,
            };
          }
          productSales[item.id].quantity += item.quantity;
          productSales[item.id].revenue += Number(item.price) * item.quantity;
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
      const inStock = await db.query(
        'SELECT COUNT(*) as count FROM products WHERE "inStock" = $1 AND "stockQuantity" > 10',
        [true],
      );

      const lowStock = await db.query(
        'SELECT COUNT(*) as count FROM products WHERE "stockQuantity" <= 10 AND "stockQuantity" > 0',
      );

      const outOfStock = await db.query(
        'SELECT COUNT(*) as count FROM products WHERE "inStock" = $1 OR "stockQuantity" = 0',
        [false],
      );

      res.json([
        {
          name: "In Stock",
          value: Number(inStock.rows[0].count) || 0,
          color: "#10b981",
        }, // emerald-500
        {
          name: "Low Stock",
          value: Number(lowStock.rows[0].count) || 0,
          color: "#f59e0b",
        }, // amber-500
        {
          name: "Out of Stock",
          value: Number(outOfStock.rows[0].count) || 0,
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
router.get(
  "/order-status",
  adminAuth,
  async (req: AdminRequest, res: Response) => {
    try {
      const pending = await db.query(
        "SELECT COUNT(*) as count FROM orders WHERE status = 'pending'",
      );
      const processing = await db.query(
        "SELECT COUNT(*) as count FROM orders WHERE status = 'processing'",
      );
      const shipped = await db.query(
        "SELECT COUNT(*) as count FROM orders WHERE status = 'shipped'",
      );
      const delivered = await db.query(
        "SELECT COUNT(*) as count FROM orders WHERE status = 'delivered'",
      );
      const cancelled = await db.query(
        "SELECT COUNT(*) as count FROM orders WHERE status = 'cancelled'",
      );

      res.json([
        {
          name: "Pending",
          value: Number(pending.rows[0].count) || 0,
          color: "#f59e0b",
        },
        {
          name: "Processing",
          value: Number(processing.rows[0].count) || 0,
          color: "#3b82f6",
        },
        {
          name: "Shipped",
          value: Number(shipped.rows[0].count) || 0,
          color: "#8b5cf6",
        },
        {
          name: "Delivered",
          value: Number(delivered.rows[0].count) || 0,
          color: "#10b981",
        },
        {
          name: "Cancelled",
          value: Number(cancelled.rows[0].count) || 0,
          color: "#ef4444",
        },
      ]);
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
      const result = await db.query(
        `
        SELECT id, total, status, "createdAt", "shippingInfo" 
        FROM orders 
        ORDER BY "createdAt" DESC 
        LIMIT 5
      `,
      );

      const orders = result.rows as {
        id: string;
        total: number;
        status: string;
        createdAt: Date;
        shippingInfo: any;
      }[];

      const parsedOrders = orders.map((order) => ({
        id: order.id,
        total: Number(order.total),
        status: order.status,
        createdAt: order.createdAt,
        customer:
          typeof order.shippingInfo === "string"
            ? JSON.parse(order.shippingInfo)
            : order.shippingInfo,
      }));

      res.json(parsedOrders);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      res.status(500).json({ error: "Failed to fetch recent orders" });
    }
  },
);

export default router;
