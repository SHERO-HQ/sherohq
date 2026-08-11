import { db } from "@/lib/db";
import { orders } from "@/lib/drizzle/schema";
import { sql } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const result = await db.select({
      status: orders.status,
      count: sql`COUNT(*)`
    })
    .from(orders)
    .groupBy(orders.status);

    const colors: Record<string, string> = {
      pending: "#f59e0b",
      processing: "#3b82f6",
      intransit: "#8b5cf6",
      delivered: "#10b981",
      cancelled: "#ef4444",
      quote: "#6b7280"
    };

    // Initialize all statuses to 0
    const statusCounts: Record<string, number> = {
      pending: 0,
      processing: 0,
      intransit: 0,
      delivered: 0,
      cancelled: 0,
      quote: 0,
    };

    // Update with actual DB counts
    result.forEach((row: any) => {
      if (statusCounts[row.status] !== undefined) {
        statusCounts[row.status] = parseInt(row.count, 10);
      } else {
        statusCounts[row.status] = parseInt(row.count, 10); // Capture any unexpected statuses
      }
    });

    const data = Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: colors[status] || "#cbd5e1",
      fill: colors[status] || "#cbd5e1"
    }));

    return apiResponse.success(data);
  } catch (error) {
    console.error("Order Status Distribution API Error:", error);
    return apiResponse.error("Failed to fetch order status distribution");
  }
}
