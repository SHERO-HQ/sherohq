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
    const body = await request.json();

    const allowedFields = ["name", "role", "bio", "image", "social", "order"];
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        let value = body[field];
        if (field === "social" && typeof value !== "string") {
          value = JSON.stringify(value);
        }
        updates.push(`"${field}" = $${paramIndex++}`);
        values.push(value);
      }
    }

    if (updates.length === 0) return apiResponse.error("No fields to update", 400);

    values.push(id);
    const result = await query(
      `UPDATE team_members SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rowCount === 0) return apiResponse.notFound("Team member not found");

    await logActivity(admin.id, "team_member_update", "info", `Updated team member: ${body.name || id}`);

    return apiResponse.success(result.rows[0]);
  } catch (error) {
    console.error("Update team member error:", error);
    return apiResponse.error("Failed to update team member");
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
    const result = await query("DELETE FROM team_members WHERE id = $1 RETURNING name", [id]);

    if (result.rowCount === 0) return apiResponse.notFound("Team member not found");

    await logActivity(admin.id, "team_member_delete", "warning", `Deleted team member: ${result.rows[0].name}`);

    return apiResponse.success({ message: "Team member deleted successfully" });
  } catch (error) {
    console.error("Delete team member error:", error);
    return apiResponse.error("Failed to delete team member");
  }
}
