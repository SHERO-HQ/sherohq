import { NextRequest } from "next/server";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import { getWhatsAppSupportTickets, updateSupportTicketStatus } from "@/lib/whatsapp-support";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return apiResponse.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as "open" | "in_progress" | "closed" | null;

    const tickets = await getWhatsAppSupportTickets(status || undefined);

    return apiResponse.success({
      tickets,
    });
  } catch (error: any) {
    console.error("Error in WhatsApp support GET API:", error);
    return apiResponse.error(error.message || "Internal server error");
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return apiResponse.unauthorized();
    }

    const body = await request.json();
    const { ticketId, status } = body;

    if (!ticketId || !status) {
      return apiResponse.error("ticketId and status are required", 400);
    }

    if (!["open", "in_progress", "closed"].includes(status)) {
      return apiResponse.error("Invalid status. Must be open, in_progress, or closed", 400);
    }

    await updateSupportTicketStatus(ticketId, status);

    return apiResponse.success({
      message: `Ticket status updated to ${status} successfully`,
    });
  } catch (error: any) {
    console.error("Error in WhatsApp support POST API:", error);
    return apiResponse.error(error.message || "Internal server error");
  }
}
