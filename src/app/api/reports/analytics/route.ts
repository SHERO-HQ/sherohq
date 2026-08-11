import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { sql, and, notInArray, asc } from "drizzle-orm";
import { orders, expenses } from "@/lib/drizzle/schema";
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
    
    // We will build dynamic SQL strings using drizzle's sql helper
    let orderCondition = sql`1=1`;
    let expenseCondition = sql`1=1`;

    if (startDate && endDate) {
      dateRangeStart = new Date(startDate + "T00:00:00");
      dateRangeEnd = new Date(endDate + "T23:59:59.999");
      orderCondition = sql`${orders.createdAt}::date >= ${startDate}::date AND ${orders.createdAt}::date <= ${endDate}::date`;
      expenseCondition = sql`${expenses.date}::date >= ${startDate}::date AND ${expenses.date}::date <= ${endDate}::date`;
    } else {
      let days = 7; // Default 7d or week
      if (range === "today" || range === "1d") days = 1;
      if (range === "week" || range === "7d") days = 7;
      if (range === "month" || range === "30d") days = 30;
      if (range === "90d") days = 90;
      if (range === "year" || range === "365d") days = 365;
      
      dateRangeStart = new Date();
      dateRangeStart.setDate(dateRangeStart.getDate() - days);
      
      orderCondition = sql`${orders.createdAt} >= NOW() - INTERVAL '${sql.raw(days.toString())} days'`;
      expenseCondition = sql`${expenses.date} >= NOW() - INTERVAL '${sql.raw(days.toString())} days'`;
    }

    const ordersResult = await db
      .select({
        date: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`.as('date'),
        total: orders.total,
        cogs: orders.cogs,
      })
      .from(orders)
      .where(
        and(
          notInArray(orders.status, ['cancelled', 'pending', 'quote']),
          orderCondition
        )
      )
      .orderBy(asc(orders.createdAt));

    const expensesResult = await db
      .select({
        date: sql<string>`TO_CHAR(${expenses.date}, 'YYYY-MM-DD')`.as('date'),
        amount: expenses.amount,
      })
      .from(expenses)
      .where(expenseCondition);

    const groupedData: Record<string, { revenue: number; cogs: number; orders: number; expenses: number }> = {};
    const currentDate = new Date(dateRangeStart);
    while (currentDate <= dateRangeEnd) {
      const dateStr = currentDate.toISOString().split("T")[0];
      groupedData[dateStr] = { revenue: 0, cogs: 0, orders: 0, expenses: 0 };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    ordersResult.forEach((order) => {
      if (groupedData[order.date]) {
        groupedData[order.date].revenue += parseFloat(order.total || "0");
        groupedData[order.date].cogs += parseFloat(order.cogs || "0");
        groupedData[order.date].orders += 1;
      }
    });

    expensesResult.forEach((expense) => {
      if (groupedData[expense.date]) {
        groupedData[expense.date].expenses += parseFloat(expense.amount || "0");
      }
    });

    const analyticsData = Object.entries(groupedData)
      .map(([date, data]) => ({
        ...data,
        date,
        profit: data.revenue - data.cogs - data.expenses,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return apiResponse.success(analyticsData);
  } catch (error) {
    console.error("Analytics API Error:", error);
    return apiResponse.error("Failed to fetch analytics data");
  }
}
