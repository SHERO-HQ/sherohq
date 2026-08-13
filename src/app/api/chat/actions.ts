/**
 * Action Handlers Module
 * 
 * Executes side-effects from parsed AI response tags:
 * booking consultations, creating support tickets,
 * tracking orders/tickets in the database.
 */

import { db } from "@/lib/db";
import { sql, eq, or } from "drizzle-orm";
import { consultations, tickets } from "@/lib/drizzle/schema";
import { v4 as uuidv4 } from "uuid";
import { logActivity } from "@/lib/activity";
import { getUserFromSession } from "@/lib/auth";

import { notificationService } from "@/lib/notifications";

// ---------------------------------------------------------------------------
// Direct Booking (BOOK_DIRECT)
// ---------------------------------------------------------------------------

export async function handleBookDirect(bookData: any): Promise<any> {
  try {
    const { name, email, phone, service, date, time, message: bookMsg } = bookData;
    if (name && email && service && date && time) {
      const id = uuidv4();
      
      await db.insert(consultations).values({
        id,
        name,
        email,
        phone: phone || null,
        service,
        date,
        time,
        message: bookMsg || "Booked via AI Chat Assistant",
        status: 'pending'
      });

      await logActivity(
        null,
        "Consultation Requested",
        "info",
        `New consultation for ${service} from ${name} (via AI Chat)`,
      );

      const consultationObj = {
        id,
        name,
        email,
        phone: phone || undefined,
        service,
        date,
        time,
        message: bookMsg || "Booked via AI Chat Assistant",
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      try {
        await Promise.allSettled([
          notificationService.sendConsultationScheduledEmail(consultationObj),
          notificationService.sendConsultationScheduledWhatsApp(consultationObj),
          notificationService.sendNewConsultationAdminAlert(consultationObj),
        ]);
      } catch (err) {
        console.error("Chat booking notification error:", err);
      }

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

      const numResult = await db.execute(sql`SELECT COALESCE(MAX(ticket_no), 1000) + 1 AS next_no FROM tickets`);
      const rows = (numResult.rows || numResult) as Record<string, unknown>[];
      const nextTicketNo = (rows[0]?.next_no as number) || 1001;

      let finalUserId = null;
      const userSession = await getUserFromSession();
      if (userSession) {
        finalUserId = userSession.id;
      }

      await db.insert(tickets).values({
        id,
        ticketNo: nextTicketNo,
        name,
        email,
        phone: phone || null,
        subject,
        message: ticketMsg,
        category: category || "General",
        priority: priority || "medium",
        status: 'open',
        userId: finalUserId,
        createdAt: sql`NOW()`
      });

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
    const orderResult = await db.query.orders.findFirst({
      where: sql`id = ${orderId.toLowerCase()} OR replace(lower(id), '-', '') LIKE ${orderId.toLowerCase() + '%'}`,
      columns: { status: true, total: true, createdAt: true }
    });
    
    if (orderResult) {
      return { success: true, order: orderResult };
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
    const isNum = /^\\d+$/.test(ticketId);
    const parsedTicketNo = isNum ? parseInt(ticketId, 10) : -1;
    
    const ticketResult = await db.query.tickets.findFirst({
      where: or(eq(tickets.id, ticketId), eq(tickets.ticketNo, parsedTicketNo)),
      columns: { status: true, subject: true, createdAt: true }
    });

    if (ticketResult) {
      return { success: true, ticket: ticketResult };
    }
    return { success: false, error: "Ticket not found" };
  } catch (error) {
    return { success: false, error: "Error looking up ticket" };
  }
}
