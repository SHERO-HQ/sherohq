import { processDueNewsletterCampaign } from "./newsletter-campaigns";

export async function processNewsletterCron() {
  console.log("[Newsletter Cron] Checking for due campaigns...");
  return processDueNewsletterCampaign();
}
