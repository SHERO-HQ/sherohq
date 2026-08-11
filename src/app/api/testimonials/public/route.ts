import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { testimonials } from "@/lib/drizzle/schema";
import { v4 as uuidv4 } from "uuid";
import { apiResponse } from "@/lib/api-utils";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Basic rate limiting to prevent spam
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const rl = await rateLimit(`testimonial_${ip}`, 3, 60000); // 3 per minute
    if (!rl.success) {
      return apiResponse.error("Too many requests. Please wait a moment.", 429);
    }

    const body = await request.json();
    const { quote, author, role, company, rating } = body;

    if (!quote || !author) {
      return apiResponse.error("Quote and Author are required", 400);
    }

    const id = uuidv4();
    
    // Public submissions are marked inactive by default (pending approval)
    const result = await db.insert(testimonials).values({
      id,
      quote,
      author,
      role: role || null,
      company: company || null,
      image: null,
      order: 99,
      active: false,
      rating: rating || null,
      reviewUrl: null
    }).returning();

    return apiResponse.success(
      { message: "Testimonial submitted successfully and is pending review.", testimonial: result[0] },
      201
    );
  } catch (error) {
    console.error("Submit public testimonial error:", error);
    return apiResponse.error("Failed to submit testimonial");
  }
}
