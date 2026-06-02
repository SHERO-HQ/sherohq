import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getUserFromSession, getAdminFromSession } from "@/lib/auth";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const ticketId = (await params).ticketId;
    const rawTicketId = String(ticketId || "").trim();

    let ticketQuery = "";
    let ticketParams: (string | number)[] = [];

    // Parse identifier: Could be UUID or ticket number
    if (UUID_RE.test(rawTicketId)) {
      ticketQuery = `SELECT * FROM tickets WHERE id = $1`;
      ticketParams = [rawTicketId];
    } else if (/^\d+$/.test(rawTicketId)) {
      ticketQuery = `SELECT * FROM tickets WHERE ticket_no = $1`;
      ticketParams = [parseInt(rawTicketId, 10)];
    } else {
      // Partial UUID search fallback
      const compactCandidate = rawTicketId.toLowerCase().replace(/[^0-9a-f]/g, "");
      if (compactCandidate.length >= 8) {
        ticketQuery = `SELECT * FROM tickets WHERE replace(lower(id), '-', '') LIKE $1 || '%' ORDER BY "createdAt" DESC LIMIT 1`;
        ticketParams = [compactCandidate.slice(0, 8)];
      } else {
        return NextResponse.json({ error: "Invalid ticket identifier" }, { status: 400 });
      }
    }

    const result = await query(ticketQuery, ticketParams);
    const ticket = result.rows[0];

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Check authorization: Admin or Owner
    const [admin, user] = await Promise.all([
      getAdminFromSession(),
      getUserFromSession(),
    ]);

    const isAuthorized = Boolean(admin) || (user && (ticket.userId === user.id || ticket.email === user.email));

    if (!isAuthorized) {
      // Return safe, redacted details for public status updates
      return NextResponse.json({
        id: ticket.id,
        ticket_no: ticket.ticket_no,
        status: ticket.status,
        category: ticket.category,
        subject: ticket.subject,
        createdAt: ticket.createdAt,
      });
    }

    // Return full ticket details for authorized owners
    return NextResponse.json(ticket);
  } catch (error: any) {
    console.error("Error tracking ticket:", error);
    return NextResponse.json({ error: "Failed to track ticket" }, { status: 500 });
  }
}
