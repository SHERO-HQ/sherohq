import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { testimonials } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const id = (await params).id;
    const body = await request.json();

    const allowedFields = ["quote", "author", "role", "company", "image", "order", "active", "rating", "reviewUrl"];
    const updates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) return apiResponse.error("No fields to update", 400);

    const result = await db.update(testimonials)
      .set(updates)
      .where(eq(testimonials.id, id))
      .returning();

    if (result.length === 0) return apiResponse.notFound("Testimonial not found");

    await logActivity(admin.id, "testimonial_update", "info", `Updated testimonial by: ${body.author || id}`);

    return apiResponse.success(result[0]);
  } catch (error) {
    console.error("Update testimonial error:", error);
    return apiResponse.error("Failed to update testimonial");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const id = (await params).id;
    const result = await db.delete(testimonials)
      .where(eq(testimonials.id, id))
      .returning({ author: testimonials.author });

    if (result.length === 0) return apiResponse.notFound("Testimonial not found");

    await logActivity(admin.id, "testimonial_delete", "warning", `Deleted testimonial by: ${result[0].author}`);

    return apiResponse.success({ message: "Testimonial deleted successfully" });
  } catch (error) {
    console.error("Delete testimonial error:", error);
    return apiResponse.error("Failed to delete testimonial");
  }
}
