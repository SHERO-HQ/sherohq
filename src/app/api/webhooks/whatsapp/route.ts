import { NextRequest, NextResponse } from "next/server";
import {
  storeIncomingMessage,
  updateMessageStatus,
  getCampaignDeliveryStatus,
} from "@/lib/whatsapp-messages";
import { updateCampaignDeliveryStats } from "@/lib/newsletter-campaigns";
import { sendAutoReply, getSmartReply } from "@/lib/whatsapp-auto-reply";
import { createSupportTicketFromWhatsApp } from "@/lib/whatsapp-support";
import { scheduleMessageForRetry } from "@/lib/whatsapp-retry";
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

  return NextResponse.json(challenge);
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

    // Send auto-reply if text message
    if (messageType === "text" && content) {
      // Try smart reply first
      const smartReplyText = getSmartReply(content);
      const autoReplyText = smartReplyText || undefined;

      // Send auto-reply with delay
      const replyResult = await sendAutoReply(senderWaId, PHONE_NUMBER_ID, {
        enabled: true,
        message:
          autoReplyText ||
          `Thank you for reaching out! We've received your message and will get back to you as soon as possible. Our support team typically responds within 24 hours.`,
        delay: 2000, // 2 second delay before auto-reply
      });

      if (replyResult.success) {
        console.log(`Sent auto-reply: ${replyResult.messageId}`);
      } else {
        console.warn(`Failed to send auto-reply: ${replyResult.error}`);
      }

      // Create support ticket for human follow-up
      const contactName = contact?.name || null;
      const ticketResult = await createSupportTicketFromWhatsApp(
        messageId,
        senderWaId,
        contactName,
        content,
        "medium",
      );

      console.log(`Created support ticket: ${ticketResult.id}`);
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
    console.error("Error handling status update:", error);
  }
}
