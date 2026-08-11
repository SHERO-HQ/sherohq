import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { consultations } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";
import { notificationService } from "@/lib/notifications";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const { id } = await params;
    const { status } = await request.json();

    if (!status) {
      return apiResponse.error("Status is required", 400);
    }

    const rows = await db.update(consultations)
      .set({ status })
      .where(eq(consultations.id, id))
      .returning();

    if (rows.length === 0) return apiResponse.notFound("Consultation not found");

    const updated = rows[0] as {
      id: string;
      name: string;
      email: string;
      service: string;
      date: string;
      time: string;
      status: string;
    };

    await logActivity(
      admin.id,
      "consultation_update",
      "info",
      `Updated consultation status to ${status} for ${updated.name}`
    );

    try {
      await notificationService.sendConsultationStatusEmail({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        service: updated.service,
        date: updated.date,
        time: updated.time,
        status: updated.status,
      });
    } catch (e) {
      console.error("Failed to send consultation status email:", e);
    }

    return apiResponse.success({ success: true, consultation: updated });
  } catch (error) {
    console.error("Update consultation status error:", error);
    return apiResponse.error("Failed to update consultation status");
  }
}
