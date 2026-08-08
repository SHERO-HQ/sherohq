import { NextRequest, NextResponse } from "next/server";
import {
  storeIncomingMessage,
  updateMessageStatus,
  getCampaignDeliveryStatus,
  upsertWhatsAppContact,
  getWhatsAppContactState,
  updateWhatsAppContactState,
} from "@/lib/whatsapp-messages";
import { updateCampaignDeliveryStats } from "@/lib/newsletter-campaigns";
import { sendAutoReply, getSmartReply } from "@/lib/whatsapp-auto-reply";
import { createSupportTicketFromWhatsApp } from "@/lib/whatsapp-support";
import { scheduleMessageForRetry } from "@/lib/whatsapp-retry";
import { COMPANY_CONTACTS } from "@/constants/contacts";

const WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN!;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;

// GET: Meta calls this to verify your endpoint
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode !== "subscribe" || token !== WEBHOOK_VERIFY_TOKEN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Facebook expects the raw challenge string (plain text), not JSON
  return new Response(challenge ?? "", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

// POST: Incoming messages & status updates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log webhook event (keep for debugging)
    console.log("WhatsApp webhook received:", JSON.stringify(body, null, 2));

    // Process messages and status updates
    const { entry } = body;
    for (const item of entry) {
      const changes = item.changes[0];
      const { value } = changes;

      if (value.messages) {
        // Incoming message from customer
        for (const msg of value.messages) {
          await handleIncomingMessage(msg, value.contacts?.[0]);
        }
      }

      if (value.statuses) {
        // Message status update (sent, delivered, read, failed)
        for (const status of value.statuses) {
          await handleStatusUpdate(status);
        }
      }

      if (changes.field === "message_template_status_update") {
        await handleTemplateStatusUpdate(value);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    // Return 200 to prevent Meta from retrying, but log the error
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function handleIncomingMessage(msg: any, contact: any) {
  try {
    const messageId = msg.id;
    const senderWaId = msg.from;
    const messageType = msg.type; // 'text', 'image', 'document', etc.
    let content: string | null = null;

    // Extract content based on message type
    if (msg.text?.body) {
      content = msg.text.body;
    } else if (msg.interactive?.button_reply) {
      content = msg.interactive.button_reply.id;
    } else if (msg.image) {
      content = msg.image.caption ? `[Sent an Image] ${msg.image.caption}` : `[Sent an Image]`;
    } else if (msg.video) {
      content = msg.video.caption ? `[Sent a Video] ${msg.video.caption}` : `[Sent a Video]`;
    } else if (msg.document) {
      content = msg.document.caption ? `[Sent a Document] ${msg.document.caption}` : `[Sent a Document]`;
    } else if (msg.audio) {
      content = `[Sent Audio]`;
    } else if (msg.sticker) {
      content = `[Sent a Sticker]`;
    }

    console.log(
      `Incoming message from ${senderWaId}: [${messageType}] ${
        content || "(no text)"
      }`,
    );

    // Store message in database
    const storedMsg = await storeIncomingMessage(
      messageId,
      senderWaId,
      PHONE_NUMBER_ID,
      messageType,
      content,
      {
        rawMessage: msg, // Store full message for debugging
      },
    );

    console.log(`Stored incoming message: ${storedMsg.id}`);

    // Extract and upsert contact info
    const contactName = contact?.profile?.name || contact?.name || null;
    await upsertWhatsAppContact(senderWaId, contactName).catch((e) =>
      console.error("Failed to upsert WhatsApp contact:", e),
    );

    // MULTI-CHANNEL ADMIN ALERTS
    try {
      const { query } = await import("@/lib/db");
      const recentMsgs = await query(`
        SELECT count(*) FROM whatsapp_messages
        WHERE sender_wa_id = $1 
        AND direction = 'inbound'
        AND created_at > NOW() - INTERVAL '15 minutes'
      `, [senderWaId]);

      // Only trigger if this is the first message in the last 15 mins (spam prevention)
      if (parseInt(recentMsgs.rows[0].count) <= 1) {
        const { notificationService } = await import("@/lib/notifications");
        await notificationService.sendNewWhatsAppAlert(
          contactName || "Customer", 
          senderWaId, 
          content || `[Sent a ${messageType}]`
        ).catch(e => console.error("Failed to send WhatsApp Email Alert", e));

        const adminPhone = process.env.ADMIN_PHONE_NUMBER;
        if (adminPhone) {
          const { sendWhatsAppMessageDirect } = await import("@/lib/whatsapp-messages");
          const alertMessage = `💬 *New WhatsApp Message*\n\n*From:* ${contactName || "Customer"} (${senderWaId})\n\n"${content || `[Sent a ${messageType}]`}"\n\nReply here: https://admin.sherohq.com/admin/whatsapp`;
          await sendWhatsAppMessageDirect(
            adminPhone,
            alertMessage,
            null, null, []
          ).catch(e => console.error("Failed to send WhatsApp Relay Alert", e));
        }
      }
    } catch (alertError) {
      console.error("Failed to process multi-channel alerts:", alertError);
    }

    // Send auto-reply if content exists
    if (content) {
      const currentState = await getWhatsAppContactState(senderWaId);

      if (currentState === "WAITING_FOR_ORDER_ID") {
        const orderId = content.trim();
        const { query } = await import("@/lib/db");
        try {
          const orderRes = await query(`SELECT status, total, payment_status FROM orders WHERE id = $1`, [orderId]);
          
          if (orderRes.rows.length > 0) {
            const order = orderRes.rows[0];
            await sendAutoReply(senderWaId, PHONE_NUMBER_ID, {
              enabled: true,
              message: `✅ *Order Found!*\n\n*Order ID:* ${orderId}\n*Status:* ${order.status.toUpperCase()}\n*Total:* ₵${order.total}\n*Payment:* ${order.payment_status.toUpperCase()}\n\nLet me know if you need anything else!`,
            });
          } else {
            await sendAutoReply(senderWaId, PHONE_NUMBER_ID, {
              enabled: true,
              message: `❌ Sorry, I couldn't find an order with the ID "${orderId}". Please check the ID and try again, or ask to speak to a human.`,
            });
          }
        } catch (e) {
          console.error("Order lookup error:", e);
        }
        await updateWhatsAppContactState(senderWaId, null);
        return; // Stop processing
      }

      if (currentState === "WAITING_FOR_TICKET_ISSUE") {
        const ticketResult = await createSupportTicketFromWhatsApp(
          messageId,
          senderWaId,
          contactName,
          content,
          "medium",
        );
        console.log(`Created support ticket: ${ticketResult.id}`);

        await sendAutoReply(senderWaId, PHONE_NUMBER_ID, {
          enabled: true,
          message: `🎫 *Support Ticket Created!*\n\nYour issue has been logged. A human agent will review it and reply to you here shortly. Thank you for your patience!`,
        });
        
        await updateWhatsAppContactState(senderWaId, null);
        return; // Stop processing
      }

      // Normal Mode (No State)
      // Try smart reply first
      const smartReply = getSmartReply(content);
      const autoReplyText = smartReply?.message || undefined;
      const interactiveButtons = smartReply?.buttons;

      // Handle interactive button clicks to update state
      if (content === "btn_order") {
        await updateWhatsAppContactState(senderWaId, "WAITING_FOR_ORDER_ID");
      } else if (content === "btn_support") {
        await updateWhatsAppContactState(senderWaId, "WAITING_FOR_TICKET_ISSUE");
      }

      let shouldSendReply = true;
      let isNewConversation = true;
      
      // Only throttle if it's the fallback message (not a smart reply)
      if (!autoReplyText) {
        let isNewThisHour = false;
        try {
          const { query } = await import("@/lib/db");
          const recent24h = await query(`
            SELECT count(*) FROM whatsapp_messages
            WHERE sender_wa_id = $1 
            AND direction = 'inbound'
            AND created_at > NOW() - INTERVAL '24 hours'
          `, [senderWaId]);
          
          const recent1h = await query(`
            SELECT count(*) FROM whatsapp_messages
            WHERE sender_wa_id = $1 
            AND direction = 'inbound'
            AND created_at > NOW() - INTERVAL '1 hour'
          `, [senderWaId]);
          
          // If count > 1, they've sent other messages in the last 24 hours besides the one we just stored
          isNewConversation = parseInt(recent24h.rows[0].count) <= 1;
          isNewThisHour = parseInt(recent1h.rows[0].count) <= 1;
        } catch (err) {
          console.error("Failed to check 24h messages for throttle:", err);
        }

        const hour = new Date().getUTCHours();
        const isAfterHours = hour >= 21 || hour < 8;

        if (!isNewConversation && !(isAfterHours && isNewThisHour)) {
          shouldSendReply = false;
          console.log(`Skipping fallback auto-reply for ${senderWaId} (active conversation)`);
        }
      }

      if (shouldSendReply) {
        // Send auto-reply with delay
        const replyResult = await sendAutoReply(senderWaId, PHONE_NUMBER_ID, {
          enabled: true,
          message:
            autoReplyText ||
            `Thank you for reaching out to SHERO! We've received your message. Select an option below, or simply type your question and a human agent will assist you.\n\nFor faster replies, you can text our personal number at ${COMPANY_CONTACTS.PHONE_DISPLAY}.`,
          interactiveButtons,
          delay: 2000, // 2 second delay before auto-reply
        });

        if (replyResult.success) {
          console.log(`Sent auto-reply: ${replyResult.messageId}`);
        } else {
          console.warn(`Failed to send auto-reply: ${replyResult.error}`);
        }
      }
    }
  } catch (error) {
    console.error("Error handling incoming message:", error);
  }
}

async function handleStatusUpdate(status: any) {
  try {
    const messageId = status.id;
    const statusValue = status.status; // 'sent', 'delivered', 'read', 'failed'
    const errorCode = status.errors?.[0]?.code || null;
    const errorMessage = status.errors?.[0]?.message || null;

    console.log(
      `Message ${messageId} status: ${statusValue}${
        errorCode ? ` (error: ${errorCode})` : ""
      }`,
    );

    // Update message status in database
    const updatedMsg = await updateMessageStatus(
      messageId,
      statusValue,
      errorCode,
      errorMessage,
    );

    if (!updatedMsg) {
      console.warn(`Message ${messageId} not found in database`);
      return;
    }

    // If this is a campaign message, update campaign stats
    if (updatedMsg.campaign_id) {
      const stats = await getCampaignDeliveryStatus(updatedMsg.campaign_id);
      console.log(`Campaign ${updatedMsg.campaign_id} stats:`, stats);

      // Update campaign with delivery stats
      await updateCampaignDeliveryStats(updatedMsg.campaign_id, {
        sent: stats.sent,
        delivered: stats.delivered,
        read: stats.read,
        failed: stats.failed,
      });

      console.log(
        `Updated campaign ${updatedMsg.campaign_id} with delivery stats`,
      );

      // If message failed, schedule for retry
      if (statusValue === "failed") {
        console.log(`Scheduling message ${messageId} for retry`);
        await scheduleMessageForRetry(
          messageId,
          updatedMsg.campaign_id,
          updatedMsg.sender_wa_id,
          updatedMsg.content || "Message retry",
        );
      }
    }
  } catch (error) {
    console.error("Failed to update message status:", error);
  }
}

import { db } from "@/lib/db";
import { campaignTemplates } from "@/lib/drizzle/schema";
import { eq, and } from "drizzle-orm";

async function handleTemplateStatusUpdate(value: any) {
  try {
    const { message_template_name, message_template_language, event } = value;
    
    if (!message_template_name || !event) return;

    await db.update(campaignTemplates)
      .set({
        status: event, // APPROVED, REJECTED, PENDING
        updatedAt: new Date().toISOString()
      })
      .where(
        and(
          eq(campaignTemplates.name, message_template_name),
          eq(campaignTemplates.whatsappTemplateLanguage, message_template_language || "en"),
          eq(campaignTemplates.channel, "whatsapp")
        )
      );
      
    console.log(`WhatsApp Template ${message_template_name} status updated to ${event}`);
  } catch (error) {
    console.error("Failed to update template status from webhook:", error);
  }
}
