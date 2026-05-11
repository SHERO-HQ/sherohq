import { getAdminFromSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";
import { processDueNewsletterCampaign } from "@/lib/newsletter-campaigns";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const result = await processDueNewsletterCampaign();

    await logActivity(
      admin.id,
      "newsletter_campaign_process_scheduled",
      "info",
      result.message,
    );

    return apiResponse.success(result);
  } catch (error) {
    console.error("Newsletter process scheduled error:", error);
    return apiResponse.error("Failed to process scheduled campaigns");
  }
}
