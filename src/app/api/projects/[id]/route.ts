import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { projects } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";
import { safeParse } from "@/lib/orderUtils";

function parseProject(row: any) {
  return {
    ...row,
    technologies: safeParse(row.technologies)
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);

    if (result.length === 0) return apiResponse.notFound("Project not found");

    return apiResponse.success(parseProject(result[0]));
  } catch (error) {
    console.error("Fetch project error:", error);
    return apiResponse.error("Failed to fetch project");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const id = (await params).id;
    const body = await request.json();

    const allowedFields = ["title", "category", "client", "description", "useCase", "technologies", "image", "link"];
    const updates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        let value = body[field];
        if (field === "technologies" && typeof value !== "string") {
          value = JSON.stringify(value);
        }
        updates[field] = value;
      }
    }

    if (Object.keys(updates).length === 0) return apiResponse.error("No fields to update", 400);

    const result = await db.update(projects).set(updates).where(eq(projects.id, id)).returning();

    if (result.length === 0) return apiResponse.notFound("Project not found");

    await logActivity(admin.id, "project_update", "info", `Updated project: ${body.title || id}`);

    return apiResponse.success({ success: true, project: parseProject(result[0]) });
  } catch (error) {
    console.error("Update project error:", error);
    return apiResponse.error("Failed to update project");
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
    const result = await db.delete(projects).where(eq(projects.id, id)).returning({ title: projects.title });

    if (result.length === 0) return apiResponse.notFound("Project not found");

    await logActivity(admin.id, "project_delete", "warning", `Deleted project: ${result[0].title}`);

    return apiResponse.success({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    return apiResponse.error("Failed to delete project");
  }
}
