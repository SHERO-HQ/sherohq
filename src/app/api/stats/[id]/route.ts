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

    const allowedFields = ["label", "value", "suffix", "prefix", "icon", "color", "order"];
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
      `UPDATE site_stats SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rowCount === 0) return apiResponse.notFound("Stat not found");

    await logActivity(admin.id, "site_stat_update", "info", `Updated site stat: ${body.label || id}`);

    return apiResponse.success(result.rows[0]);
  } catch (error) {
    console.error("Update site stat error:", error);
    return apiResponse.error("Failed to update site stat");
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
    const result = await query("DELETE FROM site_stats WHERE id = $1 RETURNING label", [id]);

    if (result.rowCount === 0) return apiResponse.notFound("Stat not found");

    await logActivity(admin.id, "site_stat_delete", "warning", `Deleted site stat: ${result.rows[0].label}`);

    return apiResponse.success({ message: "Site stat deleted successfully" });
  } catch (error) {
    console.error("Delete site stat error:", error);
    return apiResponse.error("Failed to delete site stat");
  }
}
