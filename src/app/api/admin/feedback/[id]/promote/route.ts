import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import { logActivity } from "@/lib/activity";
import { v4 as uuidv4 } from "uuid";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return apiResponse.unauthorized();
    }

    const { id } = await params;
    const feedbackId = parseInt(id, 10);
    
    if (isNaN(feedbackId)) {
       return apiResponse.error("Invalid ID format", 400);
    }

    // 1. Fetch the feedback
    const feedbackResult = await db.execute(sql`
      SELECT * FROM customer_feedback WHERE id = ${feedbackId}
    `);

    const rows = (feedbackResult.rows || feedbackResult) as Record<string, unknown>[];
    const feedback = rows[0];
    if (!feedback) {
      return apiResponse.error("Feedback not found", 404);
    }

    // 2. Insert into testimonials (active: false by default for review)
    const testimonialId = uuidv4();
    const author = feedback.name || "Anonymous";
    const quote = feedback.message;
    const rating = feedback.rating || 5;

    await db.execute(sql`
      INSERT INTO testimonials (id, quote, author, active, rating, "order")
      VALUES (${testimonialId}, ${quote}, ${author}, false, ${rating}, 0)
    `);

    // 3. Log it
    await logActivity(
      admin.id,
      "feedback_promote",
      "success",
      `Promoted feedback #${feedbackId} to testimonial`
    );

    return apiResponse.success({ 
        message: "Successfully promoted to Testimonials",
        testimonialId 
    });
  } catch (error) {
    console.error("Promote feedback error:", error);
    return apiResponse.error("Failed to promote feedback");
  }
}
