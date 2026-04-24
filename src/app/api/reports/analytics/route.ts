import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get("range") || "7d";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let dateRangeStart: Date;
    let dateRangeEnd: Date = new Date();
    let queryConditions = "";
    const params: any[] = [];

    if (startDate && endDate) {
      queryConditions = ` AND "createdAt"::date >= $1::date AND "createdAt"::date <= $2::date`;
      params.push(startDate, endDate);
      dateRangeStart = new Date(startDate + "T00:00:00");
      dateRangeEnd = new Date(endDate + "T23:59:59.999");
    } else {
      let days = 7;
      if (range === "30d") days = 30;
      if (range === "90d") days = 90;
      queryConditions = ` AND "createdAt" >= NOW() - INTERVAL '${days} days'`;
      dateRangeStart = new Date();
      dateRangeStart.setDate(dateRangeStart.getDate() - days);
    }

    const ordersResult = await query(
      `SELECT TO_CHAR("createdAt", 'YYYY-MM-DD') as date, total 
       FROM orders 
       WHERE status NOT IN ('cancelled', 'pending', 'quote')
       ${queryConditions}
       ORDER BY "createdAt" ASC`,
      params
    );

    const expQueryConditions = queryConditions.replace(/"createdAt"/g, "date");
    const expensesResult = await query(
      `SELECT TO_CHAR(date, 'YYYY-MM-DD') as date, amount FROM expenses
       WHERE 1=1 ${expQueryConditions}`,
      params
    );

    const groupedData: Record<string, { revenue: number; orders: number; expenses: number }> = {};
    const currentDate = new Date(dateRangeStart);
    while (currentDate <= dateRangeEnd) {
      const dateStr = currentDate.toISOString().split("T")[0];
      groupedData[dateStr] = { revenue: 0, orders: 0, expenses: 0 };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    ordersResult.rows.forEach((order) => {
      if (groupedData[order.date]) {
        groupedData[order.date].revenue += parseFloat(order.total);
        groupedData[order.date].orders += 1;
      }
    });

    expensesResult.rows.forEach((expense) => {
      if (groupedData[expense.date]) {
        groupedData[expense.date].expenses += parseFloat(expense.amount);
      }
    });

    const analyticsData = Object.entries(groupedData)
      .map(([date, data]) => ({
        ...data,
        date,
        profit: data.revenue - data.expenses,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("Analytics API Error:", error);
    return apiResponse.error("Failed to fetch analytics data");
  }
}
