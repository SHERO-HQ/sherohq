import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

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
      SELECT
        sender_wa_id,
        MAX(created_at) as last_message_at,
        COUNT(*) as message_count,
        (array_agg(content ORDER BY created_at DESC))[1] as last_message,
        (array_agg(direction ORDER BY created_at DESC))[1] as direction
      FROM whatsapp_messages
      GROUP BY sender_wa_id
      ORDER BY MAX(created_at) DESC;
    `);

    const conversations = result.rows as ConversationSummary[];

    return NextResponse.json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    console.error('Error fetching conversations list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
