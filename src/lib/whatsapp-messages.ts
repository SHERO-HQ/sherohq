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
      status = CASE
        WHEN $2 = 'failed' THEN $2
        WHEN $2 = 'read' AND status IN ('sent', 'delivered', 'received') THEN $2
        WHEN $2 = 'delivered' AND status IN ('sent', 'received') THEN $2
        WHEN $2 = 'sent' AND status IN ('received') THEN $2
        ELSE status
      END,
      error_code = COALESCE($3, error_code),
      error_message = COALESCE($4, error_message),
      updated_at = NOW()
    WHERE id = $1
    RETURNING *;
    `,
    [messageId, status, errorCode || null, errorMessage || null],
  );

  return result.rows[0] || null;
}

/**
 * Store an outgoing message sent via campaign or manual admin chat
 */
export async function storeOutgoingMessage(
  messageId: string,
  campaignId: string | null,
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
 * Send a WhatsApp message or template directly via Meta Graph API
 */
export async function sendWhatsAppMessageDirect(
  phone: string,
  content: string,
  templateName?: string | null,
  templateLanguage?: string | null,
  templateParams?: string[],
  mediaUrl?: string | null,
  mediaType?: "image" | "document" | "video" | "audio" | null
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  // Normalize phone number
  const compact = phone.replace(/[^\d+]/g, "");
  const recipient = compact.startsWith("+") ? compact : `+${compact}`;

  if (!accessToken || !phoneNumberId) {
    if (process.env.NODE_ENV === "production") {
      return { success: false, error: "WhatsApp delivery is not configured. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID." };
    }
    // Simulation in development
    const mockMsgId = `sim_${Math.random().toString(36).substring(2, 11)}`;
    console.log(`[WhatsApp Simulation] To: ${recipient}, Content: ${content || "(template send)"}`);
    return { success: true, messageId: mockMsgId };
  }

  const body: any = {
    messaging_product: "whatsapp",
    to: recipient,
  };

  if (templateName) {
    body.type = "template";
    body.template = {
      name: templateName,
      language: { code: templateLanguage || "en" },
      ...(templateParams && templateParams.length > 0
        ? {
            components: [
              {
                type: "body",
                parameters: templateParams.map((text) => ({
                  type: "text",
                  text,
                })),
              },
            ],
          }
        : {}),
    };
  } else if (mediaUrl && mediaType) {
    body.type = mediaType;
    body[mediaType] = { link: mediaUrl };
    if (content && content !== "") {
      body[mediaType].caption = content;
    }
  } else {
    body.type = "text";
    body.text = { body: content };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json() as any;

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.message || `HTTP ${response.status}`,
      };
    }

    const messageId = data.messages?.[0]?.id;
    return { success: true, messageId };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
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
/**
 * Upsert a WhatsApp contact's profile info
 */
export async function upsertWhatsAppContact(
  phone: string,
  name?: string | null,
): Promise<void> {
  const normalizedPhone = phone.replace(/[^\d+]/g, "");
  
  await query(
    `
    INSERT INTO whatsapp_contacts (
      phone,
      name,
      status,
      last_interaction,
      created_at,
      updated_at
    ) VALUES ($1, $2, 'active', NOW(), NOW(), NOW())
    ON CONFLICT (phone) DO UPDATE SET
      name = COALESCE($2, whatsapp_contacts.name),
      last_interaction = NOW(),
      updated_at = NOW()
    `,
    [normalizedPhone, name || null],
  );
}

/**
 * Get a WhatsApp contact's conversation state from metadata
 */
export async function getWhatsAppContactState(phone: string): Promise<string | null> {
  const normalizedPhone = phone.replace(/[^\d+]/g, "");
  const result = await query(
    `SELECT metadata FROM whatsapp_contacts WHERE phone = $1`,
    [normalizedPhone]
  );
  
  if (result.rows.length === 0 || !result.rows[0].metadata) return null;
  return result.rows[0].metadata.conversationState || null;
}

/**
 * Update a WhatsApp contact's conversation state in metadata
 */
export async function updateWhatsAppContactState(phone: string, state: string | null): Promise<void> {
  const normalizedPhone = phone.replace(/[^\d+]/g, "");
  
  if (state === null) {
    await query(
      `
      UPDATE whatsapp_contacts 
      SET metadata = metadata - 'conversationState', updated_at = NOW()
      WHERE phone = $1 AND metadata IS NOT NULL
      `,
      [normalizedPhone]
    );
  } else {
    await query(
      `
      UPDATE whatsapp_contacts 
      SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('conversationState', $2::text),
          updated_at = NOW()
      WHERE phone = $1
      `,
      [normalizedPhone, state]
    );
  }
}

