import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

interface ConversationSummary {
  sender_wa_id: string;
  last_message_at: string;
  message_count: number;
  last_message: string | null;
  direction: string;
}

/**
 * GET /api/admin/whatsapp/conversations/list
 * List all unique conversations with customers (latest messages)
 */
export async function GET(request: NextRequest) {
  try {
    const result = await query(`
      WITH LatestMessages AS (
        SELECT DISTINCT ON (sender_wa_id)
          sender_wa_id,
          created_at as last_message_at,
          content as last_message,
          direction
        FROM whatsapp_messages
        ORDER BY sender_wa_id, created_at DESC
      ),
      MessageCounts AS (
        SELECT sender_wa_id, COUNT(*) as message_count
        FROM whatsapp_messages
        GROUP BY sender_wa_id
      )
      SELECT 
        l.sender_wa_id,
        l.last_message_at,
        c.message_count,
        l.last_message,
        l.direction
      FROM LatestMessages l
      JOIN MessageCounts c ON l.sender_wa_id = c.sender_wa_id
      ORDER BY l.last_message_at DESC;
    `);

    const conversations = result.rows as ConversationSummary[];

    return NextResponse.json({
      success: true,
      count: conversations.length,
      conversations});
  } catch (error: any) {
    console.error("Error fetching conversations list:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations", details: error.message || String(error) },
      { status: 500 },
    );
  }
}
