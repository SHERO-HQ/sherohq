import { query } from "./db";

export interface WhatsAppMessage {
  id: string;
  campaign_id?: string | null;
  phone_number_id: string;
  sender_wa_id: string;
  message_type: string;
  content?: string | null;
  status: "received" | "sent" | "delivered" | "read" | "failed";
  direction: "inbound" | "outbound";
  error_code?: string | null;
  error_message?: string | null;
  metadata?: Record<string, any> | null;
  processed_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Store an incoming WhatsApp message from a customer
 */
export async function storeIncomingMessage(
  messageId: string,
  senderWaId: string,
  phoneNumberId: string,
  messageType: string,
  content: string | null,
  metadata: Record<string, any> | null = null,
): Promise<WhatsAppMessage> {
  const result = await query(
    `
    INSERT INTO whatsapp_messages (
      id,
      phone_number_id,
      sender_wa_id,
      message_type,
      content,
      status,
      direction,
      metadata,
      processed_at,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, 'received', 'inbound', $6, NOW(), NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
      updated_at = NOW()
    RETURNING *;
    `,
    [
      messageId,
      phoneNumberId,
      senderWaId,
      messageType,
      content,
      metadata ? JSON.stringify(metadata) : null,
    ],
  );

  return result.rows[0] as WhatsAppMessage;
}

/**
 * Update message delivery status (sent, delivered, read, failed)
 */
export async function updateMessageStatus(
  messageId: string,
  status: "sent" | "delivered" | "read" | "failed",
  errorCode?: string | null,
  errorMessage?: string | null,
): Promise<WhatsAppMessage | null> {
  const result = await query(
    `
    UPDATE whatsapp_messages
    SET
      status = $2,
      error_code = $3,
      error_message = $4,
      updated_at = NOW()
    WHERE id = $1
    RETURNING *;
    `,
    [messageId, status, errorCode || null, errorMessage || null],
  );

  return result.rows[0] || null;
}

/**
 * Store an outgoing message sent via campaign
 */
export async function storeOutgoingMessage(
  messageId: string,
  campaignId: string,
  senderWaId: string,
  phoneNumberId: string,
  content: string,
  metadata: Record<string, any> | null = null,
): Promise<WhatsAppMessage> {
  const result = await query(
    `
    INSERT INTO whatsapp_messages (
      id,
      campaign_id,
      phone_number_id,
      sender_wa_id,
      message_type,
      content,
      status,
      direction,
      metadata,
      processed_at,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, 'text', $5, 'sent', 'outbound', $6, NOW(), NOW(), NOW())
    RETURNING *;
    `,
    [
      messageId,
      campaignId,
      phoneNumberId,
      senderWaId,
      content,
      metadata ? JSON.stringify(metadata) : null,
    ],
  );

  return result.rows[0] as WhatsAppMessage;
}

/**
 * Get conversation history with a customer
 */
export async function getConversationHistory(
  senderWaId: string,
  limit: number = 50,
): Promise<WhatsAppMessage[]> {
  const result = await query(
    `
    SELECT * FROM whatsapp_messages
    WHERE sender_wa_id = $1
    ORDER BY created_at DESC
    LIMIT $2;
    `,
    [senderWaId, limit],
  );

  return result.rows as WhatsAppMessage[];
}

/**
 * Get campaign delivery status summary
 */
export async function getCampaignDeliveryStatus(campaignId: string): Promise<{
  total: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
}> {
  const result = await query(
    `
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
      COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
      COUNT(CASE WHEN status = 'read' THEN 1 END) as read,
      COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
    FROM whatsapp_messages
    WHERE campaign_id = $1 AND direction = 'outbound';
    `,
    [campaignId],
  );

  const row = result.rows[0];
  return {
    total: parseInt(row.total) || 0,
    sent: parseInt(row.sent) || 0,
    delivered: parseInt(row.delivered) || 0,
    read: parseInt(row.read) || 0,
    failed: parseInt(row.failed) || 0,
  };
}

/**
 * Get failed messages for a campaign
 */
export async function getCampaignFailedMessages(
  campaignId: string,
): Promise<WhatsAppMessage[]> {
  const result = await query(
    `
    SELECT * FROM whatsapp_messages
    WHERE campaign_id = $1 AND status = 'failed'
    ORDER BY created_at DESC;
    `,
    [campaignId],
  );

  return result.rows as WhatsAppMessage[];
}
