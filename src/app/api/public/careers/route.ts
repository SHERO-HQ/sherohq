import { apiResponse } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { careers } from "@/lib/drizzle/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db.select()
      .from(careers)
      .where(eq(careers.isActive, true))
      .orderBy(desc(careers.createdAt));
    
    return apiResponse.success(
      { success: true, data: result },
      200,
      { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" }
    );
  } catch (error) {
    console.error("Public fetch careers error:", error);
    return apiResponse.error("Failed to fetch active job postings", 500);
  }
}
