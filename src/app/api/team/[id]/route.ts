import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { teamMembers } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";
import { safeParse } from "@/lib/orderUtils";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const id = (await params).id;
    const body = await request.json();

    const allowedFields = ["name", "role", "bio", "image", "social", "order"];
    const updates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        let value = body[field];
        if (field === "social" && typeof value !== "string") {
          value = JSON.stringify(value);
        }
        updates[field] = value;
      }
    }

    if (Object.keys(updates).length === 0) return apiResponse.error("No fields to update", 400);

    const result = await db.update(teamMembers)
      .set(updates)
      .where(eq(teamMembers.id, id))
      .returning();

    if (result.length === 0) return apiResponse.notFound("Team member not found");

    await logActivity(admin.id, "team_member_update", "info", `Updated team member: ${body.name || id}`);

    const member = result[0];
    return apiResponse.success({
      ...member,
      social: safeParse(member.social)
    });
  } catch (error) {
    console.error("Update team member error:", error);
    return apiResponse.error("Failed to update team member");
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
    const result = await db.delete(teamMembers)
      .where(eq(teamMembers.id, id))
      .returning({ name: teamMembers.name });

    if (result.length === 0) return apiResponse.notFound("Team member not found");

    await logActivity(admin.id, "team_member_delete", "warning", `Deleted team member: ${result[0].name}`);

    return apiResponse.success({ message: "Team member deleted successfully" });
  } catch (error) {
    console.error("Delete team member error:", error);
    return apiResponse.error("Failed to delete team member");
  }
}
