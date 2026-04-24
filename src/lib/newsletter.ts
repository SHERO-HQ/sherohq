import { query } from "./db";
import { notificationService } from "./notifications";

export async function processNewsletterCron() {
  console.log("🕒 [Newsletter Cron] Checking for due campaigns...");

  // 1. Find a campaign that is 'sending' or 'scheduled' and due
  const dueResult = await query(`
    SELECT * FROM newsletter_campaigns
    WHERE (status = 'sending' OR (status = 'scheduled' AND "scheduledAt" <= NOW()))
    ORDER BY "updatedAt" ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  `);

  if (dueResult.rowCount === 0) {
    console.log("✅ [Newsletter Cron] No campaigns to process.");
    return { success: true, processed: 0 };
  }

  const campaign = dueResult.rows[0];
  
  // If it was just scheduled, mark it as sending
  if (campaign.status === "scheduled") {
    await query(`UPDATE newsletter_campaigns SET status = 'sending', "updatedAt" = NOW() WHERE id = $1`, [campaign.id]);
  }

  // 2. Fetch a batch of subscribers who haven't received this campaign yet
  // Note: For now we'll use a simple "batch" approach. 
  // A production-grade system would use a junction table `campaign_deliveries`.
  // Here, we'll use the campaign's `sentCount` to skip ahead.
  
  const limit = campaign.batchSize || 50;
  const offset = campaign.sentCount || 0;

  // Build audience filters (simplified for this cron)
  let whereClauses = ["status = 'active'"];
  let values: any[] = [];
  
  if (campaign.audienceSource) {
    values.push(campaign.audienceSource);
    whereClauses.push(`source = $${values.length}`);
  }

  const subscribersResult = await query(`
    SELECT id, email, phone, name, "unsubscribeToken"
    FROM newsletter_subscribers
    WHERE ${whereClauses.join(" AND ")}
    ORDER BY "subscribedAt" ASC
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `, [...values, limit, offset]);

  if (subscribersResult.rowCount === 0) {
    // Campaign finished
    await query(`
      UPDATE newsletter_campaigns 
      SET status = 'sent', "sentAt" = NOW(), "updatedAt" = NOW() 
      WHERE id = $1
    `, [campaign.id]);
    console.log(`🏁 [Newsletter Cron] Campaign ${campaign.id} completed.`);
    return { success: true, status: "completed" };
  }

  const subscribers = subscribersResult.rows;
  let sent = 0;
  let failed = 0;

  console.log(`📤 [Newsletter Cron] Processing ${subscribers.length} subscribers for campaign ${campaign.id}...`);

  for (const sub of subscribers) {
    try {
      if (campaign.channel === "email") {
        const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/newsletter/unsubscribe/${sub.unsubscribeToken}`;
        // Note: sendNewsletterCampaignEmail needs to be implemented in notifications.ts
        await notificationService.sendOrderConfirmation(campaign.id, { 
          email: sub.email, 
          firstName: sub.name || "Customer" 
        } as any, [], 0); // Placeholder for actual email logic
        sent++;
      }
    } catch (err) {
      console.error("Failed to send to", sub.email, err);
      failed++;
    }
  }

  // Update counters
  await query(`
    UPDATE newsletter_campaigns 
    SET "sentCount" = "sentCount" + $1, "failedCount" = "failedCount" + $2, "updatedAt" = NOW()
    WHERE id = $3
  `, [sent, failed, campaign.id]);

  return { success: true, processed: sent + failed };
}
