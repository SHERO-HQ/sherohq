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
  last_inbound_at?: string | null;
  is_window_open: boolean;
  window_expires_at?: string | null;
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
          CASE 
            WHEN content IS NOT NULL AND content != '[button]' AND content != '[interactive]' THEN content
            ELSE COALESCE(
              metadata->>'buttonText',
              metadata->'rawMessage'->'button'->>'text',
              metadata->'rawMessage'->'interactive'->'button_reply'->>'title',
              metadata->'rawMessage'->'interactive'->'list_reply'->>'title',
              metadata->'rawMessage'->'button'->>'payload',
              content,
              CASE 
                WHEN message_type = 'button' THEN '🔘 Clicked button'
                WHEN message_type = 'image' THEN '[Image]'
                WHEN message_type = 'video' THEN '[Video]'
                WHEN message_type = 'document' THEN '[Document]'
                WHEN message_type = 'audio' THEN '[Audio]'
                WHEN message_type = 'sticker' THEN '[Sticker]'
                ELSE '[Message]'
              END
            )
          END as last_message,
          direction
        FROM whatsapp_messages
        ORDER BY sender_wa_id, created_at DESC
      ),
      MessageCounts AS (
        SELECT 
          sender_wa_id, 
          COUNT(*) as message_count,
          COUNT(*) FILTER (WHERE direction = 'inbound' AND status = 'received') as unread_count,
          MAX(created_at) FILTER (WHERE direction = 'inbound') as last_inbound_at
        FROM whatsapp_messages
        GROUP BY sender_wa_id
      )
      SELECT 
        l.sender_wa_id,
        l.last_message_at,
        c.message_count,
        c.unread_count,
        l.last_message,
        l.direction,
        c.last_inbound_at,
        CASE 
          WHEN c.last_inbound_at IS NOT NULL AND c.last_inbound_at > NOW() - INTERVAL '24 hours' THEN true
          ELSE false
        END as is_window_open,
        CASE
          WHEN c.last_inbound_at IS NOT NULL AND c.last_inbound_at > NOW() - INTERVAL '24 hours' 
          THEN c.last_inbound_at + INTERVAL '24 hours'
          ELSE NULL
        END as window_expires_at
      FROM LatestMessages l
      JOIN MessageCounts c ON l.sender_wa_id = c.sender_wa_id
      ORDER BY l.last_message_at DESC;
    `);

    const conversations = ((result.rows || result) as unknown) as ConversationSummary[];

    return apiResponse.success({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error: any) {
    console.error("Error fetching conversations list:", error);
    return apiResponse.error("Failed to fetch conversations", 500, error.message || String(error));
  }
}

