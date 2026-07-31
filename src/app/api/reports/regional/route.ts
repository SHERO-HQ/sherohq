import { } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const result = await query(`
      SELECT 
        COALESCE(JSONB_EXTRACT_PATH_TEXT("shippingInfo", 'region'), 'Unknown') as region,
        COUNT(*) as orders,
        SUM(total) as revenue
      FROM orders
      WHERE status NOT IN ('cancelled', 'pending', 'quote')
      GROUP BY region
      ORDER BY revenue DESC
      LIMIT 10
    `);

    const data = result.rows.map((row) => ({
      name: row.region,
      orders: parseInt(row.orders, 10),
      revenue: parseFloat(row.revenue || "0")}));

    return apiResponse.success(data);
  } catch (error) {
    console.error("Regional Report API Error:", error);
    return apiResponse.error("Failed to fetch regional report");
  }
}
