import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { testimonials } from "@/lib/drizzle/schema";
import { eq, asc, desc } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const isAdmin = searchParams.get("admin") === "true";
    
    let result;
    if (!isAdmin) {
      result = await db.select()
        .from(testimonials)
        .where(eq(testimonials.active, true))
        .orderBy(asc(testimonials.order), desc(testimonials.createdAt));
    } else {
      result = await db.select()
        .from(testimonials)
        .orderBy(asc(testimonials.order), desc(testimonials.createdAt));
    }
    
    // Only cache public requests
    const headers = !isAdmin ? { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } : undefined;
    
    return apiResponse.success(result, 200, headers);
  } catch (error) {
    console.error("Fetch testimonials error:", error);
    return apiResponse.error("Failed to fetch testimonials");
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    const body = await request.json();
    const { quote, author, role, company, image, order, active, rating, reviewUrl } = body;

    const id = uuidv4();
    const result = await db.insert(testimonials).values({
      id,
      quote,
      author,
      role: role || null,
      company: company || null,
      image: image || null,
      order: order || 0,
      active: active !== undefined ? active : true,
      rating: rating || null,
      reviewUrl: reviewUrl || null
    }).returning();

    if (admin) {
      await logActivity(admin.id, "testimonial_create", "success", `Created testimonial by: ${author}`);
    }

    return apiResponse.success(result[0], 201);
  } catch (error) {
    console.error("Create testimonial error:", error);
    return apiResponse.error("Failed to create testimonial");
  }
}
