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

// GET /api/reports/stats - Get dashboard stats
router.get("/stats", adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    // Current totals
    const revenueResult = await db.query(
      "SELECT SUM(total) as total FROM orders WHERE status != 'cancelled'",
    );
    const totalRevenue = Number.parseFloat(revenueResult.rows[0]?.total || "0");

    const ordersResult = await db.query("SELECT COUNT(*) as count FROM orders");
    const totalOrders = Number.parseInt(ordersResult.rows[0]?.count || "0", 10);

    const productsResult = await db.query(
      "SELECT COUNT(*) as count FROM products",
    );
    const totalProducts = Number.parseInt(
      productsResult.rows[0]?.count || "0",
      10,
    );

    const pendingResult = await db.query(
      "SELECT COUNT(*) as count FROM orders WHERE status = 'pending'",
    );
    const pendingOrders = Number.parseInt(
      pendingResult.rows[0]?.count || "0",
      10,
    );

    // --- Growth Calculations ---

    // Revenue Growth (Last 30 days vs 30 days before)
    const currentRevenueRes = await db.query(
      "SELECT SUM(total) as total FROM orders WHERE status != 'cancelled' AND \"createdAt\" >= NOW() - INTERVAL '30 days'",
    );
    const prevRevenueRes = await db.query(
      "SELECT SUM(total) as total FROM orders WHERE status != 'cancelled' AND \"createdAt\" < NOW() - INTERVAL '30 days' AND \"createdAt\" >= NOW() - INTERVAL '60 days'",
    );
    const currentRevenue = Number.parseFloat(
      currentRevenueRes.rows[0]?.total || "0",
    );
    const prevRevenue = Number.parseFloat(prevRevenueRes.rows[0]?.total || "0");
    const revenueGrowth =
      prevRevenue === 0
        ? currentRevenue > 0
          ? 100
          : 0
        : ((currentRevenue - prevRevenue) / prevRevenue) * 100;

    // Orders Growth (Last 30 days vs 30 days before)
    const currentOrdersRes = await db.query(
      "SELECT COUNT(*) as count FROM orders WHERE \"createdAt\" >= NOW() - INTERVAL '30 days'",
    );
    const prevOrdersRes = await db.query(
      "SELECT COUNT(*) as count FROM orders WHERE \"createdAt\" < NOW() - INTERVAL '30 days' AND \"createdAt\" >= NOW() - INTERVAL '60 days'",
    );
    const currentOrders = Number.parseInt(
      currentOrdersRes.rows[0]?.count || "0",
      10,
    );
    const prevOrders = Number.parseInt(prevOrdersRes.rows[0]?.count || "0", 10);
    const ordersGrowth =
      prevOrders === 0
        ? currentOrders > 0
          ? 100
          : 0
        : ((currentOrders - prevOrders) / prevOrders) * 100;

    // New Products (Last 7 days)
    const newProductsRes = await db.query(
      "SELECT COUNT(*) as count FROM products WHERE \"createdAt\" >= NOW() - INTERVAL '7 days'",
    );
    const newProductsCount = Number.parseInt(
      newProductsRes.rows[0]?.count || "0",
      10,
    );

    // Pending Orders Trend (vs yesterday)
    const currentPendingRes = await db.query(
      "SELECT COUNT(*) as count FROM orders WHERE status = 'pending' AND \"createdAt\" >= NOW() - INTERVAL '24 hours'",
    );
    const prevPendingRes = await db.query(
      "SELECT COUNT(*) as count FROM orders WHERE status = 'pending' AND \"createdAt\" < NOW() - INTERVAL '24 hours' AND \"createdAt\" >= NOW() - INTERVAL '48 hours'",
    );
    const currentPendingToday = Number.parseInt(
      currentPendingRes.rows[0]?.count || "0",
      10,
    );
    const prevPendingYesterday = Number.parseInt(
      prevPendingRes.rows[0]?.count || "0",
      10,
    );
    const pendingGrowth =
      prevPendingYesterday === 0
        ? currentPendingToday > 0
          ? 100
          : 0
        : ((currentPendingToday - prevPendingYesterday) /
            prevPendingYesterday) *
          100;

    // Low Stock Products and Out of Stock
    let lowStockProducts = 0;
    let outOfStockProducts = 0;
    try {
      const lowStockResult = await db.query(
        'SELECT COUNT(*) as count FROM products WHERE "stockQuantity" <= 10 AND "stockQuantity" > 0',
      );
      lowStockProducts = Number.parseInt(
        lowStockResult.rows[0]?.count || "0",
        10,
      );

      const outOfStockResult = await db.query(
        'SELECT COUNT(*) as count FROM products WHERE "inStock" = false OR "stockQuantity" = 0',
      );
      outOfStockProducts = Number.parseInt(
        outOfStockResult.rows[0]?.count || "0",
        10,
      );
    } catch {
      const lowStockResult = await db.query(
        'SELECT COUNT(*) as count FROM products WHERE "inStock" = false',
      );
      lowStockProducts = Number.parseInt(
        lowStockResult.rows[0]?.count || "0",
        10,
      );
    }

    res.json({
      revenue: totalRevenue,
      orders: totalOrders,
      products: totalProducts,
      lowStock: lowStockProducts,
      outOfStock: outOfStockProducts,
      pendingOrders: pendingOrders,
      revenueGrowth: Number(revenueGrowth.toFixed(1)),
      ordersGrowth: Number(ordersGrowth.toFixed(1)),
      newProductsCount: newProductsCount,
      pendingGrowth: Number(pendingGrowth.toFixed(1)),
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      error: "Failed to fetch stats",
      details: error instanceof Error ? error.message : "Unknown error",
    });
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

      // Initialize dates with a margin for tomorrow to handle timezone skew
      for (let i = -1; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        groupedData[dateStr] = { revenue: 0, orders: 0 };
      }

      orders.forEach((order) => {
        const dateStr = new Date(order.createdAt).toISOString().split("T")[0];
        if (groupedData[dateStr]) {
          groupedData[dateStr].revenue += Number.parseFloat(order.total);
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
      res.status(500).json({
        error: "Failed to fetch analytics",
        details: error instanceof Error ? error.message : "Unknown error",
      });
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
        const items = safeParse(order.items) as OrderItem[];
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
      res.status(500).json({
        error: "Failed to fetch top products",
        details: error instanceof Error ? error.message : "Unknown error",
      });
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
        inStock = Number.parseInt(inStockRes.rows[0]?.count || "0", 10);

        const lowStockRes = await db.query(
          'SELECT COUNT(*) as count FROM products WHERE "stockQuantity" <= 10 AND "stockQuantity" > 0',
        );
        lowStock = Number.parseInt(lowStockRes.rows[0]?.count || "0", 10);

        const outOfStockRes = await db.query(
          'SELECT COUNT(*) as count FROM products WHERE "inStock" = false OR "stockQuantity" = 0',
        );
        outOfStock = Number.parseInt(outOfStockRes.rows[0]?.count || "0", 10);
      } catch {
        // Fallback
        const inStockRes = await db.query(
          'SELECT COUNT(*) as count FROM products WHERE "inStock" = true',
        );
        const outOfStockRes = await db.query(
          'SELECT COUNT(*) as count FROM products WHERE "inStock" = false',
        );
        inStock = Number.parseInt(inStockRes.rows[0]?.count || "0", 10);
        outOfStock = Number.parseInt(outOfStockRes.rows[0]?.count || "0", 10);
      }

      res.json([
        { name: "In Stock", value: inStock, color: "#10b981" },
        { name: "Low Stock", value: lowStock, color: "#f59e0b" },
        { name: "Out of Stock", value: outOfStock, color: "#ef4444" },
      ]);
    } catch (error) {
      console.error("Error fetching stock distribution:", error);
      res.status(500).json({
        error: "Failed to fetch stock distribution",
        details: error instanceof Error ? error.message : "Unknown error",
      });
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
        value: Number.parseInt(item.count, 10),
        color: statusColors[item.status] || "#64748b",
      }));

      res.json(data);
    } catch (error) {
      console.error("Error fetching order status:", error);
      res.status(500).json({
        error: "Failed to fetch order status",
        details: error instanceof Error ? error.message : "Unknown error",
      });
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
          shippingInfo: unknown;
        }) => {
          const shipping = safeParse(order.shippingInfo) as Record<
            string,
            unknown
          >;
          return {
            id: order.id,
            total: Number.parseFloat(order.total),
            status: order.status,
            createdAt: order.createdAt,
            customer: {
              firstName: shipping?.firstName || "Unknown",
              lastName: shipping?.lastName || "",
              email: shipping?.email || "",
            },
          };
        },
      );

      res.json(recentOrders);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      res.status(500).json({
        error: "Failed to fetch recent orders",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

// GET /api/reports/regional - Get sales by region
router.get("/regional", adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const result = await db.query(`
      SELECT 
        "shippingInfo" as shipping,
        total
      FROM orders
      WHERE status != 'cancelled'
    `);

    const regionSales: Record<string, { orders: number; revenue: number }> = {};

    result.rows.forEach((row) => {
      const shipping = safeParse(row.shipping) as Record<string, unknown>;
      const region = String(shipping?.region || "Unknown");
      const total = Number.parseFloat(row.total);

      if (!regionSales[region]) {
        regionSales[region] = { orders: 0, revenue: 0 };
      }
      regionSales[region].orders += 1;
      regionSales[region].revenue += total;
    });

    const data = Object.entries(regionSales)
      .map(([name, stats]) => ({
        name,
        orders: stats.orders,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    res.json(data);
  } catch (error) {
    console.error("Error fetching regional reports:", error);
    res.status(500).json({
      error: "Failed to fetch regional report",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
