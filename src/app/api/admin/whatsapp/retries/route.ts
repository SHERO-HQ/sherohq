import { NextRequest } from "next/server";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { whatsappMessageRetries } from "@/lib/drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";
import { retryMessageImmediately, processPendingRetries } from "@/lib/whatsapp-retry";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return apiResponse.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let condition = undefined;
    if (status) {
      condition = eq(whatsappMessageRetries.status, status);
    }

    const retries = await db.query.whatsappMessageRetries.findMany({
      where: condition,
      orderBy: [desc(whatsappMessageRetries.createdAt)],
      limit: 100
    });

    return apiResponse.success({ retries });
  } catch (error: any) {
    console.error("Error in WhatsApp retries GET API:", error);
    return apiResponse.error(error.message || "Internal server error");
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return apiResponse.unauthorized();
    }

    const body = await request.json();
    const { action, messageId } = body;

    if (action === "retry") {
      if (!messageId) {
        return apiResponse.error("Missing messageId parameter", 400);
      }
      const result = await retryMessageImmediately(messageId);
      if (result.success) {
        return apiResponse.success({ message: "Message retried successfully" });
      } else {
        return apiResponse.error(result.error || "Manual retry failed", 500);
      }
    }

    if (action === "cancel") {
      if (!messageId) {
        return apiResponse.error("Missing messageId parameter", 400);
      }
      await db.update(whatsappMessageRetries)
        .set({ status: 'cancelled', updatedAt: sql`NOW()` })
        .where(eq(whatsappMessageRetries.messageId, messageId));
      return apiResponse.success({ message: "Message retry cancelled successfully" });
    }

    if (action === "retry_all") {
      const result = await processPendingRetries();
      return apiResponse.success({
        message: "Triggered pending retries",
        ...result,
      });
    }

    return apiResponse.error("Invalid action", 400);
  } catch (error: any) {
    console.error("Error in WhatsApp retries POST API:", error);
    return apiResponse.error(error.message || "Internal server error");
  }
}
