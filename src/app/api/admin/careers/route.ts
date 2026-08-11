import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const result = await db.execute(sql`
      SELECT *
      FROM careers
      ORDER BY "createdAt" DESC
    `);
    return apiResponse.success((result.rows || result) as Record<string, unknown>[]);
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
    await db.execute(sql`
      INSERT INTO careers (id, title, department, location, type, description, requirements, "isActive")
      VALUES (${id}, ${title}, ${department}, ${location}, ${type}, ${description || null}, ${requirements ? JSON.stringify(requirements) : null}, ${isActive ?? true})
    `);

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

    await db.execute(sql`
      UPDATE careers 
      SET title = ${title}, department = ${department}, location = ${location}, type = ${type}, description = ${description || null}, requirements = ${requirements ? JSON.stringify(requirements) : null}, "isActive" = ${isActive}, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `);

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

    await db.execute(sql`DELETE FROM careers WHERE id = ${id}`);
    await logActivity(admin.id, "career_delete", "success", `Deleted job posting: ${id}`);

    return apiResponse.success({ success: true });
  } catch (error) {
    console.error("Delete career error:", error);
    return apiResponse.error("Failed to delete job posting");
  }
}
