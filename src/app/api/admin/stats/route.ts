import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return apiResponse.unauthorized();
    }

    const productCountRes = await db.execute(sql`
      SELECT COUNT(*) as count FROM products
    `);
    const orderCountRes = await db.execute(sql`SELECT COUNT(*) as count FROM orders`);
    const totalRevenueRes = await db.execute(sql`
      SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status != 'cancelled'
    `);

    // Low stock: <= 10 and in stock
    const lowStockCountRes = await db.execute(sql`
      SELECT COUNT(*) as count FROM products WHERE "stockQuantity" <= 10 AND "stockQuantity" > 0
    `);

    // Out of stock: 0 stock or explicitly out of stock
    const outOfStockCountRes = await db.execute(sql`
      SELECT COUNT(*) as count FROM products WHERE "inStock" = ${false} OR "stockQuantity" = 0
    `);

    const pendingOrdersRes = await db.execute(sql`
      SELECT COUNT(*) as count FROM orders WHERE status = 'pending'
    `);

    return apiResponse.success({
      products: Number(((productCountRes.rows || productCountRes) as Record<string, unknown>[])[0].count),
      orders: Number(((orderCountRes.rows || orderCountRes) as Record<string, unknown>[])[0].count),
      revenue: Number(((totalRevenueRes.rows || totalRevenueRes) as Record<string, unknown>[])[0].total),
      lowStock: Number(((lowStockCountRes.rows || lowStockCountRes) as Record<string, unknown>[])[0].count),
      outOfStock: Number(((outOfStockCountRes.rows || outOfStockCountRes) as Record<string, unknown>[])[0].count),
      pendingOrders: Number(((pendingOrdersRes.rows || pendingOrdersRes) as Record<string, unknown>[])[0].count),
    });
  } catch (error) {
    console.error("Stats API Error:", error);
    return apiResponse.error("Failed to fetch dashboard statistics");
  }
}
