import { NextRequest } from "next/server";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return apiResponse.unauthorized();
    }

    // Query 1: Message count by direction
    const directionCounts = await query(`
      SELECT direction, COUNT(*)::int as count 
      FROM whatsapp_messages 
      GROUP BY direction
    `);

    // Query 2: Outbound message count by status
    const statusCounts = await query(`
      SELECT status, COUNT(*)::int as count 
      FROM whatsapp_messages 
      WHERE direction = 'outbound'
      GROUP BY status
    `);

    // Query 3: Retry queue status counts
    const retryCounts = await query(`
      SELECT status, COUNT(*)::int as count 
      FROM whatsapp_message_retries 
      GROUP BY status
    `);

    // Query 4: Messaging history by day (last 7 days)
    const dailyVolume = await query(`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM-DD') as date,
        COUNT(CASE WHEN direction = 'inbound' THEN 1 END)::int as inbound,
        COUNT(CASE WHEN direction = 'outbound' THEN 1 END)::int as outbound
      FROM whatsapp_messages
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
      ORDER BY date ASC
    `);

    return apiResponse.success({
      direction: directionCounts.rows,
      status: statusCounts.rows,
      retries: retryCounts.rows,
      dailyVolume: dailyVolume.rows});
  } catch (error: any) {
    console.error("WhatsApp Analytics API Error:", error);
    return apiResponse.error(error.message || "Failed to fetch analytics");
  }
}
