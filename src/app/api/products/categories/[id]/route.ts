import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
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

    const check = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, id));
    if (check.length === 0) return apiResponse.notFound("Category not found");

    await db.update(categories)
      .set({ name, icon })
      .where(eq(categories.id, id));

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
    const check = await db.select({ name: categories.name }).from(categories).where(eq(categories.id, id));
    if (check.length === 0) return apiResponse.notFound("Category not found");

    const categoryName = check[0].name;
    await db.delete(categories).where(eq(categories.id, id));

    await logActivity(admin.id, "category_delete", "warning", `Deleted category: ${categoryName}`);

    return apiResponse.success({ message: `Category "${categoryName}" deleted` });
  } catch (error) {
    console.error("Delete category error:", error);
    return apiResponse.error("Failed to delete category");
  }
}
