import { NextRequest } from "next/server";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import { query } from "@/lib/db";
import { retryMessageImmediately, processPendingRetries } from "@/lib/whatsapp-retry";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return apiResponse.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let sql = "SELECT * FROM whatsapp_message_retries";
    const params: string[] = [];

    if (status) {
      sql += " WHERE status = $1";
      params.push(status);
    }

    sql += " ORDER BY created_at DESC LIMIT 100";

    const result = await query(sql, params);

    return apiResponse.success({
      retries: result.rows,
    });
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
      await query(
        `UPDATE whatsapp_message_retries SET status = 'cancelled', updated_at = NOW() WHERE message_id = $1`,
        [messageId]
      );
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
