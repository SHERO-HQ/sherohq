/**
 * Customer support integration
 * Routes WhatsApp messages to the support system
 */

import { query } from "./db";
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

  const result = await query(
    `
    INSERT INTO consultations (
      id,
      name,
      email,
      phone,
      service,
      message,
      status,
      priority,
      whatsapp_message_id,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, 'open', $7, $8, NOW(), NOW())
    RETURNING *;
    `,
    [
      ticketId,
      customerName || "WhatsApp Customer",
      `whatsapp_${senderWaId}@sherotech.local`, // Virtual email from WhatsApp ID
      senderWaId,
      "whatsapp_support",
      messageContent,
      priority,
      whatsappMessageId,
    ],
  );

  const ticket = result.rows[0];

  console.log(
    `Created support ticket ${ticketId} from WhatsApp message ${whatsappMessageId}`,
  );

  return {
    id: ticket.id,
    source: "whatsapp",
    whatsapp_id: whatsappMessageId,
    customer_phone: senderWaId,
    customer_name: customerName || undefined,
    message: messageContent,
    status: ticket.status,
    priority: ticket.priority,
    category: "whatsapp_support",
    created_at: new Date(ticket.created_at),
    updated_at: new Date(ticket.updated_at),
  };
}

/**
 * Get support tickets from WhatsApp
 */
export async function getWhatsAppSupportTickets(
  status?: "open" | "in_progress" | "closed",
): Promise<SupportTicket[]> {
  let sql = `
    SELECT *
    FROM consultations
    WHERE phone LIKE 'whatsapp_%' OR service = 'whatsapp_support'
  `;

  if (status) {
    sql += ` AND status = $1`;
  }

  sql += ` ORDER BY created_at DESC;`;

  const params = status ? [status] : [];
  const result = await query(sql, params);

  return result.rows.map((row) => ({
    id: row.id,
    source: "whatsapp",
    whatsapp_id: row.whatsapp_message_id,
    customer_phone: row.phone,
    customer_name: row.name,
    message: row.message,
    status: row.status,
    priority: row.priority,
    category: "whatsapp_support",
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  }));
}

/**
 * Update support ticket status
 */
export async function updateSupportTicketStatus(
  ticketId: string,
  status: "open" | "in_progress" | "closed",
): Promise<void> {
  await query(
    `
    UPDATE consultations
    SET status = $1, updated_at = NOW()
    WHERE id = $2;
    `,
    [status, ticketId],
  );

  console.log(`Updated support ticket ${ticketId} status to ${status}`);
}

/**
 * Get customer's support history
 */
export async function getCustomerSupportHistory(
  senderWaId: string,
): Promise<SupportTicket[]> {
  const result = await query(
    `
    SELECT *
    FROM consultations
    WHERE phone = $1 OR email LIKE $2
    ORDER BY created_at DESC;
    `,
    [senderWaId, `whatsapp_${senderWaId}%`],
  );

  return result.rows.map((row) => ({
    id: row.id,
    source: "whatsapp",
    whatsapp_id: row.whatsapp_message_id,
    customer_phone: row.phone,
    customer_name: row.name,
    message: row.message,
    status: row.status,
    priority: row.priority,
    category: "whatsapp_support",
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  }));
}
