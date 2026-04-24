import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const result = await query(`
      SELECT r.*, p.name as "productName"
      FROM reviews r
      JOIN products p ON r."productId" = p.id
      ORDER BY r."createdAt" DESC
    `);
    return apiResponse.success(result.rows);
  } catch (error) {
    console.error("Fetch all reviews error:", error);
    return apiResponse.error("Failed to fetch reviews");
  }
}
