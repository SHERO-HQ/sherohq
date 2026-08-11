import { NextRequest} from "next/server";
import { db } from "@/lib/db";
import { consultations } from "@/lib/drizzle/schema";
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
    const { status } = await request.json();

    const rows = await db.update(consultations)
      .set({ status })
      .where(eq(consultations.id, id))
      .returning();

    if (rows.length === 0) return apiResponse.notFound("Consultation not found");

    await logActivity(admin.id, "consultation_update", "info", `Updated consultation status to ${status} for ${id}`);

    return apiResponse.success(rows[0]);
  } catch (error) {
    console.error("Update consultation error:", error);
    return apiResponse.error("Failed to update consultation");
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
    const rows = await db.delete(consultations)
      .where(eq(consultations.id, id))
      .returning({ name: consultations.name });
    if (rows.length === 0) return apiResponse.notFound("Consultation not found");

    await logActivity(admin.id, "consultation_delete", "warning", `Deleted consultation for ${rows[0].name}`);

    return apiResponse.success({ message: "Consultation deleted successfully" });
  } catch (error) {
    console.error("Delete consultation error:", error);
    return apiResponse.error("Failed to delete consultation");
  }
}
