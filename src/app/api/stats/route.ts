import { apiResponse } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { siteStats } from "@/lib/drizzle/schema";
import { asc, desc } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const result = await db.select()
      .from(siteStats)
      .orderBy(asc(siteStats.order), desc(siteStats.createdAt));
      
    return apiResponse.success(result, 200, {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300"
    });
  } catch (err) {
    console.error("Error fetching site stats:", err);
    return apiResponse.error("Failed to fetch site stats", 500);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const { label, value, suffix, prefix, icon, color, order } = await request.json();
    if (!label || !value) return apiResponse.error("Label and value are required", 400);

    const id = uuidv4();
    const result = await db.insert(siteStats).values({
      id,
      label,
      value,
      suffix,
      prefix,
      icon,
      color,
      order: order || 0
    }).returning();

    return apiResponse.success(result[0], 201);
  } catch (err) {
    console.error("Error creating site stat:", err);
    return apiResponse.error("Failed to create site stat", 500);
  }
}
