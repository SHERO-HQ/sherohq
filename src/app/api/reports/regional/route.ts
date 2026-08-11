import { db } from "@/lib/db";
import { sql, count, desc, notInArray } from "drizzle-orm";
import { orders } from "@/lib/drizzle/schema";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const result = await db
      .select({
        region: sql<string>`COALESCE(JSONB_EXTRACT_PATH_TEXT(${orders.shippingInfo}, 'region'), 'Unknown')`.as("region"),
        orders: count(),
        revenue: sql<number>`SUM(${orders.total})`.as("revenue"),
      })
      .from(orders)
      .where(notInArray(orders.status, ['cancelled', 'pending', 'quote']))
      .groupBy(sql`region`)
      .orderBy(desc(sql`revenue`))
      .limit(10);

    const data = result.map((row) => ({
      name: row.region,
      orders: Number(row.orders),
      revenue: Number(row.revenue || 0)
    }));

    return apiResponse.success(data);
  } catch (error) {
    console.error("Regional Report API Error:", error);
    return apiResponse.error("Failed to fetch regional report");
  }
}
