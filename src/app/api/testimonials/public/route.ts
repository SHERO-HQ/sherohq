import { NextRequest } from "next/server";
import { query } from "@/lib/db";
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
    await query(
      `INSERT INTO testimonials (id, quote, author, role, company, image, "order", active, rating, "reviewUrl")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        id, 
        quote, 
        author, 
        role || null, 
        company || null, 
        null, // No image uploads for public for now
        99, // default low priority order
        false, // inactive pending admin approval
        rating || null, 
        null
      ]
    );

    const result = await query("SELECT * FROM testimonials WHERE id = $1", [id]);
    return apiResponse.success(
      { message: "Testimonial submitted successfully and is pending review.", testimonial: result.rows[0] },
      201
    );
  } catch (error) {
    console.error("Submit public testimonial error:", error);
    return apiResponse.error("Failed to submit testimonial");
  }
}
