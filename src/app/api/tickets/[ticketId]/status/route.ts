import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { tickets } from "@/lib/drizzle/schema";
import { eq, or } from "drizzle-orm";
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

    const isNumeric = /^\d+$/.test(ticketId);
    const condition = isNumeric 
      ? or(eq(tickets.id, ticketId), eq(tickets.ticketNo, parseInt(ticketId, 10))) 
      : eq(tickets.id, ticketId);

    const result = await db.update(tickets).set({ status }).where(condition).returning();

    if (result.length === 0) {
      return apiResponse.notFound("Ticket not found");
    }

    const updatedTicket = result[0];

    await logActivity(
      admin.id,
      "ticket_update",
      "info",
      `Ticket #${updatedTicket.ticketNo} status changed to ${status}`
    );

    // Send email notification to user about status change
    try {
      await notificationService.sendSupportTicketStatusEmail({
        id: updatedTicket.id,
        ticket_no: updatedTicket.ticketNo,
        name: updatedTicket.name,
        email: updatedTicket.email,
        subject: updatedTicket.subject || "No Subject",
        status: updatedTicket.status || "open"
      });
    } catch (e) {
      console.error("Failed to send ticket status email:", e);
    }

    return apiResponse.success({
      success: true,
      ticket: updatedTicket
    });
  } catch (error) {
    console.error("Update ticket status error:", error);
    return apiResponse.error("Failed to update ticket status");
  }
}
