import { db } from "./db";
import { sql } from "drizzle-orm";

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
  const result = await db.execute(sql`
    INSERT INTO whatsapp_messages (
      id, phone_number_id, sender_wa_id, message_type, content, status, direction, metadata, processed_at, created_at, updated_at
    ) VALUES (
      ${messageId}, ${phoneNumberId}, ${senderWaId}, ${messageType}, ${content}, 'received', 'inbound', ${metadata ? JSON.stringify(metadata) : null}, NOW(), NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET updated_at = NOW()
    RETURNING *;
  `);

  return result.rows[0] as any as WhatsAppMessage;
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
  const result = await db.execute(sql`
    UPDATE whatsapp_messages
    SET
      status = CASE
        WHEN ${status} = 'failed' THEN ${status}
        WHEN ${status} = 'read' AND status IN ('sent', 'delivered', 'received') THEN ${status}
        WHEN ${status} = 'delivered' AND status IN ('sent', 'received') THEN ${status}
        WHEN ${status} = 'sent' AND status IN ('received') THEN ${status}
        ELSE status
      END,
      error_code = COALESCE(${errorCode || null}, error_code),
      error_message = COALESCE(${errorMessage || null}, error_message),
      updated_at = NOW()
    WHERE id = ${messageId}
    RETURNING *;
  `);

  return (result.rows[0] as any as WhatsAppMessage) || null;
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
  const result = await db.execute(sql`
    INSERT INTO whatsapp_messages (
      id, campaign_id, phone_number_id, sender_wa_id, message_type, content, status, direction, metadata, processed_at, created_at, updated_at
    ) VALUES (
      ${messageId}, ${campaignId}, ${phoneNumberId}, ${senderWaId}, 'text', ${content}, 'sent', 'outbound', ${metadata ? JSON.stringify(metadata) : null}, NOW(), NOW(), NOW()
    )
    RETURNING *;
  `);

  return result.rows[0] as any as WhatsAppMessage;
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

  const sendPayload = async (payload: any) => {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
    const data = (await response.json()) as any;
    return { ok: response.ok, status: response.status, data };
  };

  try {
    if (templateName) {
      // Meta WhatsApp templates typically use en_US for English
      const langCode = templateLanguage && templateLanguage !== "en" ? templateLanguage : "en_US";
      const templateBody: any = {
        messaging_product: "whatsapp",
        to: recipient,
        type: "template",
        template: {
          name: templateName,
          language: { code: langCode },
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
        },
      };

      let result = await sendPayload(templateBody);

      // If template not found in en_US (error 132001), try with "en"
      if (!result.ok && result.data?.error?.code === 132001 && langCode === "en_US") {
        templateBody.template.language.code = "en";
        result = await sendPayload(templateBody);
      }

      if (result.ok && result.data.messages?.[0]?.id) {
        return { success: true, messageId: result.data.messages[0].id };
      }

      // If template fails (e.g. template not created/approved on Meta yet),
      // gracefully fall back to direct text delivery so the customer still gets their alert
      if (content && content.trim()) {
        console.warn(`[WhatsApp] Template '${templateName}' failed (${result.data?.error?.message}). Falling back to text message.`);
        const textResult = await sendPayload({
          messaging_product: "whatsapp",
          to: recipient,
          type: "text",
          text: { body: content },
        });

        if (textResult.ok && textResult.data.messages?.[0]?.id) {
          return { success: true, messageId: textResult.data.messages[0].id };
        }
      }

      return {
        success: false,
        error: result.data?.error?.message || `HTTP ${result.status}`,
      };
    }

    if (mediaUrl && mediaType) {
      const mediaBody: any = {
        messaging_product: "whatsapp",
        to: recipient,
        type: mediaType,
        [mediaType]: { link: mediaUrl },
      };
      if (content && content !== "") {
        mediaBody[mediaType].caption = content;
      }
      const result = await sendPayload(mediaBody);
      if (!result.ok) {
        return {
          success: false,
          error: result.data?.error?.message || `HTTP ${result.status}`,
        };
      }
      return { success: true, messageId: result.data.messages?.[0]?.id };
    }

    // Standard text message
    const textResult = await sendPayload({
      messaging_product: "whatsapp",
      to: recipient,
      type: "text",
      text: { body: content },
    });

    if (!textResult.ok) {
      return {
        success: false,
        error: textResult.data?.error?.message || `HTTP ${textResult.status}`,
      };
    }

    return { success: true, messageId: textResult.data.messages?.[0]?.id };
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
  const result = await db.execute(sql`
    SELECT * FROM whatsapp_messages
    WHERE sender_wa_id = ${senderWaId}
    ORDER BY created_at DESC
    LIMIT ${limit};
  `);

  return result.rows as any as WhatsAppMessage[];
}

