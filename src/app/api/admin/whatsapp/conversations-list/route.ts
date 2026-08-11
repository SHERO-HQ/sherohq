import { apiResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

interface ConversationSummary {
  sender_wa_id: string;
  last_message_at: string;
  message_count: number;
  last_message: string | null;
  direction: string;
  unread_count: number;
}

/**
 * GET /api/admin/whatsapp/conversations/list
 * List all unique conversations with customers (latest messages)
 */
export async function GET(request: NextRequest) {
  try {
    const result = await db.execute(sql`
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
        SELECT 
          sender_wa_id, 
          COUNT(*) as message_count,
          COUNT(*) FILTER (WHERE direction = 'inbound' AND status = 'received') as unread_count
        FROM whatsapp_messages
        GROUP BY sender_wa_id
      )
      SELECT 
        l.sender_wa_id,
        l.last_message_at,
        c.message_count,
        c.unread_count,
        l.last_message,
        l.direction
      FROM LatestMessages l
      JOIN MessageCounts c ON l.sender_wa_id = c.sender_wa_id
      ORDER BY l.last_message_at DESC;
    `);

    const conversations = ((result.rows || result) as unknown) as ConversationSummary[];

    return apiResponse.success({
      success: true,
      count: conversations.length,
      conversations});
  } catch (error: any) {
    console.error("Error fetching conversations list:", error);
    return apiResponse.error("Failed to fetch conversations", 500, error.message || String(error));
  }
}
