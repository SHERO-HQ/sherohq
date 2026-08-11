import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { CampaignStatus, NewsletterCampaignInput, NewsletterCampaignRow, NewsletterRecipient } from "./types";

export function audienceWhere(input: NewsletterCampaignInput) {
  const clauses: any[] = [];

  const isWhatsApp = input.channel === "whatsapp";
  const dateColumn = isWhatsApp ? '"created_at"' : '"subscribedAt"';

  if (input.audienceStatus !== "all") {
    clauses.push(sql`status = ${input.audienceStatus}`);
  }

  if (input.audienceSource && !isWhatsApp) {
    clauses.push(sql`source = ${input.audienceSource}`);
  }

  if (input.audienceSubscribedAfter) {
    clauses.push(sql`${sql.raw(dateColumn)} >= ${input.audienceSubscribedAfter.toISOString()}`);
  }

  if (input.audienceSubscribedBefore) {
    clauses.push(sql`${sql.raw(dateColumn)} <= ${input.audienceSubscribedBefore.toISOString()}`);
  }

  if (input.channel === "email") {
    clauses.push(sql`email IS NOT NULL AND email <> ''`);
  } else {
    clauses.push(sql`phone IS NOT NULL AND phone <> ''`);
  }

  return {
    whereSql: clauses.length > 0 ? sql`WHERE ${sql.join(clauses, sql` AND `)}` : sql``,
    tableName: isWhatsApp ? "whatsapp_contacts" : "newsletter_subscribers",
    isWhatsApp
  };
}

export async function countAudience(input: NewsletterCampaignInput): Promise<number> {
  const { whereSql, tableName } = audienceWhere(input);
  const result = await db.execute(sql`SELECT COUNT(*)::int AS count FROM ${sql.raw(tableName)} ${whereSql}`);
  const count = Number(result.rows[0]?.count || 0);
  return input.recipientLimit ? Math.min(count, input.recipientLimit) : count;
}

export async function fetchAudience(
  input: NewsletterCampaignInput,
  options: { limit?: number | null; offset?: number } = {},
): Promise<NewsletterRecipient[]> {
  const { whereSql, tableName, isWhatsApp } = audienceWhere(input);
  const limit = options.limit ?? input.recipientLimit;
  const offset = options.offset || 0;
  
  const limitSql = limit ? sql`LIMIT ${limit}` : sql``;
  const offsetSql = offset > 0 ? sql`OFFSET ${offset}` : sql``;

  const selectCols = isWhatsApp
    ? sql.raw(`phone as id, NULL as email, phone, name, NULL as "unsubscribeToken"`)
    : sql.raw(`id, email, phone, name, "unsubscribeToken"`);
  const orderCol = isWhatsApp ? sql.raw(`"created_at"`) : sql.raw(`"subscribedAt"`);

  const result = await db.execute(sql`
    SELECT ${selectCols}
    FROM ${sql.raw(tableName)}
    ${whereSql}
    ORDER BY ${orderCol} ASC
    ${limitSql}
    ${offsetSql}
  `);

  return result.rows as any as NewsletterRecipient[];
}

export async function markSubscribersContacted(recipientIds: string[]): Promise<void> {
  if (recipientIds.length === 0) return;

  await db.execute(sql`
    UPDATE newsletter_subscribers
    SET "lastCampaignAt" = NOW(), "updatedAt" = NOW()
    WHERE id = ANY(${recipientIds})
  `);
}

export async function updateCampaignCounts(
  campaignId: string,
  sent: number,
  failed: number,
): Promise<void> {
  await db.execute(sql`
    UPDATE newsletter_campaigns
    SET "sentCount" = COALESCE("sentCount", 0) + ${sent},
        "failedCount" = COALESCE("failedCount", 0) + ${failed},
        "updatedAt" = NOW()
    WHERE id = ${campaignId}
  `);
}

export async function getCampaignCounts(campaignId: string): Promise<{ sent: number; failed: number }> {
  const totals = await db.execute(sql`
    SELECT COALESCE("sentCount", 0)::int AS sent,
           COALESCE("failedCount", 0)::int AS failed
    FROM newsletter_campaigns
    WHERE id = ${campaignId}
  `);

  return {
    sent: Number(totals.rows[0]?.sent || 0),
    failed: Number(totals.rows[0]?.failed || 0),
  };
}

export async function insertCampaign(
  input: NewsletterCampaignInput,
  status: CampaignStatus,
  totalTargets: number,
): Promise<string> {
  const id = uuidv4();

  await db.execute(sql`
    INSERT INTO newsletter_campaigns (
       id, channel, subject, content, status, "whatsappTemplateName", "whatsappTemplateLanguage", "whatsappTemplateParams", "audienceStatus", "audienceSource", "audienceSubscribedAfter", "audienceSubscribedBefore", "recipientLimit", "batchSize", "sendDelayMs", "isTest", "testEmail", "testPhone", "totalTargets", "sentCount", "failedCount", "scheduledAt", "createdAt", "updatedAt"
     )
     VALUES (
       ${id}, ${input.channel}, ${input.subject}, ${input.content}, ${status}, ${input.whatsappTemplateName}, ${input.whatsappTemplateLanguage}, ${JSON.stringify(input.whatsappTemplateParams)}, ${input.audienceStatus}, ${input.audienceSource}, ${input.audienceSubscribedAfter?.toISOString() || null}, ${input.audienceSubscribedBefore?.toISOString() || null}, ${input.recipientLimit}, ${input.batchSize}, ${input.sendDelayMs}, false, ${input.testEmail}, ${input.testPhone}, ${totalTargets}, 0, 0, ${input.scheduleAt?.toISOString() || null}, NOW(), NOW()
     )
  `);

  return id;
}

export async function finalizeCampaign(campaignId: string): Promise<void> {
  await db.execute(sql`
    UPDATE newsletter_campaigns
    SET status = CASE
          WHEN COALESCE("sentCount", 0) = 0 AND COALESCE("failedCount", 0) > 0
            THEN 'failed'
          ELSE 'sent'
        END,
        "sentAt" = NOW(),
        "updatedAt" = NOW()
    WHERE id = ${campaignId}
  `);
}

export async function fetchDueCampaign(): Promise<NewsletterCampaignRow | null> {
  const dueResult = await db.execute(sql`
    WITH due AS (
      SELECT id
      FROM newsletter_campaigns
      WHERE (status = 'scheduled' AND "scheduledAt" <= NOW())
         OR (
           status = 'sending'
           AND (
             "updatedAt" IS NULL
             OR "updatedAt" <= NOW() - INTERVAL '30 seconds'
           )
         )
      ORDER BY "updatedAt" ASC NULLS FIRST
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    )
    UPDATE newsletter_campaigns c
    SET status = 'sending', "updatedAt" = NOW()
    FROM due
    WHERE c.id = due.id
    RETURNING c.*
  `);

  if (dueResult.rowCount === 0) return null;
  return dueResult.rows[0] as any as NewsletterCampaignRow;
}

export async function setCampaignDeliveryStats(
  campaignId: string,
  stats: {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  },
): Promise<void> {
  const totalSuccessful = stats.sent + stats.delivered + stats.read;

  await db.execute(sql`
    UPDATE newsletter_campaigns
    SET "sentCount" = ${totalSuccessful},
        "failedCount" = ${stats.failed},
        "updatedAt" = NOW()
    WHERE id = ${campaignId}
  `);
}
