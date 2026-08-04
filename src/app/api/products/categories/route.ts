import { NextRequest} from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin || !["admin", "superadmin", "manager"].includes(admin.role)) {
      return apiResponse.unauthorized();
    }

    const { name, icon } = await request.json();
    if (!name) return apiResponse.error("Category name is required", 400);

    // Check if category already exists (case-insensitive)
    const existing = await query("SELECT id, name, icon FROM categories WHERE name ILIKE $1", [name]);
    if (existing.rowCount > 0) {
      return apiResponse.error("A category with this name already exists", 409);
    }

    const id = uuidv4();
    await query("INSERT INTO categories (id, name, icon) VALUES ($1, $2, $3)", [
      id,
      name,
      icon || "Package",
    ]);

    await logActivity(admin.id, "category_create", "success", `Created category: ${name}`);

    return apiResponse.success({ id, name, icon: icon || "Package" }, 201);
  } catch (error) {
    console.error("Create category error:", error);
    return apiResponse.error("Failed to create category");
  }
}
