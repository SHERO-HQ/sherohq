import { apiResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { tickets } from "@/lib/drizzle/schema";
import { eq, sql, desc } from "drizzle-orm";
import { getUserFromSession, getAdminFromSession } from "@/lib/auth";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const ticketId = (await params).ticketId;
    const rawTicketId = String(ticketId || "").trim();

    let orderRows = [];

    // Parse identifier: Could be UUID or ticket number
    if (UUID_RE.test(rawTicketId)) {
      orderRows = await db.select().from(tickets).where(eq(tickets.id, rawTicketId)).limit(1);
    } else if (/^\d+$/.test(rawTicketId)) {
      orderRows = await db.select().from(tickets).where(eq(tickets.ticketNo, parseInt(rawTicketId, 10))).limit(1);
    } else {
      // Partial UUID search fallback
      const compactCandidate = rawTicketId.toLowerCase().replace(/[^0-9a-f]/g, "");
      if (compactCandidate.length >= 8) {
        orderRows = await db.select().from(tickets)
          .where(sql`replace(lower(${tickets.id}::text), '-', '') LIKE ${compactCandidate.slice(0, 8) + '%'}`)
          .orderBy(desc(tickets.createdAt))
          .limit(1);
      } else {
        return apiResponse.error("Invalid ticket identifier", 400);
      }
    }

    const ticket = orderRows[0];

    if (!ticket) {
      return apiResponse.notFound("Ticket not found");
    }

    // Check authorization: Admin or Owner
    const [admin, user] = await Promise.all([
      getAdminFromSession(),
      getUserFromSession(),
    ]);

    const isAuthorized = Boolean(admin) || (user && (ticket.userId === user.id || ticket.email === user.email));

    if (!isAuthorized) {
      // Return safe, redacted details for public status updates
      return apiResponse.success({
        id: ticket.id,
        ticket_no: ticket.ticketNo,
        status: ticket.status,
        category: ticket.category,
        subject: ticket.subject,
        createdAt: ticket.createdAt,
      });
    }

    // Return full ticket details for authorized owners
    return apiResponse.success(ticket);
  } catch (error: any) {
    console.error("Error tracking ticket:", error);
    return apiResponse.error("Failed to track ticket", 500);
  }
}
