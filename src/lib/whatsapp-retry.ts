/**
 * Message retry mechanism for failed WhatsApp deliveries
 * Automatically retries failed messages with exponential backoff
 */

import { db } from "./db";
import { sql } from "drizzle-orm";

export interface RetryConfig {
  maxRetries: number; // Maximum number of retry attempts
  initialDelayMs: number; // Initial delay before first retry (ms)
  backoffMultiplier: number; // Exponential backoff multiplier
  maxDelayMs: number; // Max delay between retries
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 5 * 60 * 1000, // 5 minutes
  backoffMultiplier: 2,
  maxDelayMs: 60 * 60 * 1000, // 1 hour
};

/**
 * Schedule a failed message for retry
 */
export async function scheduleMessageForRetry(
  messageId: string,
  campaignId: string,
  recipientPhone: string,
  messageContent: string,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
): Promise<void> {
  // Create retry record with attempt tracking
  try {
    const existingResult = await db.execute(sql`
      SELECT retry_count, max_retries FROM whatsapp_message_retries WHERE message_id = ${messageId};
    `);

    const existing = existingResult.rows[0];

    if (existing && (existing.retry_count as any) >= (existing.max_retries as any)) {
      console.log(
        `Message ${messageId} already at max retries (${existing.retry_count}/${existing.max_retries})`,
      );
      return;
    }

    if (existing) {
      // Update existing retry record
      await db.execute(sql`
        UPDATE whatsapp_message_retries
        SET
          retry_count = retry_count + 1,
          next_retry_at = NOW() + INTERVAL '1 minute',
          status = 'pending',
          updated_at = NOW()
        WHERE message_id = ${messageId};
      `);
    } else {
      // Insert new retry record
      await db.execute(sql`
        INSERT INTO whatsapp_message_retries (
          message_id,
          campaign_id,
          recipient_phone,
          content,
          retry_count,
          max_retries,
          status,
          next_retry_at,
          created_at,
          updated_at
        ) VALUES (
          ${messageId}, ${campaignId}, ${recipientPhone}, ${messageContent}, 0, ${config.maxRetries}, 'pending', NOW() + INTERVAL '1 minute', NOW(), NOW()
        );
      `);
    }

    console.log(`Scheduled message ${messageId} for retry`);
  } catch (error) {
    console.error(`Error scheduling retry for message ${messageId}:`, error);
    throw error;
  }
}

/**
 * Process pending retries (call from cron job)
 */
