import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { apiResponse } from "@/lib/api-utils";
import { logActivity } from "@/lib/activity";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const result = await db.execute(sql`
      SELECT e.*, au.username as "adminName"
      FROM expenses e
      LEFT JOIN admin_users au ON e."adminId" = au.id
      ORDER BY e.date DESC
    `);

    return apiResponse.success((result.rows || result) as Record<string, unknown>[]);
  } catch (error) {
    console.error("Fetch expenses error:", error);
    return apiResponse.error("Failed to fetch expenses");
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const { title, amount, category, date, description } = await request.json();
    if (!title || !amount || !category || !date) {
      return apiResponse.error("Missing required fields", 400);
    }

    const id = uuidv4();
    await db.execute(sql`
      INSERT INTO expenses (id, title, amount, category, date, description, "adminId")
      VALUES (${id}, ${title}, ${amount}, ${category}, ${date}, ${description || null}, ${admin.id})
    `);

    await logActivity(
      admin.id,
      "expense_create",
      "warning",
      `Added expense: ${title} (${amount})`,
    );

    return apiResponse.success({ id, title, amount }, 201);
  } catch (error) {
    console.error("Create expense error:", error);
    return apiResponse.error("Failed to add expense");
  }
}
