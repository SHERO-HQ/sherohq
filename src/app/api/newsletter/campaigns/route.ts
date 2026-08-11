import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { newsletterCampaigns } from "@/lib/drizzle/schema";
import { desc } from "drizzle-orm";
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

    const result = await db
      .select()
      .from(newsletterCampaigns)
      .orderBy(desc(newsletterCampaigns.createdAt))
      .limit(limit);
      
    const campaigns = result.map(c => ({
      ...c,
      channel: c.channel || 'email',
      audienceStatus: c.audienceStatus || 'active',
      batchSize: c.batchSize ?? 100,
      sendDelayMs: c.sendDelayMs ?? 0,
      isTest: c.isTest ?? false,
      totalTargets: c.totalTargets ?? 0,
      sentCount: c.sentCount ?? 0,
      failedCount: c.failedCount ?? 0
    }));

    return apiResponse.success({ campaigns });
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
    await db.insert(newsletterCampaigns).values({
      id,
      subject,
      content,
      status: scheduledAt ? "scheduled" : "draft",
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
    });

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