export async function processPendingRetries(
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
): Promise<{
  processed: number;
  successful: number;
  failed: number;
}> {
  // Get messages due for retry
  const result = await db.execute(sql`
    SELECT
      message_id,
      campaign_id,
      recipient_phone,
      content,
      retry_count,
      max_retries
    FROM whatsapp_message_retries
    WHERE next_retry_at <= NOW()
      AND retry_count < max_retries
      AND status = 'pending'
    ORDER BY next_retry_at ASC
    LIMIT 100;
  `);

  const retries = result.rows as any[];

  let successful = 0;
  let failed = 0;

  for (const retry of retries) {
    try {
      console.log(
        `Retrying message ${retry.message_id} (attempt ${retry.retry_count + 1}/${retry.max_retries})`,
      );

      // Attempt to resend message via WhatsApp API
      const { WHATSAPP_ACCESS_TOKEN } = process.env;
      if (!WHATSAPP_ACCESS_TOKEN) {
        console.error("WhatsApp token not configured for retry");
        failed++;
        continue;
      }

      const apiResponse = await fetch(
        `https://graph.facebook.com/v21.0/${retry.phone_number_id || process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: retry.recipient_phone,
            type: "text",
            text: {
              preview_url: false,
              body: retry.content || "Message retry",
            },
          }),
        },
      );

      const data = (await apiResponse.json()) as any;

      if (apiResponse.ok && data.messages?.[0]?.id) {
        // Mark retry as successful
        await db.execute(sql`
          UPDATE whatsapp_message_retries
          SET status = 'completed', updated_at = NOW()
          WHERE message_id = ${retry.message_id};
        `);

        successful++;
      } else {
        // Calculate next retry time with exponential backoff
        const nextRetryDelay = Math.min(
          config.initialDelayMs *
            Math.pow(config.backoffMultiplier, (retry.retry_count as any)),
          config.maxDelayMs,
        );

        const nextRetryAt = new Date(Date.now() + nextRetryDelay);

        // Update retry record
        await db.execute(sql`
          UPDATE whatsapp_message_retries
          SET
            retry_count = retry_count + 1,
            next_retry_at = ${nextRetryAt},
            last_error = ${data.error?.message || "API error"},
            updated_at = NOW()
          WHERE message_id = ${retry.message_id};
        `);

        failed++;
      }
    } catch (error) {
      console.error(`Error retrying message ${retry.message_id}:`, error);
      failed++;
    }
  }

  return {
    processed: retries.length,
    successful,
    failed,
  };
}

/**
 * Get retry status for a campaign
 */
export async function getCampaignRetryStats(
  campaignId: string,
): Promise<{ pending: number; completed: number; failed: number }> {
  const result = await db.execute(sql`
    SELECT
      status,
      COUNT(*) as count
    FROM whatsapp_message_retries
    WHERE campaign_id = ${campaignId}
    GROUP BY status;
  `);

  const stats = { pending: 0, completed: 0, failed: 0 };
  for (const row of result.rows) {
    stats[row.status as keyof typeof stats] = parseInt(row.count as any) || 0;
  }

  return stats;
}

/**
 * Cancel all retries for a campaign
 */
export async function cancelCampaignRetries(
  campaignId: string,
): Promise<number> {
  const result = await db.execute(sql`
    UPDATE whatsapp_message_retries
    SET status = 'cancelled', updated_at = NOW()
    WHERE campaign_id = ${campaignId} AND status = 'pending'
    RETURNING id;
  `);

  console.log(
    `Cancelled ${result.rowCount} retries for campaign ${campaignId}`,
  );
  return result.rowCount || 0;
}

/**
 * Retry a specific failed message immediately
 */
export async function retryMessageImmediately(
  messageId: string,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await db.execute(sql`
      SELECT
        message_id,
        campaign_id,
        recipient_phone,
        content,
        retry_count,
        max_retries
      FROM whatsapp_message_retries
      WHERE message_id = ${messageId};
    `);

    const retry = result.rows[0];
    if (!retry) {
      return { success: false, error: "Retry record not found" };
    }

    const { WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID } = process.env;
    if (!WHATSAPP_ACCESS_TOKEN) {
      return { success: false, error: "WhatsApp token not configured" };
    }

    const apiResponse = await fetch(
      `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: retry.recipient_phone,
          type: "text",
          text: {
            preview_url: false,
            body: retry.content || "Message retry",
          },
        }),
      }
    );

    const data = (await apiResponse.json()) as any;

    if (apiResponse.ok && data.messages?.[0]?.id) {
      // Mark retry as completed
      await db.execute(sql`
        UPDATE whatsapp_message_retries
        SET status = 'completed', updated_at = NOW()
        WHERE message_id = ${messageId};
      `);
      
      // Update original message status
      await db.execute(sql`
        UPDATE whatsapp_messages
        SET status = 'sent', error_code = null, error_message = null, updated_at = NOW()
        WHERE id = ${messageId};
      `);

      return { success: true };
    } else {
      const errorMsg = data.error?.message || "Meta API error";
      const nextRetryDelay = Math.min(
        config.initialDelayMs * Math.pow(config.backoffMultiplier, retry.retry_count as number),
        config.maxDelayMs
      );
      const nextRetryAt = new Date(Date.now() + nextRetryDelay);

      await db.execute(sql`
        UPDATE whatsapp_message_retries
        SET
          retry_count = retry_count + 1,
          next_retry_at = ${nextRetryAt},
          last_error = ${errorMsg},
          updated_at = NOW()
        WHERE message_id = ${messageId};
      `);

      return { success: false, error: errorMsg };
    }
  } catch (error: any) {
    console.error(`Error retrying message ${messageId} immediately:`, error);
    return { success: false, error: error.message || String(error) };
  }
}
