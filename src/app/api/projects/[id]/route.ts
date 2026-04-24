import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";

function parseProject(row: any) {
  const safeParse = (val: unknown): unknown => {
    if (!val) return [];
    if (typeof val !== "string") return val;
    try {
      return JSON.parse(val);
    } catch (e) {
      return [];
    }
  };

  return {
    ...row,
    technologies: safeParse(row.technologies),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const result = await query("SELECT * FROM projects WHERE id = $1", [id]);
    const project = result.rows[0];

    if (!project) return apiResponse.notFound("Project not found");

    return apiResponse.success(parseProject(project));
  } catch (error) {
    console.error("Fetch project error:", error);
    return apiResponse.error("Failed to fetch project");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const id = (await params).id;
    const body = await request.json();

    const allowedFields = ["title", "category", "client", "description", "useCase", "technologies", "image", "link"];
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        let value = body[field];
        if (field === "technologies" && typeof value !== "string") {
          value = JSON.stringify(value);
        }
        updates.push(`"${field}" = $${paramIndex++}`);
        values.push(value);
      }
    }

    if (updates.length === 0) return apiResponse.error("No fields to update", 400);

    values.push(id);
    const result = await query(
      `UPDATE projects SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rowCount === 0) return apiResponse.notFound("Project not found");

    await logActivity(admin.id, "project_update", "info", `Updated project: ${body.title || id}`);

    return apiResponse.success({ success: true, project: parseProject(result.rows[0]) });
  } catch (error) {
    console.error("Update project error:", error);
    return apiResponse.error("Failed to update project");
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
    const result = await query("DELETE FROM projects WHERE id = $1 RETURNING title", [id]);

    if (result.rowCount === 0) return apiResponse.notFound("Project not found");

    await logActivity(admin.id, "project_delete", "warning", `Deleted project: ${result.rows[0].title}`);

    return apiResponse.success({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    return apiResponse.error("Failed to delete project");
  }
}
