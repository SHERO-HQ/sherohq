import { apiResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { getConversationHistory, clearConversationHistory, deleteConversation } from "@/lib/whatsapp-messages";

/**
 * GET /api/admin/whatsapp/conversations?phone=PHONE_NUMBER_ID
 * Fetch conversation history with a specific customer
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    if (!phone) {
      return apiResponse.error("Missing phone parameter", 400);
    }

    const messages = await getConversationHistory(phone, Math.min(limit, 500));

    return apiResponse.success({
      success: true,
      phone,
      messageCount: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Error fetching conversation history:", error);
    return apiResponse.error("Failed to fetch conversation history", 500);
  }
}

/**
 * DELETE /api/admin/whatsapp/conversations?phone=PHONE_NUMBER_ID&action=clear|delete
 * Clear or delete a conversation
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");
    const action = searchParams.get("action") || "clear";

    if (!phone) {
      return apiResponse.error("Missing phone parameter", 400);
    }

    if (action === "delete") {
      await deleteConversation(phone);
    } else {
      await clearConversationHistory(phone);
    }

    return apiResponse.success({
      success: true,
      phone,
      action
    });
  } catch (error) {
    console.error(`Error performing ${request.url}:`, error);
    return apiResponse.error("Failed to perform action on conversation", 500);
  }
}
