import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const result = await query(`
      SELECT 
        COALESCE(JSONB_EXTRACT_PATH_TEXT("shippingInfo", 'country'), 'Unknown') as country,
        COUNT(*) as orders,
        SUM(total) as revenue
      FROM orders
      WHERE status NOT IN ('cancelled', 'pending', 'quote')
      GROUP BY country
      ORDER BY revenue DESC
      LIMIT 10
    `);

    const data = result.rows.map((row) => ({
      name: row.country,
      orders: parseInt(row.orders, 10),
      revenue: parseFloat(row.revenue || "0"),
    }));

    return apiResponse.success(data);
  } catch (error) {
    console.error("Regional Report API Error:", error);
    return apiResponse.error("Failed to fetch regional report");
  }
}
