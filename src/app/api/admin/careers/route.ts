import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const result = await query(`
      SELECT *
      FROM careers
      ORDER BY "createdAt" DESC
    `);
    return apiResponse.success(result.rows);
  } catch (error) {
    console.error("Fetch careers error:", error);
    return apiResponse.error("Failed to fetch careers");
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const { title, department, location, type, description, requirements, isActive } = await request.json();
    if (!title || !department || !location || !type) {
      return apiResponse.error("Title, department, location, and type are required", 400);
    }

    const id = uuidv4();
    await query(
      `INSERT INTO careers (id, title, department, location, type, description, requirements, "isActive")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, title, department, location, type, description || null, requirements ? JSON.stringify(requirements) : null, isActive ?? true]
    );

    await logActivity(admin.id, "career_create", "success", `Created job posting: ${title}`);

    return apiResponse.success({ id, title }, 201);
  } catch (error) {
    console.error("Create career error:", error);
    return apiResponse.error("Failed to create job posting");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const { id, title, department, location, type, description, requirements, isActive } = await request.json();
    if (!id || !title || !department || !location || !type) {
      return apiResponse.error("ID, title, department, location, and type are required", 400);
    }

    await query(
      `UPDATE careers 
       SET title = $1, department = $2, location = $3, type = $4, description = $5, requirements = $6, "isActive" = $7, "updatedAt" = CURRENT_TIMESTAMP
       WHERE id = $8`,
      [title, department, location, type, description || null, requirements ? JSON.stringify(requirements) : null, isActive, id]
    );

    await logActivity(admin.id, "career_update", "success", `Updated job posting: ${title}`);

    return apiResponse.success({ id, title });
  } catch (error) {
    console.error("Update career error:", error);
    return apiResponse.error("Failed to update job posting");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return apiResponse.error("ID is required", 400);

    await query(`DELETE FROM careers WHERE id = $1`, [id]);
    await logActivity(admin.id, "career_delete", "success", `Deleted job posting: ${id}`);

    return apiResponse.success({ success: true });
  } catch (error) {
    console.error("Delete career error:", error);
    return apiResponse.error("Failed to delete job posting");
  }
}
