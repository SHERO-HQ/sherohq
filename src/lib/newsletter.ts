import { processDueNewsletterCampaign } from "./newsletter-campaigns";

export async function processNewsletterCron() {
  if (process.env.NODE_ENV !== "production") {
    console.log("[Newsletter Cron] Checking for due campaigns...");
  }
  return processDueNewsletterCampaign();
}
