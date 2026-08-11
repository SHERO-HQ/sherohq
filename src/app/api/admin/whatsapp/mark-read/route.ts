import { apiResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { whatsappMessages } from "@/lib/drizzle/schema";
import { sql, and, eq } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return apiResponse.unauthorized();
    }

    const { phone } = await request.json();

    if (!phone) {
      return apiResponse.error("Phone number required", 400);
    }

    // Mark all received inbound messages from this phone as 'read'
    await db.update(whatsappMessages)
      .set({ status: 'read', updatedAt: sql`NOW()` })
      .where(
        and(
          eq(whatsappMessages.senderWaId, phone),
          eq(whatsappMessages.direction, 'inbound'),
          eq(whatsappMessages.status, 'received')
        )
      );

    return apiResponse.success({ success: true });
  } catch (error: any) {
    console.error("Error marking messages as read:", error);
    return apiResponse.error("Failed to mark messages as read", 500, error.message || String(error));
  }
}
