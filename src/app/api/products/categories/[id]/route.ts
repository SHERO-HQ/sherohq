import { NextRequest} from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin || !["admin", "superadmin"].includes(admin.role)) {
      return apiResponse.unauthorized();
    }

    const id = (await params).id;
    const { name, icon } = await request.json();

    const check = await query("SELECT * FROM categories WHERE id = $1", [id]);
    if (check.rowCount === 0) return apiResponse.notFound("Category not found");

    await query("UPDATE categories SET name = $1, icon = $2 WHERE id = $3", [
      name,
      icon,
      id,
    ]);

    await logActivity(admin.id, "category_update", "info", `Updated category: ${name}`);

    return apiResponse.success({ id, name, icon });
  } catch (error) {
    console.error("Update category error:", error);
    return apiResponse.error("Failed to update category");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin || !["admin", "superadmin"].includes(admin.role)) {
      return apiResponse.unauthorized();
    }

    const id = (await params).id;
    const check = await query("SELECT name FROM categories WHERE id = $1", [id]);
    if (check.rowCount === 0) return apiResponse.notFound("Category not found");

    const categoryName = check.rows[0].name;
    await query("DELETE FROM categories WHERE id = $1", [id]);

    await logActivity(admin.id, "category_delete", "warning", `Deleted category: ${categoryName}`);

    return apiResponse.success({ message: `Category "${categoryName}" deleted` });
  } catch (error) {
    console.error("Delete category error:", error);
    return apiResponse.error("Failed to delete category");
  }
}
