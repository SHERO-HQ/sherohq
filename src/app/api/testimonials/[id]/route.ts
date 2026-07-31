import { NextRequest} from "next/server";
import { query } from "@/lib/db";
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
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`"${field}" = $${paramIndex++}`);
        values.push(body[field]);
      }
    }

    if (updates.length === 0) return apiResponse.error("No fields to update", 400);

    values.push(id);
    const result = await query(
      `UPDATE testimonials SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rowCount === 0) return apiResponse.notFound("Testimonial not found");

    await logActivity(admin.id, "testimonial_update", "info", `Updated testimonial by: ${body.author || id}`);

    return apiResponse.success(result.rows[0]);
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
    const result = await query("DELETE FROM testimonials WHERE id = $1 RETURNING author", [id]);

    if (result.rowCount === 0) return apiResponse.notFound("Testimonial not found");

    await logActivity(admin.id, "testimonial_delete", "warning", `Deleted testimonial by: ${result.rows[0].author}`);

    return apiResponse.success({ message: "Testimonial deleted successfully" });
  } catch (error) {
    console.error("Delete testimonial error:", error);
    return apiResponse.error("Failed to delete testimonial");
  }
}
