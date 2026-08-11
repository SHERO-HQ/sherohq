import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/drizzle/schema";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import { ilike, or, desc, sql } from "drizzle-orm";

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

    let condition = undefined;
    if (search) {
      const searchPattern = `%${search}%`;
      condition = or(
        ilike(users.name, searchPattern),
        ilike(users.email, searchPattern),
        ilike(users.phone, searchPattern)
      );
    }

    const countRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(condition);
    
    const total = Number(countRes[0].count);

    const usersRes = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        avatar: users.avatar,
        emailVerified: users.emailVerified,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(condition)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    return apiResponse.success({
      users: usersRes,
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
