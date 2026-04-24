import { NextRequest, NextResponse } from "next/server";
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
    const { status } = await request.json();

    const result = await query(
      `UPDATE inquiries SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rowCount === 0) return apiResponse.notFound("Inquiry not found");

    await logActivity(admin.id, "inquiry_update", "info", `Updated inquiry status to ${status} for ${id}`);

    return apiResponse.success(result.rows[0]);
  } catch (error) {
    console.error("Update inquiry error:", error);
    return apiResponse.error("Failed to update inquiry");
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
    const result = await query("DELETE FROM inquiries WHERE id = $1 RETURNING name", [id]);

    if (result.rowCount === 0) return apiResponse.notFound("Inquiry not found");

    await logActivity(admin.id, "inquiry_delete", "warning", `Deleted inquiry from ${result.rows[0].name}`);

    return apiResponse.success({ message: "Inquiry deleted successfully" });
  } catch (error) {
    console.error("Delete inquiry error:", error);
    return apiResponse.error("Failed to delete inquiry");
  }
}