/**
 * Clear all messages in a conversation with a customer
 */
export async function clearConversationHistory(
  senderWaId: string,
): Promise<void> {
  await db.execute(sql`DELETE FROM whatsapp_messages WHERE sender_wa_id = ${senderWaId};`);
}

/**
 * Delete a conversation entirely, including the contact
 */
export async function deleteConversation(
  senderWaId: string,
): Promise<void> {
  const normalizedPhone = senderWaId.replace(/[^\d+]/g, "");
  
  // First clear all messages
  await clearConversationHistory(senderWaId);
  
  // Then delete the contact
  await db.execute(sql`DELETE FROM whatsapp_contacts WHERE phone = ${normalizedPhone};`);
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
  const result = await db.execute(sql`
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
      COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
      COUNT(CASE WHEN status = 'read' THEN 1 END) as read,
      COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
    FROM whatsapp_messages
    WHERE campaign_id = ${campaignId} AND direction = 'outbound';
  `);

  const row = result.rows[0];
  return {
    total: parseInt(row.total as string) || 0,
    sent: parseInt(row.sent as string) || 0,
    delivered: parseInt(row.delivered as string) || 0,
    read: parseInt(row.read as string) || 0,
    failed: parseInt(row.failed as string) || 0,
  };
}

/**
 * Get failed messages for a campaign
 */
export async function getCampaignFailedMessages(
  campaignId: string,
): Promise<WhatsAppMessage[]> {
  const result = await db.execute(sql`
    SELECT * FROM whatsapp_messages
    WHERE campaign_id = ${campaignId} AND status = 'failed'
    ORDER BY created_at DESC;
  `);

  return result.rows as any as WhatsAppMessage[];
}
/**
 * Upsert a WhatsApp contact's profile info
 */
export async function upsertWhatsAppContact(
  phone: string,
  name?: string | null,
): Promise<void> {
  const normalizedPhone = phone.replace(/[^\d+]/g, "");
  
  await db.execute(sql`
    INSERT INTO whatsapp_contacts (
      phone, name, status, last_interaction, created_at, updated_at
    ) VALUES (${normalizedPhone}, ${name || null}, 'active', NOW(), NOW(), NOW())
    ON CONFLICT (phone) DO UPDATE SET
      name = COALESCE(${name || null}, whatsapp_contacts.name),
      last_interaction = NOW(),
      updated_at = NOW()
  `);
}

/**
 * Get a WhatsApp contact's conversation state from metadata
 */
export async function getWhatsAppContactState(phone: string): Promise<string | null> {
  const normalizedPhone = phone.replace(/[^\d+]/g, "");
  const result = await db.execute(sql`SELECT metadata FROM whatsapp_contacts WHERE phone = ${normalizedPhone}`);
  
  if (result.rows.length === 0 || !result.rows[0].metadata) return null;
  return (result.rows[0].metadata as any).conversationState || null;
}

/**
 * Update a WhatsApp contact's conversation state in metadata
 */
export async function updateWhatsAppContactState(phone: string, state: string | null): Promise<void> {
  const normalizedPhone = phone.replace(/[^\d+]/g, "");
  
  if (state === null) {
    await db.execute(sql`
      UPDATE whatsapp_contacts 
      SET metadata = metadata - 'conversationState', updated_at = NOW()
      WHERE phone = ${normalizedPhone} AND metadata IS NOT NULL
    `);
  } else {
    await db.execute(sql`
      UPDATE whatsapp_contacts 
      SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('conversationState', ${state}::text),
          updated_at = NOW()
      WHERE phone = ${normalizedPhone}
    `);
  }
}

