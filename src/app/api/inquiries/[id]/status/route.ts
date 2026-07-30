import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const { id } = await params;
    const { status } = await request.json();

    if (!status) {
      return apiResponse.error("Status is required", 400);
    }

    const result = await query(
      `UPDATE inquiries SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rowCount === 0) return apiResponse.notFound("Inquiry not found");

    const updated = result.rows[0];

    await logActivity(
      admin.id,
      "inquiry_update",
      "info",
      `Updated inquiry status to ${status} for ${updated.email}`
    );

    return apiResponse.success({ success: true, inquiry: updated });
  } catch (error) {
    console.error("Update inquiry status error:", error);
    return apiResponse.error("Failed to update inquiry status");
  }
}
