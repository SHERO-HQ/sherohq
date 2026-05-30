import { NextRequest, NextResponse } from "next/server";
import { getConversationHistory } from "@/lib/whatsapp-messages";

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
      return NextResponse.json(
        { error: "Missing phone parameter" },
        { status: 400 },
      );
    }

    const messages = await getConversationHistory(phone, Math.min(limit, 500));

    return NextResponse.json({
      success: true,
      phone,
      messageCount: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Error fetching conversation history:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation history" },
      { status: 500 },
    );
  }
}
