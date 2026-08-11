import { } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const result = await db.execute(sql`
      SELECT r.*, p.name as "productName"
      FROM reviews r
      JOIN products p ON r."productId" = p.id
      ORDER BY r."createdAt" DESC
    `);
    return apiResponse.success((result.rows || result) as Record<string, unknown>[]);
  } catch (error) {
    console.error("Fetch all reviews error:", error);
    return apiResponse.error("Failed to fetch reviews");
  }
}
