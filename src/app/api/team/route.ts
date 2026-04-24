import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const result = await query(`SELECT * FROM team_members ORDER BY "order" ASC, "createdAt" DESC`);
    return apiResponse.success(result.rows);
  } catch (error) {
    console.error("Fetch team error:", error);
    return apiResponse.error("Failed to fetch team members");
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const body = await request.json();
    const { name, role, bio, image, social, order } = body;

    const id = uuidv4();
    await query(
      `INSERT INTO team_members (id, name, role, bio, image, social, "order")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, name, role, bio || null, image || null, social ? JSON.stringify(social) : null, order || 0]
    );

    await logActivity(admin.id, "team_member_create", "success", `Added team member: ${name}`);

    const result = await query("SELECT * FROM team_members WHERE id = $1", [id]);
    return apiResponse.success(result.rows[0], 201);
  } catch (error) {
    console.error("Create team member error:", error);
    return apiResponse.error("Failed to add team member");
  }
}
