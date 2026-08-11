import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { siteStats } from "@/lib/drizzle/schema";
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
    if (!admin) return apiResponse.unauthorized();

    const id = (await params).id;
    const body = await request.json();

    const allowedFields = ["label", "value", "suffix", "prefix", "icon", "color", "order"];
    const updates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) return apiResponse.error("No fields to update", 400);

    const result = await db.update(siteStats)
      .set(updates)
      .where(eq(siteStats.id, id))
      .returning();

    if (result.length === 0) return apiResponse.notFound("Stat not found");

    await logActivity(admin.id, "site_stat_update", "info", `Updated site stat: ${body.label || id}`);

    return apiResponse.success(result[0]);
  } catch (error) {
    console.error("Update site stat error:", error);
    return apiResponse.error("Failed to update site stat");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const id = (await params).id;
    
    const result = await db.delete(siteStats)
      .where(eq(siteStats.id, id))
      .returning({ label: siteStats.label });

    if (result.length === 0) return apiResponse.notFound("Stat not found");

    await logActivity(admin.id, "site_stat_delete", "warning", `Deleted site stat: ${result[0].label}`);

    return apiResponse.success({ message: "Site stat deleted successfully" });
  } catch (error) {
    console.error("Delete site stat error:", error);
    return apiResponse.error("Failed to delete site stat");
  }
}
