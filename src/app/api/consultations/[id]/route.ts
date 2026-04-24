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
      `UPDATE consultations SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rowCount === 0) return apiResponse.notFound("Consultation not found");

    await logActivity(admin.id, "consultation_update", "info", `Updated consultation status to ${status} for ${id}`);

    return apiResponse.success(result.rows[0]);
  } catch (error) {
    console.error("Update consultation error:", error);
    return apiResponse.error("Failed to update consultation");
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
    const result = await query("DELETE FROM consultations WHERE id = $1 RETURNING name", [id]);

    if (result.rowCount === 0) return apiResponse.notFound("Consultation not found");

    await logActivity(admin.id, "consultation_delete", "warning", `Deleted consultation for ${result.rows[0].name}`);

    return apiResponse.success({ message: "Consultation deleted successfully" });
  } catch (error) {
    console.error("Delete consultation error:", error);
    return apiResponse.error("Failed to delete consultation");
  }
}
