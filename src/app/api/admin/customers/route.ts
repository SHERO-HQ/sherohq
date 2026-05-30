import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    // Only allow admin, superadmin, or manager roles
    const allowedRoles = ["admin", "superadmin", "manager"];
    if (!allowedRoles.includes(admin.role)) {
      return apiResponse.forbidden(
        "You do not have permission to view customers",
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    let whereClause = "";
    const params: any[] = [];

    if (search) {
      whereClause = "WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1";
      params.push(`%${search}%`);
    }

    const countRes = await query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      params,
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const usersRes = await query(
      `SELECT id, name, email, phone, avatar, "emailVerified", "isActive", "createdAt" 
       FROM users 
       ${whereClause} 
       ORDER BY "createdAt" DESC 
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    );

    return apiResponse.success({
      users: usersRes.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch customers error:", error);
    return apiResponse.error("Failed to fetch customers");
  }
}
