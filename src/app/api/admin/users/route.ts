import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    // Check if role is admin or superadmin
    if (admin.role !== "admin" && admin.role !== "superadmin") {
      return apiResponse.forbidden(
        "Only administrators can view staff members",
      );
    }

    const result = await db.execute(sql`
      SELECT id, username, email, role, phone, avatar, "isActive", "createdAt" FROM admin_users ORDER BY "createdAt" DESC
    `);

    return apiResponse.success({ users: (result.rows || result) as Record<string, unknown>[] });
  } catch (error) {
    console.error("Fetch admins error:", error);
    return apiResponse.error("Failed to fetch admin users");
  }
}
