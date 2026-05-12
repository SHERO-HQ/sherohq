import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { getAdminFromSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";
import {
  NewsletterCampaignDeliveryError,
  NewsletterCampaignValidationError,
  normalizeNewsletterCampaignInput,
  sendNewsletterCampaign,
} from "@/lib/newsletter-campaigns";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || randomUUID();

  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const body = await request.json();
    const input = normalizeNewsletterCampaignInput(body);
    const result = await sendNewsletterCampaign(input, { requestId });

    await logActivity(
      admin.id,
      "newsletter_campaign_send",
      "success",
      `${input.channel} campaign: ${input.subject} [${requestId}]`,
    );

    return apiResponse.success(result);
  } catch (error) {
    if (
      error instanceof NewsletterCampaignValidationError ||
      error instanceof NewsletterCampaignDeliveryError
    ) {
      return apiResponse.error(error.message, error.status);
    }

    console.error("Newsletter campaign send error:", { requestId, error });
    return apiResponse.error("Failed to send newsletter campaign");
  }
}
