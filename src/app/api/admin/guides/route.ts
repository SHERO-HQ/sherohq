import { NextRequest} from "next/server";
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
      SELECT g.*, au.username as "authorName"
      FROM support_guides g
      LEFT JOIN admin_users au ON g."authorId" = au.id
      ORDER BY g."createdAt" DESC
    `);
    return apiResponse.success((result.rows || result) as Record<string, unknown>[]);
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
    await db.execute(sql`
      INSERT INTO support_guides (id, title, slug, content, summary, category, "authorId", "coverImage", published)
      VALUES (${id}, ${title}, ${slug}, ${content}, ${summary || null}, ${category || "General"}, ${admin.id}, ${coverImage || null}, ${published || false})
    `);

    await logActivity(admin.id, "guide_create", "success", `Created support guide: ${title}`);

    return apiResponse.success({ id, title, slug }, 201);
  } catch (error) {
    console.error("Create guide error:", error);
    return apiResponse.error("Failed to create support guide");
  }
}
