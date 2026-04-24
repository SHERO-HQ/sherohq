import { NextRequest, NextResponse } from "next/server";
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
      SELECT g.*, au.username as "authorName"
      FROM support_guides g
      LEFT JOIN admin_users au ON g."authorId" = au.id
      ORDER BY g."createdAt" DESC
    `);
    return apiResponse.success(result.rows);
  } catch (error) {
    console.error("Fetch guides error:", error);
    return apiResponse.error("Failed to fetch support guides");
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const { title, slug, content, summary, category, coverImage, published } = await request.json();
    if (!title || !slug || !content) return apiResponse.error("Title, slug and content required", 400);

    const id = uuidv4();
    await query(
      `INSERT INTO support_guides (id, title, slug, content, summary, category, "authorId", "coverImage", published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, title, slug, content, summary || null, category || "General", admin.id, coverImage || null, published || false]
    );

    await logActivity(admin.id, "guide_create", "success", `Created support guide: ${title}`);

    return apiResponse.success({ id, title, slug }, 201);
  } catch (error) {
    console.error("Create guide error:", error);
    return apiResponse.error("Failed to create support guide");
  }
}
