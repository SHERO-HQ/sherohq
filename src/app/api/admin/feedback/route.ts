import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return apiResponse.unauthorized();
    }

    const result = await db.execute(sql`
      SELECT id, name, email, rating, message, page, created_at as "createdAt" FROM customer_feedback ORDER BY created_at DESC
    `);

    return apiResponse.success((result.rows || result) as Record<string, unknown>[]);
  } catch (error) {
    console.error("Fetch feedback error:", error);
    return apiResponse.error("Failed to fetch feedback");
  }
}
