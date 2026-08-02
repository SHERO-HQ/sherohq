/**
 * Action Handlers Module
 * 
 * Executes side-effects from parsed AI response tags:
 * booking consultations, creating support tickets,
 * tracking orders/tickets in the database.
 */

import { query as dbQuery } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { logActivity } from "@/lib/activity";
import { getUserFromSession } from "@/lib/auth";

// ---------------------------------------------------------------------------
// Direct Booking (BOOK_DIRECT)
// ---------------------------------------------------------------------------

export async function handleBookDirect(bookData: any): Promise<any> {
  try {
    const { name, email, phone, service, date, time, message: bookMsg } = bookData;
    if (name && email && service && date && time) {
      const id = uuidv4();
      await dbQuery(
        `INSERT INTO consultations (id, name, email, phone, service, date, time, message, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')`,
        [id, name, email, phone || null, service, date, time, bookMsg || "Booked via AI Chat Assistant"],
      );

      await logActivity(
        null,
        "Consultation Requested",
        "info",
        `New consultation for ${service} from ${name} (via AI Chat)`,
      );

      return {
        success: true,
        data: { id, name, email, phone, service, date, time, status: "pending" },
      };
    }

    return {
      success: false,
      error: "Missing details (name, email, service, date, or time).",
    };
  } catch (error) {
    console.error("Direct booking failed:", error);
    return {
      success: false,
      error: "Encountered an issue while scheduling consultation.",
    };
  }
}

// ---------------------------------------------------------------------------
// Direct Ticket (TICKET_DIRECT)
// ---------------------------------------------------------------------------

export async function handleTicketDirect(ticketData: any): Promise<any> {
  try {
    const { name, email, phone, subject, message: ticketMsg, priority, category } = ticketData;
    if (name && email && subject && ticketMsg) {
      const id = uuidv4();

      const numResult = await dbQuery(
        "SELECT COALESCE(MAX(ticket_no), 1000) + 1 AS next_no FROM tickets",
      );
      const nextTicketNo = numResult.rows[0]?.next_no || 1001;

      let finalUserId = null;
      const userSession = await getUserFromSession();
      if (userSession) {
        finalUserId = userSession.id;
      }

      await dbQuery(
        `INSERT INTO tickets (
          id, ticket_no, name, email, phone, subject, message, category, priority, status, "userId", "createdAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'open', $10, NOW())`,
        [
          id,
          nextTicketNo,
          name,
          email,
          phone || null,
          subject,
          ticketMsg,
          category || "General",
          priority || "medium",
          finalUserId,
        ],
      );

      await logActivity(
        null,
        "Support Ticket Created",
        "info",
        `New support ticket #${nextTicketNo} created from ${name} (via AI Chat)`,
      );

      return {
        success: true,
        data: {
          id,
          ticket_no: nextTicketNo,
          name,
          email,
          phone,
          subject,
          message: ticketMsg,
          category: category || "General",
          priority: priority || "medium",
          status: "open",
        },
      };
    }

    return {
      success: false,
      error: "Missing details (name, email, subject, or message).",
    };
  } catch (error) {
    console.error("Direct ticketing failed:", error);
    return {
      success: false,
      error: "Encountered an issue while creating your support ticket.",
    };
  }
}

// ---------------------------------------------------------------------------
// Order tracking (TRACK_ORDER)
// ---------------------------------------------------------------------------

export async function handleTrackOrder(orderId: string): Promise<any> {
  try {
    const orderResult = await dbQuery(
      `SELECT status, total, "createdAt" FROM orders WHERE id = $1 OR replace(lower(id), '-', '') LIKE $1 || '%' LIMIT 1`,
      [orderId.toLowerCase()],
    );
    const order = orderResult.rows[0];
    if (order) {
      return { success: true, order };
    }
    return { success: false, error: "Order not found" };
  } catch (error) {
    return { success: false, error: "Error looking up order" };
  }
}

// ---------------------------------------------------------------------------
// Ticket tracking (TRACK_TICKET)
// ---------------------------------------------------------------------------

export async function handleTrackTicket(ticketId: string): Promise<any> {
  try {
    const ticketResult = await dbQuery(
      `SELECT status, subject, "createdAt" FROM tickets WHERE id = $1 OR ticket_no = $2 LIMIT 1`,
      [ticketId, /^\d+$/.test(ticketId) ? parseInt(ticketId, 10) : -1],
    );
    const ticket = ticketResult.rows[0];
    if (ticket) {
      return { success: true, ticket };
    }
    return { success: false, error: "Ticket not found" };
  } catch (error) {
    return { success: false, error: "Error looking up ticket" };
  }
}
