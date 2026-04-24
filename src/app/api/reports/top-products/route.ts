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

    let sql = "SELECT items FROM orders WHERE status NOT IN ('cancelled', 'pending', 'quote')";
    const params = [];

    if (startDate && endDate) {
      sql += ' AND "createdAt"::date >= $1::date AND "createdAt"::date <= $2::date';
      params.push(startDate, endDate);
    }

    const ordersResult = await query(sql, params);
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};

    ordersResult.rows.forEach((order) => {
      let items = order.items;
      if (typeof items === "string") {
        try { items = JSON.parse(items); } catch { return; }
      }
      
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

    return NextResponse.json(topProducts);
  } catch (error) {
    console.error("Top Products API Error:", error);
    return apiResponse.error("Failed to fetch top products");
  }
}
