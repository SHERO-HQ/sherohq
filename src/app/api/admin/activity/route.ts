import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const result = await query(`
      SELECT 
        al.*, 
        au.username as "adminName"
      FROM activity_logs al
      LEFT JOIN admin_users au ON al."adminId" = au.id
      ORDER BY al."createdAt" DESC 
      LIMIT 100
    `);

    return apiResponse.success(result.rows);
  } catch (error) {
    console.error("Fetch activity logs error:", error);
    return apiResponse.error("Failed to fetch activity logs");
  }
}
