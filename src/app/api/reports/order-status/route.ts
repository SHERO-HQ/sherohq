import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const result = await query(`
      SELECT status, COUNT(*) as count 
      FROM orders 
      GROUP BY status
    `);

    const colors: Record<string, string> = {
      pending: "#f59e0b",
      processing: "#3b82f6",
      shipped: "#8b5cf6",
      delivered: "#10b981",
      cancelled: "#ef4444",
      quote: "#6b7280",
    };

    const data = result.rows.map((row) => ({
      name: row.status.charAt(0).toUpperCase() + row.status.slice(1),
      value: parseInt(row.count, 10),
      color: colors[row.status] || "#cbd5e1",
    }));

    return apiResponse.success(data);
  } catch (error) {
    console.error("Order Status Distribution API Error:", error);
    return apiResponse.error("Failed to fetch order status distribution");
  }
}
