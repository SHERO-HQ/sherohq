import { NextRequest } from "next/server";
import { query } from "@/lib/db";
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
    const { date, time } = await request.json();

    if (!date || !time) {
      return apiResponse.error("Date and time are required", 400);
    }

    const result = await query(
      `UPDATE consultations SET date = $1, time = $2, status = 'Rescheduled' WHERE id = $3 RETURNING *`,
      [date, time, id]
    );

    if (result.rowCount === 0) return apiResponse.notFound("Consultation not found");

    const updated = result.rows[0];

    await logActivity(
      admin.id,
      "consultation_reschedule",
      "info",
      `Rescheduled consultation for ${updated.name} to ${date} at ${time}`
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
      console.error("Failed to send consultation reschedule email:", e);
    }

    return apiResponse.success({ success: true, consultation: updated });
  } catch (error) {
    console.error("Reschedule consultation error:", error);
    return apiResponse.error("Failed to reschedule consultation");
  }
}
