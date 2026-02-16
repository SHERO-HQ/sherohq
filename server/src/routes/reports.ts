import { Router, Response } from "express";
import db from "../db/database";
import { adminAuth, AdminRequest } from "../middleware/adminAuth";

const router = Router();

// Analytics data type for grouping
export interface AnalyticsData {
  date: string;
  revenue: number;
  orders: number;
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

// GET /api/reports/stats - Get dashboard stats with multi-period support
router.get("/stats", adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const hasCustomRange = !!(startDate && endDate);

    const statsResult = await db.query(
      `
      WITH periods AS (
        SELECT 
          total,
          status,
          "createdAt",
          -- Current periods
          "createdAt" >= CURRENT_DATE as is_today,
          "createdAt" >= NOW() - INTERVAL '7 days' as is_week,
          "createdAt" >= NOW() - INTERVAL '30 days' as is_month,
          "createdAt" >= NOW() - INTERVAL '365 days' as is_year,
          ${hasCustomRange ? `("createdAt"::date >= $1::date AND "createdAt"::date <= $2::date) as is_custom,` : ""}
          -- Previous periods for growth
          ("createdAt" < CURRENT_DATE AND "createdAt" >= CURRENT_DATE - INTERVAL '1 day') as is_prev_today,
          ("createdAt" < NOW() - INTERVAL '7 days' AND "createdAt" >= NOW() - INTERVAL '14 days') as is_prev_week,
          ("createdAt" < NOW() - INTERVAL '30 days' AND "createdAt" >= NOW() - INTERVAL '60 days') as is_prev_month,
          ("createdAt" < NOW() - INTERVAL '365 days' AND "createdAt" >= NOW() - INTERVAL '730 days') as is_prev_year
        FROM orders
        WHERE status NOT IN ('cancelled', 'pending', 'quote')
      )
      SELECT
        -- Today
        SUM(total) FILTER (WHERE is_today) as rev_today,
        COUNT(*) FILTER (WHERE is_today) as ord_today,
        SUM(total) FILTER (WHERE is_prev_today) as prev_rev_today,
        COUNT(*) FILTER (WHERE is_prev_today) as prev_ord_today,
        -- Week
        SUM(total) FILTER (WHERE is_week) as rev_week,
        COUNT(*) FILTER (WHERE is_week) as ord_week,
        SUM(total) FILTER (WHERE is_prev_week) as prev_rev_week,
        COUNT(*) FILTER (WHERE is_prev_week) as prev_ord_week,
        -- Month
        SUM(total) FILTER (WHERE is_month) as rev_month,
        COUNT(*) FILTER (WHERE is_month) as ord_month,
        SUM(total) FILTER (WHERE is_prev_month) as prev_rev_month,
        COUNT(*) FILTER (WHERE is_prev_month) as prev_ord_month,
        -- Year
        SUM(total) FILTER (WHERE is_year) as rev_year,
        COUNT(*) FILTER (WHERE is_year) as ord_year,
        SUM(total) FILTER (WHERE is_prev_year) as prev_rev_year,
        COUNT(*) FILTER (WHERE is_prev_year) as prev_ord_year,
        -- Custom
        ${hasCustomRange ? `SUM(total) FILTER (WHERE is_custom) as rev_custom, COUNT(*) FILTER (WHERE is_custom) as ord_custom,` : ""}
        -- Lifetime Totals
        SUM(total) as lifetime_revenue,
        COUNT(*) as lifetime_orders
      FROM periods
    `,
      hasCustomRange ? [startDate, endDate] : [],
    );

    const expensesResult = await db.query(
      `
      WITH periods AS (
        SELECT 
          amount,
          date,
          -- Current periods
          date >= CURRENT_DATE as is_today,
          date >= NOW() - INTERVAL '7 days' as is_week,
          date >= NOW() - INTERVAL '30 days' as is_month,
          date >= NOW() - INTERVAL '365 days' as is_year,
          ${hasCustomRange ? `(date::date >= $1::date AND date::date <= $2::date) as is_custom,` : ""}
          -- Previous periods for growth
          (date < CURRENT_DATE AND date >= CURRENT_DATE - INTERVAL '1 day') as is_prev_today,
          (date < NOW() - INTERVAL '7 days' AND date >= NOW() - INTERVAL '14 days') as is_prev_week,
          (date < NOW() - INTERVAL '30 days' AND date >= NOW() - INTERVAL '60 days') as is_prev_month,
          (date < NOW() - INTERVAL '365 days' AND date >= NOW() - INTERVAL '730 days') as is_prev_year
        FROM expenses
      )
      SELECT
        -- Today
        SUM(amount) FILTER (WHERE is_today) as exp_today,
        SUM(amount) FILTER (WHERE is_prev_today) as prev_exp_today,
        -- Week
        SUM(amount) FILTER (WHERE is_week) as exp_week,
        SUM(amount) FILTER (WHERE is_prev_week) as prev_exp_week,
        -- Month
        SUM(amount) FILTER (WHERE is_month) as exp_month,
        SUM(amount) FILTER (WHERE is_prev_month) as prev_exp_month,
        -- Year
        SUM(amount) FILTER (WHERE is_year) as exp_year,
        SUM(amount) FILTER (WHERE is_prev_year) as prev_exp_year,
        -- Custom
        ${hasCustomRange ? `SUM(amount) FILTER (WHERE is_custom) as exp_custom,` : ""}
        -- Lifetime
        SUM(amount) as lifetime_expenses
      FROM periods
    `,
      hasCustomRange ? [startDate, endDate] : [],
    );

    const productStatsResult = await db.query(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(*) FILTER (WHERE "createdAt" >= CURRENT_DATE) as new_today,
        COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '7 days') as new_week,
        COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '30 days') as new_month,
        COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '365 days') as new_year,
        COUNT(*) FILTER (WHERE "stockQuantity" <= 10 AND "stockQuantity" > 0) as low_stock,
        COUNT(*) FILTER (WHERE "inStock" = false OR "stockQuantity" = 0) as out_of_stock
      FROM products
    `);

    const pendingOrdersResult = await db.query(
      "SELECT COUNT(*) as pending_count FROM orders WHERE status = 'pending'",
    );

    const s = statsResult.rows[0];
    const e = expensesResult.rows[0];
    const ps = productStatsResult.rows[0];
    const pendingOrdersCount = Number.parseInt(
      pendingOrdersResult.rows[0].pending_count || "0",
      10,
    );

    const calculateGrowth = (current: number, prev: number) => {
      if (!prev || prev === 0) return current > 0 ? 100 : 0;
      return Number((((current - prev) / prev) * 100).toFixed(1));
    };

    const formatStats = (
      rev: string | null,
      ord: string | null,
      prevRev: string | null,
      prevOrd: string | null,
      newProd: string | null,
      exp: string | null,
      prevExp: string | null,
    ) => ({
      revenue: Number.parseFloat(rev || "0"),
      expenses: Number.parseFloat(exp || "0"),
      profit: Number.parseFloat(rev || "0") - Number.parseFloat(exp || "0"),
      orders: Number.parseInt(ord || "0", 10),
      revenueGrowth: calculateGrowth(
        Number.parseFloat(rev || "0"),
        Number.parseFloat(prevRev || "0"),
      ),
      ordersGrowth: calculateGrowth(
        Number.parseInt(ord || "0", 10),
        Number.parseInt(prevOrd || "0", 10),
      ),
      profitGrowth: calculateGrowth(
        Number.parseFloat(rev || "0") - Number.parseFloat(exp || "0"),
        Number.parseFloat(prevRev || "0") - Number.parseFloat(prevExp || "0"),
      ),
      newProducts: Number.parseInt(newProd || "0", 10),
    });

    const kpis = {
      today: formatStats(
        s.rev_today,
        s.ord_today,
        s.prev_rev_today,
        s.prev_ord_today,
        ps.new_today,
        e.exp_today,
        e.prev_exp_today,
      ),
      week: formatStats(
        s.rev_week,
        s.ord_week,
        s.prev_rev_week,
        s.prev_ord_week,
        ps.new_week,
        e.exp_week,
        e.prev_exp_week,
      ),
      month: formatStats(
        s.rev_month,
        s.ord_month,
        s.prev_rev_month,
        s.prev_ord_month,
        ps.new_month,
        e.exp_month,
        e.prev_exp_month,
      ),
      year: formatStats(
        s.rev_year,
        s.ord_year,
        s.prev_rev_year,
        s.prev_ord_year,
        ps.new_year,
        e.exp_year,
        e.prev_exp_year,
      ),
      custom: hasCustomRange
        ? formatStats(
            s.rev_custom,
            s.ord_custom,
            null,
            null,
            "0",
            e.exp_custom,
            null,
          )
        : null,
    };

    res.json({
      // Multi-period KPIs
      kpis,
      // Legacy support (Monthly)
      revenue: kpis.month.revenue,
      expenses: kpis.month.expenses,
      profit: kpis.month.profit,
      orders: kpis.month.orders,
      revenueGrowth: kpis.month.revenueGrowth,
      ordersGrowth: kpis.month.ordersGrowth,
      // Other stats
      products: Number.parseInt(ps.total_products || "0", 10),
      lowStock: Number.parseInt(ps.low_stock || "0", 10),
      outOfStock: Number.parseInt(ps.out_of_stock || "0", 10),
      pendingOrders: pendingOrdersCount,
      newProductsCount: Number.parseInt(ps.new_week || "0", 10),
      lifetimeRevenue: Number.parseFloat(s.lifetime_revenue || "0"),
      lifetimeExpenses: Number.parseFloat(e.lifetime_expenses || "0"),
      pendingGrowth: 0,
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
      const { range = "7d", startDate, endDate } = req.query;

      let query = `
        SELECT TO_CHAR("createdAt", 'YYYY-MM-DD') as date, total 
        FROM orders 
        WHERE status != 'cancelled' AND status != 'pending' AND status != 'quote'
      `;
      let params: string[] = [];
      let dateRangeStart: Date;
      let dateRangeEnd: Date = new Date(); // Default end date to today

      if (startDate && endDate) {
        query += ` AND "createdAt"::date >= $1::date AND "createdAt"::date <= $2::date`;
        params = [startDate as string, endDate as string];
        // Parse as local dates by adding time component
        dateRangeStart = new Date((startDate as string) + "T00:00:00");
        dateRangeEnd = new Date((endDate as string) + "T00:00:00");
      } else {
        let days = 7;
        if (range === "30d") days = 30;
        if (range === "90d") days = 90;
        query += ` AND "createdAt" >= NOW() - INTERVAL '${days} days'`;
        // No params needed for the interval string interpolation
        dateRangeStart = new Date();
        dateRangeStart.setDate(dateRangeStart.getDate() - days);
      }

      query += ` ORDER BY "createdAt" ASC`;

      const ordersResult = await db.query(query, params);
      const orders = ordersResult.rows as { date: string; total: string }[];

      // Fetch expenses for the same period
      let expQuery = `SELECT TO_CHAR(date, 'YYYY-MM-DD') as date, amount FROM expenses`;
      if (startDate && endDate) {
        expQuery += ` WHERE date::date >= $1::date AND date::date <= $2::date`;
      } else {
        let days = 7;
        if (range === "30d") days = 30;
        if (range === "90d") days = 90;
        expQuery += ` WHERE date >= NOW() - INTERVAL '${days} days'`;
      }
      const expensesResult = await db.query(expQuery, params);
      const expenses = expensesResult.rows as {
        date: string;
        amount: string;
      }[];

      // Group by date
      const groupedData: Record<
        string,
        { revenue: number; orders: number; expenses: number }
      > = {};

      // Initialize all dates in the range to ensure continuity in charts
      const currentDate = new Date(dateRangeStart);
      while (currentDate <= dateRangeEnd) {
        const yr = currentDate.getFullYear();
        const mo = String(currentDate.getMonth() + 1).padStart(2, "0");
        const da = String(currentDate.getDate()).padStart(2, "0");
        const dateStr = `${yr}-${mo}-${da}`;
        groupedData[dateStr] = { revenue: 0, orders: 0, expenses: 0 };
        currentDate.setDate(currentDate.getDate() + 1);
      }

      orders.forEach((order) => {
        const date = order.date;
        if (groupedData[date]) {
          groupedData[date].revenue += Number.parseFloat(order.total);
          groupedData[date].orders += 1;
        }
      });

      expenses.forEach((expense) => {
        const date = expense.date;
        if (groupedData[date]) {
          groupedData[date].expenses += Number.parseFloat(expense.amount);
        }
      });

      const analyticsData = Object.entries(groupedData)
        .map(([date, data]) => ({
          date,
          revenue: data.revenue,
          orders: data.orders,
          expenses: data.expenses,
          profit: data.revenue - data.expenses,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      res.json(analyticsData);
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
      const { startDate, endDate } = req.query;
      let query =
        "SELECT items FROM orders WHERE status NOT IN ('cancelled', 'pending', 'quote')";
      const params = [];

      if (startDate && endDate) {
        query +=
          ' AND "createdAt"::date >= $1::date AND "createdAt"::date <= $2::date';
        params.push(startDate, endDate);
      }

      const ordersResult = await db.query(query, params);
      const orders = ordersResult.rows as { items: string }[];

      const productSales: Record<
        string,
        { name: string; quantity: number; revenue: number }
      > = {};

      orders.forEach((order) => {
        const items = safeParse(order.items) as Array<{
          id: string;
          name: string;
          quantity: number;
          price: number;
        }>;
        items.forEach((item) => {
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
      const { startDate, endDate } = req.query;
      let query = "SELECT status, COUNT(*) as count FROM orders";
      const params = [];

      if (startDate && endDate) {
        query +=
          ' WHERE "createdAt"::date >= $1::date AND "createdAt"::date <= $2::date';
        params.push(startDate, endDate);
      }

      query += " GROUP BY status";
      const distributionResult = await db.query(query, params);
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
      const { startDate, endDate } = req.query;
      const query = `SELECT id, total, status, "createdAt", "shippingInfo" 
                   FROM orders 
                   ${startDate && endDate ? 'WHERE "createdAt"::date >= $1::date AND "createdAt"::date <= $2::date' : ""}
                   ORDER BY "createdAt" DESC 
                   LIMIT 5`;
      const params = startDate && endDate ? [startDate, endDate] : [];
      const ordersResult = await db.query(query, params);
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
    const { startDate, endDate } = req.query;
    let query = `
      SELECT 
        "shippingInfo" as shipping,
        total
      FROM orders
      WHERE status NOT IN ('cancelled', 'pending', 'quote')
    `;
    const params = [];

    if (startDate && endDate) {
      query +=
        ' AND "createdAt"::date >= $1::date AND "createdAt"::date <= $2::date';
      params.push(startDate, endDate);
    }

    const result = await db.query(query, params);

    const regionSales: Record<string, { orders: number; revenue: number }> = {};

    result.rows.forEach((row) => {
      const shipping = safeParse(row.shipping) as Record<string, unknown>;
      // Fix potential object conversion issue by ensuring it's a string
      const region =
        typeof shipping?.region === "string" ? shipping.region : "Unknown";

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
