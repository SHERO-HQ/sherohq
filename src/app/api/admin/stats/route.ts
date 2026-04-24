import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return apiResponse.unauthorized();
    }

    const productCountRes = await query("SELECT COUNT(*) as count FROM products");
    const orderCountRes = await query("SELECT COUNT(*) as count FROM orders");
    const totalRevenueRes = await query("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status != 'cancelled'");

    // Low stock: <= 10 and in stock
    const lowStockCountRes = await query(
      'SELECT COUNT(*) as count FROM products WHERE "stockQuantity" <= 10 AND "stockQuantity" > 0'
    );

    // Out of stock: 0 stock or explicitly out of stock
    const outOfStockCountRes = await query(
      'SELECT COUNT(*) as count FROM products WHERE "inStock" = $1 OR "stockQuantity" = 0',
      [false]
    );

    const pendingOrdersRes = await query("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'");

    return apiResponse.success({
      products: Number(productCountRes.rows[0].count),
      orders: Number(orderCountRes.rows[0].count),
      revenue: Number(totalRevenueRes.rows[0].total),
      lowStock: Number(lowStockCountRes.rows[0].count),
      outOfStock: Number(outOfStockCountRes.rows[0].count),
      pendingOrders: Number(pendingOrdersRes.rows[0].count),
    });
  } catch (error) {
    console.error("Stats API Error:", error);
    return apiResponse.error("Failed to fetch dashboard statistics");
  }
}
