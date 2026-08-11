import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/drizzle/schema";
import { sql, and, notInArray } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import { safeParse } from "@/lib/orderUtils";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let condition = notInArray(orders.status, ['cancelled', 'pending', 'quote']);

    if (startDate && endDate) {
      condition = and(
        condition,
        sql`"createdAt"::date >= ${startDate}::date AND "createdAt"::date <= ${endDate}::date`
      ) as any;
    }

    const ordersResult = await db.select({ items: orders.items }).from(orders).where(condition);
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};

    ordersResult.forEach((order) => {
      const items = safeParse(order.items) as any;
      
      if (Array.isArray(items)) {
        items.forEach((item: any) => {
          if (!productSales[item.id]) {
            productSales[item.id] = { name: item.name, quantity: 0, revenue: 0 };
          }
          productSales[item.id].quantity += (item.quantity || 1);
          productSales[item.id].revenue += (item.price || 0) * (item.quantity || 1);
        });
      }
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return apiResponse.success(topProducts);
  } catch (error) {
    console.error("Top Products API Error:", error);
    return apiResponse.error("Failed to fetch top products");
  }
}
