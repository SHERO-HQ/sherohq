import { NextRequest } from "next/server";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import { sendWhatsAppMessageDirect, storeOutgoingMessage } from "@/lib/whatsapp-messages";

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return apiResponse.unauthorized();
    }

    const body = await request.json();
    const { phone, message, templateName, templateLanguage, templateParams } = body;

    if (!phone) {
      return apiResponse.error("Phone number is required", 400);
    }

    if (!message && !templateName) {
      return apiResponse.error("Message content or template name is required", 400);
    }

    // Send the message using our direct helper
    const result = await sendWhatsAppMessageDirect(
      phone,
      message,
      templateName,
      templateLanguage,
      templateParams
    );

    if (!result.success || !result.messageId) {
      return apiResponse.error(result.error || "Failed to send WhatsApp message", 400, {
        errorCode: result.errorCode,
      });
    }

    // Log the sent message to database (campaign_id is null for manual admin chats)
    const storedMessage = await storeOutgoingMessage(
      result.messageId,
      null, // campaignId
      phone.replace(/[^\d]/g, ""), // senderWaId (recipient normalized)
      process.env.WHATSAPP_PHONE_NUMBER_ID || "unknown",
      message || `[Template: ${templateName}]`
    );

    return apiResponse.success({
      message: "WhatsApp message sent successfully",
      messageId: result.messageId,
      storedMessage,
    });
  } catch (error: any) {
    console.error("Error in WhatsApp send API:", error);
    return apiResponse.error(error.message || "Internal server error");
  }
}
