import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const hasCustomRange = !!(startDate && endDate);

    const combinedResult = await query(
      `
      WITH order_stats AS (
        SELECT 
          SUM(total) FILTER (WHERE "createdAt" >= CURRENT_DATE) as rev_today,
          COUNT(*) FILTER (WHERE "createdAt" >= CURRENT_DATE) as ord_today,
          SUM(total) FILTER (WHERE "createdAt" < CURRENT_DATE AND "createdAt" >= CURRENT_DATE - INTERVAL '1 day') as prev_rev_today,
          COUNT(*) FILTER (WHERE "createdAt" < CURRENT_DATE AND "createdAt" >= CURRENT_DATE - INTERVAL '1 day') as prev_ord_today,
          
          SUM(total) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '7 days') as rev_week,
          COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '7 days') as ord_week,
          SUM(total) FILTER (WHERE "createdAt" < NOW() - INTERVAL '7 days' AND "createdAt" >= NOW() - INTERVAL '14 days') as prev_rev_week,
          COUNT(*) FILTER (WHERE "createdAt" < NOW() - INTERVAL '7 days' AND "createdAt" >= NOW() - INTERVAL '14 days') as prev_ord_week,
          
          SUM(total) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '30 days') as rev_month,
          COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '30 days') as ord_month,
          SUM(total) FILTER (WHERE "createdAt" < NOW() - INTERVAL '30 days' AND "createdAt" >= NOW() - INTERVAL '60 days') as prev_rev_month,
          COUNT(*) FILTER (WHERE "createdAt" < NOW() - INTERVAL '30 days' AND "createdAt" >= NOW() - INTERVAL '60 days') as prev_ord_month,
          
          SUM(total) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '365 days') as rev_year,
          COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '365 days') as ord_year,
          SUM(total) FILTER (WHERE "createdAt" < NOW() - INTERVAL '365 days' AND "createdAt" >= NOW() - INTERVAL '730 days') as prev_rev_year,
          COUNT(*) FILTER (WHERE "createdAt" < NOW() - INTERVAL '365 days' AND "createdAt" >= NOW() - INTERVAL '730 days') as prev_ord_year,
          
          ${hasCustomRange ? `SUM(total) FILTER (WHERE "createdAt"::date >= $1::date AND "createdAt"::date <= $2::date) as rev_custom, COUNT(*) FILTER (WHERE "createdAt"::date >= $1::date AND "createdAt"::date <= $2::date) as ord_custom,` : ""}
          
          SUM(total) as lifetime_revenue,
          COUNT(*) as lifetime_orders,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_count
        FROM orders
        WHERE status NOT IN ('cancelled', 'pending', 'quote')
      ),
      expense_stats AS (
        SELECT 
          SUM(amount) FILTER (WHERE date >= CURRENT_DATE) as exp_today,
          SUM(amount) FILTER (WHERE date < CURRENT_DATE AND date >= CURRENT_DATE - INTERVAL '1 day') as prev_exp_today,
          SUM(amount) FILTER (WHERE date >= NOW() - INTERVAL '7 days') as exp_week,
          SUM(amount) FILTER (WHERE date < NOW() - INTERVAL '7 days' AND date >= NOW() - INTERVAL '14 days') as prev_exp_week,
          SUM(amount) FILTER (WHERE date >= NOW() - INTERVAL '30 days') as exp_month,
          SUM(amount) FILTER (WHERE date < NOW() - INTERVAL '30 days' AND date >= NOW() - INTERVAL '60 days') as prev_exp_month,
          SUM(amount) FILTER (WHERE date >= NOW() - INTERVAL '365 days') as exp_year,
          SUM(amount) FILTER (WHERE date < NOW() - INTERVAL '365 days' AND date >= NOW() - INTERVAL '730 days') as prev_exp_year,
          ${hasCustomRange ? `SUM(amount) FILTER (WHERE date::date >= $1::date AND date::date <= $2::date) as exp_custom,` : ""}
          SUM(amount) as lifetime_expenses
        FROM expenses
      ),
      product_stats AS (
        SELECT 
          COUNT(*) as total_products,
          COUNT(*) FILTER (WHERE "createdAt" >= CURRENT_DATE) as new_today,
          COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '7 days') as new_week,
          COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '30 days') as new_month,
          COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '365 days') as new_year,
          COUNT(*) FILTER (WHERE "stockQuantity" <= 10 AND "stockQuantity" > 0) as low_stock,
          COUNT(*) FILTER (WHERE "inStock" = false OR "stockQuantity" = 0) as out_of_stock
        FROM products
      ),
      pending_orders AS (
        SELECT COUNT(*) as pending_count FROM orders WHERE status = 'pending'
      )
      SELECT * FROM order_stats, expense_stats, product_stats, pending_orders
    `,
      hasCustomRange ? [startDate, endDate] : []
    );

    const s = combinedResult.rows[0];
    const e = combinedResult.rows[0]; // Both are in the same row
    const ps = combinedResult.rows[0];
    const pendingOrdersCount = parseInt(combinedResult.rows[0].pending_count || "0", 10);

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
      revenue: parseFloat(rev || "0"),
      expenses: parseFloat(exp || "0"),
      profit: parseFloat(rev || "0") - parseFloat(exp || "0"),
      orders: parseInt(ord || "0", 10),
      revenueGrowth: calculateGrowth(parseFloat(rev || "0"), parseFloat(prevRev || "0")),
      ordersGrowth: calculateGrowth(parseInt(ord || "0", 10), parseInt(prevOrd || "0", 10)),
      profitGrowth: calculateGrowth(
        parseFloat(rev || "0") - parseFloat(exp || "0"),
        parseFloat(prevRev || "0") - parseFloat(prevExp || "0")
      ),
      newProducts: parseInt(newProd || "0", 10),
    });

    const kpis = {
      today: formatStats(s.rev_today, s.ord_today, s.prev_rev_today, s.prev_ord_today, ps.new_today, e.exp_today, e.prev_exp_today),
      week: formatStats(s.rev_week, s.ord_week, s.prev_rev_week, s.prev_ord_week, ps.new_week, e.exp_week, e.prev_exp_week),
      month: formatStats(s.rev_month, s.ord_month, s.prev_rev_month, s.prev_ord_month, ps.new_month, e.exp_month, e.prev_exp_month),
      year: formatStats(s.rev_year, s.ord_year, s.prev_rev_year, s.prev_ord_year, ps.new_year, e.exp_year, e.prev_exp_year),
      custom: hasCustomRange ? formatStats(s.rev_custom, s.ord_custom, null, null, "0", e.exp_custom, null) : null,
    };

    return NextResponse.json({
      success: true,
      kpis,
      revenue: kpis.month.revenue,
      expenses: kpis.month.expenses,
      profit: kpis.month.profit,
      orders: kpis.month.orders,
      revenueGrowth: kpis.month.revenueGrowth,
      ordersGrowth: kpis.month.ordersGrowth,
      products: parseInt(ps.total_products || "0", 10),
      lowStock: parseInt(ps.low_stock || "0", 10),
      outOfStock: parseInt(ps.out_of_stock || "0", 10),
      pendingOrders: pendingOrdersCount,
      newProductsCount: parseInt(ps.new_week || "0", 10),
      lifetimeRevenue: parseFloat(s.lifetime_revenue || "0"),
      lifetimeExpenses: parseFloat(e.lifetime_expenses || "0"),
      pendingGrowth: 0,
    });
  } catch (error) {
    console.error("Reports Stats API Error:", error);
    return apiResponse.error("Failed to fetch statistics");
  }
}
