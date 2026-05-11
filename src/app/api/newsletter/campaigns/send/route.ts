import { NextRequest } from "next/server";
import { getAdminFromSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";
import {
  NewsletterCampaignValidationError,
  normalizeNewsletterCampaignInput,
  sendNewsletterCampaign,
} from "@/lib/newsletter-campaigns";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const body = await request.json();
    const input = normalizeNewsletterCampaignInput(body);
    const result = await sendNewsletterCampaign(input);

    await logActivity(
      admin.id,
      "newsletter_campaign_send",
      "success",
      `${input.channel} campaign: ${input.subject}`,
    );

    return apiResponse.success(result);
  } catch (error) {
    if (error instanceof NewsletterCampaignValidationError) {
      return apiResponse.error(error.message, error.status);
    }

    console.error("Newsletter campaign send error:", error);
    return apiResponse.error("Failed to send newsletter campaign");
  }
}
