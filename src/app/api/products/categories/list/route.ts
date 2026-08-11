import { apiResponse } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { categories } from "@/lib/drizzle/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await db.select().from(categories).orderBy(asc(categories.name));
    return apiResponse.success(result, 200, {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300"
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return apiResponse.error("Failed to fetch categories", 500);
  }
}
