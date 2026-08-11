import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { tickets } from "@/lib/drizzle/schema";
import { eq, or } from "drizzle-orm";
import { getAdminFromSession, getUserFromSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;
    const [admin, user] = await Promise.all([
      getAdminFromSession(),
      getUserFromSession(),
    ]);

    const isNumeric = /^\d+$/.test(ticketId);
    const condition = isNumeric 
      ? or(eq(tickets.id, ticketId), eq(tickets.ticketNo, parseInt(ticketId, 10))) 
      : eq(tickets.id, ticketId);

    const result = await db.select().from(tickets).where(condition).limit(1);

    if (result.length === 0) {
      return apiResponse.notFound("Ticket not found");
    }

    const ticket = result[0];

    // Access control: admin or the ticket owner
    if (!admin && (!user || (user.id !== ticket.userId && user.email !== ticket.email))) {
      return apiResponse.unauthorized();
    }

    return apiResponse.success(ticket);
  } catch (error) {
    console.error("Fetch ticket error:", error);
    return apiResponse.error("Failed to fetch ticket");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const { ticketId } = await params;
    const isNumeric = /^\d+$/.test(ticketId);
    const condition = isNumeric 
      ? or(eq(tickets.id, ticketId), eq(tickets.ticketNo, parseInt(ticketId, 10))) 
      : eq(tickets.id, ticketId);

    const result = await db.delete(tickets).where(condition).returning({ ticket_no: tickets.ticketNo });

    if (result.length === 0) {
      return apiResponse.notFound("Ticket not found");
    }

    await logActivity(
      admin.id,
      "ticket_delete",
      "warning",
      `Deleted support ticket #${result[0].ticket_no}`
    );

    return apiResponse.success({ message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("Delete ticket error:", error);
    return apiResponse.error("Failed to delete ticket");
  }
}
