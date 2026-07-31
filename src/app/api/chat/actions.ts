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

export async function handleBookDirect(bookData: any): Promise<{
  reply: string;
  resolved: any | undefined;
}> {
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

      const formattedDate = new Date(date).toLocaleDateString("en-GH", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      return {
        reply: `I have scheduled your consultation for **${service}** on **${formattedDate}** at **${time}**. We look forward to speaking with you, ${name}!`,
        resolved: { id, name, email, phone, service, date, time, status: "pending" },
      };
    }

    return {
      reply: "I wanted to book a consultation for you, but some details (name, email, service, date, or time) were missing.",
      resolved: undefined,
    };
  } catch (error) {
    console.error("Direct booking failed:", error);
    return {
      reply: "I encountered an issue while scheduling your consultation. Please try again or visit our booking page.",
      resolved: undefined,
    };
  }
}

// ---------------------------------------------------------------------------
// Direct Ticket (TICKET_DIRECT)
// ---------------------------------------------------------------------------

export async function handleTicketDirect(ticketData: any): Promise<{
  reply: string;
  resolved: any | undefined;
}> {
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
        reply: `I have successfully opened support ticket **#${nextTicketNo}** for you. Our technicians have been notified and will contact you via email at **${email}** shortly.`,
        resolved: {
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
      reply: "I wanted to create a support ticket for you, but some details (name, email, subject, or message) were missing.",
      resolved: undefined,
    };
  } catch (error) {
    console.error("Direct ticketing failed:", error);
    return {
      reply: "I encountered an issue while creating your support ticket. Please try again or visit our support page to submit a ticket.",
      resolved: undefined,
    };
  }
}

// ---------------------------------------------------------------------------
// Order tracking (TRACK_ORDER)
// ---------------------------------------------------------------------------

export async function handleTrackOrder(orderId: string): Promise<string> {
  try {
    const orderResult = await dbQuery(
      `SELECT status, total, "createdAt" FROM orders WHERE id = $1 OR replace(lower(id), '-', '') LIKE $1 || '%' LIMIT 1`,
      [orderId.toLowerCase()],
    );
    const order = orderResult.rows[0];
    if (order) {
      const statusText = order.status.toUpperCase();
      const orderDate = new Date(order.createdAt).toLocaleDateString("en-GH");
      return `Found order #${orderId.slice(0, 8)}. Status: **${statusText}** (Created: ${orderDate}). Here are your tracking details:`;
    }
    return `I searched our system but could not find an order matching identifier **#${orderId}**. Please verify your order ID.`;
  } catch {
    return "Here is the status of your order:";
  }
}

// ---------------------------------------------------------------------------
// Ticket tracking (TRACK_TICKET)
// ---------------------------------------------------------------------------

export async function handleTrackTicket(ticketId: string): Promise<string> {
  try {
    const ticketResult = await dbQuery(
      `SELECT status, subject, "createdAt" FROM tickets WHERE id = $1 OR ticket_no = $2 LIMIT 1`,
      [ticketId, /^\d+$/.test(ticketId) ? parseInt(ticketId, 10) : -1],
    );
    const ticket = ticketResult.rows[0];
    if (ticket) {
      const statusText = ticket.status.toUpperCase();
      const ticketDate = new Date(ticket.createdAt).toLocaleDateString("en-GH");
      return `Found ticket #${ticketId}. Subject: **"${ticket.subject}"** | Status: **${statusText}** (Opened: ${ticketDate}). Here is the live ticket card:`;
    }
    return `I searched our records but could not find a ticket matching **#${ticketId}**. Please check the ticket number.`;
  } catch {
    return "Here is the status of your support ticket:";
  }
}
