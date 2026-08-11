import { NextRequest } from "next/server";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { whatsappMessages, whatsappMessageRetries } from "@/lib/drizzle/schema";
import { sql, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return apiResponse.unauthorized();
    }

    // Query 1: Message count by direction
    const directionCounts = await db
      .select({
        direction: whatsappMessages.direction,
        count: sql<number>`COUNT(*)::int`.as('count'),
      })
      .from(whatsappMessages)
      .groupBy(whatsappMessages.direction);

    // Query 2: Outbound message count by status
    const statusCounts = await db
      .select({
        status: whatsappMessages.status,
        count: sql<number>`COUNT(*)::int`.as('count'),
      })
      .from(whatsappMessages)
      .where(eq(whatsappMessages.direction, 'outbound'))
      .groupBy(whatsappMessages.status);

    // Query 3: Retry queue status counts
    const retryCounts = await db
      .select({
        status: whatsappMessageRetries.status,
        count: sql<number>`COUNT(*)::int`.as('count'),
      })
      .from(whatsappMessageRetries)
      .groupBy(whatsappMessageRetries.status);

    // Query 4: Messaging history by day (last 7 days)
    const dailyVolume = await db
      .select({
        date: sql<string>`TO_CHAR(${whatsappMessages.createdAt}, 'YYYY-MM-DD')`.as('date'),
        inbound: sql<number>`COUNT(CASE WHEN ${whatsappMessages.direction} = 'inbound' THEN 1 END)::int`.as('inbound'),
        outbound: sql<number>`COUNT(CASE WHEN ${whatsappMessages.direction} = 'outbound' THEN 1 END)::int`.as('outbound'),
      })
      .from(whatsappMessages)
      .where(sql`${whatsappMessages.createdAt} >= NOW() - INTERVAL '7 days'`)
      .groupBy(sql`TO_CHAR(${whatsappMessages.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`date ASC`);

    return apiResponse.success({
      direction: directionCounts,
      status: statusCounts,
      retries: retryCounts,
      dailyVolume: dailyVolume
    });
  } catch (error: any) {
    console.error("WhatsApp Analytics API Error:", error);
    return apiResponse.error(error.message || "Failed to fetch analytics");
  }
}
