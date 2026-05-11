import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const requestedLimit = Number.parseInt(
      request.nextUrl.searchParams.get("limit") || "25",
      10,
    );
    const limit =
      Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 100)
        : 25;

    const result = await query(
      `SELECT *,
              COALESCE(channel, 'email') AS channel,
              COALESCE("audienceStatus", 'active') AS "audienceStatus",
              COALESCE("batchSize", 100) AS "batchSize",
              COALESCE("sendDelayMs", 0) AS "sendDelayMs",
              COALESCE("isTest", false) AS "isTest",
              COALESCE("totalTargets", 0) AS "totalTargets",
              COALESCE("sentCount", 0) AS "sentCount",
              COALESCE("failedCount", 0) AS "failedCount"
       FROM newsletter_campaigns
       ORDER BY "createdAt" DESC
       LIMIT $1`,
      [limit],
    );
    return apiResponse.success({ campaigns: result.rows });
  } catch (error) {
    console.error("Fetch campaigns error:", error);
    return apiResponse.error("Failed to fetch campaigns");
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const { subject, content, scheduledAt } = await request.json();
    if (!subject || !content)
      return apiResponse.error("Subject and content required", 400);

    const id = uuidv4();
    await query(
      `INSERT INTO newsletter_campaigns (id, subject, content, status, "scheduledAt", "createdAt")
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        id,
        subject,
        content,
        scheduledAt ? "scheduled" : "draft",
        scheduledAt || null,
      ],
    );

    await logActivity(
      admin.id,
      "newsletter_campaign_create",
      "success",
      `Created campaign: ${subject}`,
    );

    return apiResponse.success(
      { id, subject, status: scheduledAt ? "scheduled" : "draft" },
      201,
    );
  } catch (error) {
    console.error("Create campaign error:", error);
    return apiResponse.error("Failed to create campaign");
  }
}
