import { NextRequest} from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";
import { notificationService } from "@/lib/notifications";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const { ticketId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return apiResponse.error("Status is required", 400);
    }

    const result = await query(
      `UPDATE tickets SET status = $1 WHERE id = $2 OR ticket_no::text = $2 RETURNING *`,
      [status, ticketId]
    );

    if (result.rowCount === 0) {
      return apiResponse.notFound("Ticket not found");
    }

    const updatedTicket = result.rows[0];

    await logActivity(
      admin.id,
      "ticket_update",
      "info",
      `Ticket #${updatedTicket.ticket_no} status changed to ${status}`
    );

    // Send email notification to user about status change
    try {
      await notificationService.sendSupportTicketStatusEmail({
        id: updatedTicket.id,
        ticket_no: updatedTicket.ticket_no,
        name: updatedTicket.name,
        email: updatedTicket.email,
        subject: updatedTicket.subject,
        status: updatedTicket.status});
    } catch (e) {
      console.error("Failed to send ticket status email:", e);
    }

    return apiResponse.success({
      success: true,
      ticket: updatedTicket});
  } catch (error) {
    console.error("Update ticket status error:", error);
    return apiResponse.error("Failed to update ticket status");
  }
}
