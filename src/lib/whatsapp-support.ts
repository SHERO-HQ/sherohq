/**
 * Customer support integration
 * Routes WhatsApp messages to the support system
 */

import { db } from "./db";
import { sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export interface SupportTicket {
  id: string;
  source: "whatsapp" | "email" | "form";
  whatsapp_id?: string; // WhatsApp message ID for tracking
  customer_phone?: string; // WhatsApp phone number
  customer_name?: string;
  message: string;
  status: "open" | "in_progress" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Create support ticket from WhatsApp message
 * Routes customer message to support system for human handling
 */
export async function createSupportTicketFromWhatsApp(
  whatsappMessageId: string,
  senderWaId: string,
  customerName: string | null,
  messageContent: string,
  priority: "low" | "medium" | "high" | "urgent" = "medium",
): Promise<SupportTicket> {
  const ticketId = uuidv4();

  const result = await db.execute(sql`
    INSERT INTO consultations (
      id, name, email, phone, service, message, status, priority, whatsapp_message_id, created_at, updated_at
    ) VALUES (
      ${ticketId}, ${customerName || "WhatsApp Customer"}, ${`whatsapp_${senderWaId}@sherotech.local`}, ${senderWaId}, 'whatsapp_support', ${messageContent}, 'open', ${priority}, ${whatsappMessageId}, NOW(), NOW()
    )
    RETURNING *;
  `);

  const ticket = result.rows[0] as any;

  console.log(
    `Created support ticket ${ticketId} from WhatsApp message ${whatsappMessageId}`,
  );

  return {
    id: ticket.id,
    source: "whatsapp",
    whatsapp_id: ticket.whatsapp_message_id,
    customer_phone: ticket.phone,
    customer_name: ticket.name,
    message: ticket.message,
    status: ticket.status as "open" | "in_progress" | "closed",
    priority: ticket.priority as "medium" | "low" | "high" | "urgent",
    category: "general", // WhatsApp tickets are general category initially
    created_at: new Date(ticket.created_at as string | number | Date),
    updated_at: new Date(ticket.updated_at as string | number | Date),
  };
}

/**
 * Get support tickets from WhatsApp
 */
export async function getWhatsAppSupportTickets(
  status?: "open" | "in_progress" | "closed",
): Promise<SupportTicket[]> {
  let queryText = sql`
    SELECT *
    FROM consultations
    WHERE phone LIKE 'whatsapp_%' OR service = 'whatsapp_support'
  `;

  if (status) {
    queryText = sql`${queryText} AND status = ${status}`;
  }

  queryText = sql`${queryText} ORDER BY created_at DESC;`;
  const result = await db.execute(queryText);

  return result.rows.map((row: any) => ({
    id: row.id,
    source: "whatsapp",
    whatsapp_id: row.whatsapp_message_id,
    customer_phone: row.phone,
    customer_name: row.name,
    message: row.message,
    status: row.status as "open" | "in_progress" | "closed",
    priority: row.priority as "medium" | "low" | "high" | "urgent",
    category: "general",
    created_at: new Date(row.created_at as string | number | Date),
    updated_at: new Date(row.updated_at as string | number | Date),
  }));
}

/**
 * Update support ticket status
 */
export async function updateSupportTicketStatus(
  ticketId: string,
  status: "open" | "in_progress" | "closed",
): Promise<void> {
  await db.execute(sql`
    UPDATE consultations
    SET status = ${status}, updated_at = NOW()
    WHERE id = ${ticketId};
  `);

  console.log(`Updated support ticket ${ticketId} status to ${status}`);
}

