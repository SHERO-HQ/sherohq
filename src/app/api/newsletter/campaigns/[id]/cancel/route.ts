import { NextRequest } from "next/server";
import { getAdminFromSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { newsletterCampaigns } from "@/lib/drizzle/schema";
import { eq, sql, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const { id } = await params;
    const rows = await db.update(newsletterCampaigns)
      .set({ status: 'failed', updatedAt: sql`NOW()` })
      .where(and(eq(newsletterCampaigns.id, id), eq(newsletterCampaigns.status, 'scheduled')))
      .returning({ subject: newsletterCampaigns.subject });
    if (rows.length === 0) {
      return apiResponse.notFound("Scheduled campaign not found");
    }

    await logActivity(
      admin.id,
      "newsletter_campaign_cancel",
      "warning",
      `Cancelled campaign: ${rows[0].subject}`,
    );

    return apiResponse.success({ message: "Campaign cancelled successfully" });
  } catch (error) {
    console.error("Newsletter campaign cancel error:", error);
    return apiResponse.error("Failed to cancel campaign");
  }
}
