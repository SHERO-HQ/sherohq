import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const { id } = await params;
    const result = await query("DELETE FROM inquiries WHERE id = $1 RETURNING name", [id]);

    if (result.rowCount === 0) return apiResponse.notFound("Inquiry not found");

    await logActivity(
      admin.id,
      "inquiry_delete",
      "warning",
      `Deleted inquiry from ${result.rows[0].name}`
    );

    return apiResponse.success({ message: "Inquiry deleted successfully" });
  } catch (error) {
    console.error("Delete inquiry error:", error);
    return apiResponse.error("Failed to delete inquiry");
  }
}
