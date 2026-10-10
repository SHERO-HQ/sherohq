import { apiResponse, validateCronAuth } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { processNewsletterCron } from "@/lib/newsletter";
import { NEWSLETTER_ENABLED } from "@/constants/features";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const cronError = validateCronAuth(request);
  if (cronError) return cronError;

  if (!NEWSLETTER_ENABLED) return apiResponse.success({ skipped: "newsletter is off" });

  try {
    const result = await processNewsletterCron();
    return apiResponse.success(result);
  } catch (error) {
    console.error("Cron handler error:", error);
    return apiResponse.error("Internal server error", 500);
  }
}
