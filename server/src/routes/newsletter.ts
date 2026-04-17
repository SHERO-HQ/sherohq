import express, { Request, Response } from "express";
import { randomBytes } from "node:crypto";
import { v4 as uuidv4 } from "uuid";
import db from "../db/database";
import {
  adminAuth,
  requireRole,
  type AdminRequest,
} from "../middleware/adminAuth";
import { validateBody } from "../middleware/validate";
import {
  NewsletterSubscribeSchema,
  NewsletterCampaignSchema,
  UpdateNewsletterSubscriberStatusSchema,
  UpdateNewsletterSubscriberContactSchema,
} from "../schemas";
import { notificationService } from "../services/NotificationService";

const router = express.Router();

type NewsletterSubscriberRow = {
  id: string;
  email: string;
  phone: string | null;
  name: string | null;
  source: string | null;
  status: "active" | "unsubscribed";
  unsubscribeToken: string;
  subscribedAt: string;
  unsubscribedAt: string | null;
  lastCampaignAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type NewsletterCampaignStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "sent"
  | "failed";

type NewsletterCampaignRow = {
  id: string;
  channel: "email" | "sms" | "whatsapp";
  subject: string;
  content: string;
  whatsappTemplateName: string | null;
  whatsappTemplateLanguage: string | null;
  whatsappTemplateParams: string[] | null;
  status: NewsletterCampaignStatus;
  audienceStatus: "active" | "unsubscribed" | "all";
  audienceSource: string | null;
  audienceSubscribedAfter: string | null;
  audienceSubscribedBefore: string | null;
  recipientLimit: number | null;
  batchSize: number;
  sendDelayMs: number;
  isTest: boolean;
  testEmail: string | null;
  testPhone: string | null;
  totalTargets: number;
  sentCount: number;
  failedCount: number;
  scheduledAt: string | null;
  sentAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

type CampaignAudienceFilters = {
  status: "active" | "unsubscribed" | "all";
  source?: string;
  subscribedAfter?: string;
  subscribedBefore?: string;
};

function getBaseUrl(req?: Request): string {
  const envBase = process.env.FRONTEND_URL?.replace(/\/$/, "");
  if (envBase) return envBase;

  if (!req) return "https://sherohq.com";

  const protocol = req.protocol || "https";
  const host = req.get("host") || "sherohq.com";
  return `${protocol}://${host}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildWhatsAppMessage(subject: string, content: string): string {
  return `${subject}\n\n${content}`.trim();
}

function normalizePhone(phone: string): string {
  const compact = phone.replace(/[\s()-]/g, "").trim();
  if (compact.startsWith("00")) {
    return `+${compact.slice(2)}`;
  }
  return compact;
}

function buildAudienceQuery(
  filters: CampaignAudienceFilters,
  channel: "email" | "sms" | "whatsapp",
): {
  whereSql: string;
  values: Array<string>;
} {
  const values: string[] = [];
  const whereClauses: string[] = [];

  if (filters.status === "active" || filters.status === "unsubscribed") {
    values.push(filters.status);
    whereClauses.push(`status = $${values.length}`);
  }

  if (filters.source) {
    values.push(filters.source);
    whereClauses.push(`source = $${values.length}`);
  }

  if (filters.subscribedAfter) {
    values.push(filters.subscribedAfter);
    whereClauses.push(`"subscribedAt" >= $${values.length}::timestamp`);
  }

  if (filters.subscribedBefore) {
    values.push(filters.subscribedBefore);
    whereClauses.push(`"subscribedAt" <= $${values.length}::timestamp`);
  }

  if (channel === "whatsapp") {
    whereClauses.push(`phone IS NOT NULL AND phone <> ''`);
  }

  return {
    whereSql: whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "",
    values,
  };
}

// Refactored for memory efficiency using streaming/batching
async function sendCampaignToAudience(params: {
  campaignId: string;
  channel: "email" | "sms" | "whatsapp";
  subject: string;
  content: string;
  whatsappTemplateName?: string;
  whatsappTemplateLanguage?: string;
  whatsappTemplateParams?: string[];
  batchSize: number;
  sendDelayMs: number;
  limit?: number;
  audience: CampaignAudienceFilters;
  baseUrl: string;
}): Promise<{ sent: number; failed: number; totalTargets: number }> {
  const { whereSql, values } = buildAudienceQuery(
    params.audience,
    params.channel,
  );

  // 1. Get total target count first for accurate UI reporting
  const countResult = await db.query(
    `SELECT COUNT(*)::int as total FROM newsletter_subscribers ${whereSql}`,
    values,
  );
  let totalTargets = countResult.rows[0].total;

  if (params.limit && totalTargets > params.limit) {
    totalTargets = params.limit;
  }

  if (totalTargets === 0) {
    await db.query(
      `UPDATE newsletter_campaigns SET status = 'failed', "totalTargets" = 0, "sentCount" = 0, "failedCount" = 0, "sentAt" = NOW(), "updatedAt" = NOW() WHERE id = $1`,
      [params.campaignId],
    );
    return { sent: 0, failed: 0, totalTargets: 0 };
  }

  // Update total targets in DB early so Admin can see it
  await db.query(
    `UPDATE newsletter_campaigns SET "totalTargets" = $1, "updatedAt" = NOW() WHERE id = $2`,
    [totalTargets, params.campaignId],
  );

  let sent = 0;
  let failed = 0;
  let lastId = "";
  let processedTotal = 0;
  const CHUNK_SIZE = 500;

  // 2. Stream audience in chunks using Seek Pagination (id > $lastId)
  while (processedTotal < totalTargets) {
    const remainingToProcess = totalTargets - processedTotal;
    const currentChunkSize = Math.min(CHUNK_SIZE, remainingToProcess);

    const chunkValues = [...values, lastId, currentChunkSize.toString()];
    const seekClause = whereSql
      ? `${whereSql} AND id > $${values.length + 1}`
      : `WHERE id > $${values.length + 1}`;

    const subscribersResult = await db.query(
      `
        SELECT id, email, phone, "unsubscribeToken"
        FROM newsletter_subscribers
        ${seekClause}
        ORDER BY id ASC
        LIMIT $${values.length + 2}
      `,
      chunkValues,
    );

    const chunkSubscribers = subscribersResult.rows as Array<
      Pick<NewsletterSubscriberRow, "id" | "email" | "phone" | "unsubscribeToken">
    >;

    if (chunkSubscribers.length === 0) break;

    // 3. Process the current chunk in batches (batchSize)
    for (let i = 0; i < chunkSubscribers.length; i += params.batchSize) {
      const batch = chunkSubscribers.slice(i, i + params.batchSize);
      const deliveredIds: string[] = [];

      const batchResults = await Promise.allSettled(
        batch.map(async (subscriber) => {
          if (params.channel === "email") {
            const unsubscribeUrl = `${params.baseUrl}/api/newsletter/unsubscribe/${subscriber.unsubscribeToken}`;
            const delivered =
              await notificationService.sendNewsletterCampaignEmail(
                subscriber.email,
                params.subject,
                params.content,
                unsubscribeUrl,
              );
            return { id: subscriber.id, delivered };
          }

          if (params.channel === "whatsapp" && subscriber.phone) {
            const useTemplate = Boolean(params.whatsappTemplateName);
            const delivered =
              await notificationService.sendNewsletterCampaignWhatsApp(
                subscriber.phone,
                useTemplate
                  ? {
                      mode: "template",
                      templateName: params.whatsappTemplateName,
                      languageCode: params.whatsappTemplateLanguage || "en",
                      templateParams: params.whatsappTemplateParams || [],
                    }
                  : {
                      mode: "text",
                      content: buildWhatsAppMessage(
                        params.subject,
                        params.content,
                      ),
                    },
              );
            return { id: subscriber.id, delivered };
          }

          if (params.channel === "sms" && subscriber.phone) {
            const delivered = await notificationService.sendNewsletterCampaignSMS(
              subscriber.phone,
              params.content,
            );
            return { id: subscriber.id, delivered };
          }

          return { id: subscriber.id, delivered: false };
        }),
      );

      for (const result of batchResults) {
        if (result.status === "fulfilled") {
          if (result.value.delivered) {
            sent += 1;
            deliveredIds.push(result.value.id);
          } else {
            failed += 1;
          }
        } else {
          failed += 1;
          console.error("Batch send error:", result.reason);
        }
      }

      // Update subscriber engagement timestamps
      if (deliveredIds.length > 0) {
        await db.query(
          `UPDATE newsletter_subscribers SET "lastCampaignAt" = NOW(), "updatedAt" = NOW() WHERE id = ANY($1::text[])`,
          [deliveredIds],
        );
      }

      // Update campaign counters in DB so Admin can see live progress
      await db.query(
        `UPDATE newsletter_campaigns SET "sentCount" = $1, "failedCount" = $2, "updatedAt" = NOW() WHERE id = $3`,
        [sent, failed, params.campaignId],
      );

      // Throttling delay between batches
      if (params.batchSize < chunkSubscribers.length || processedTotal + chunkSubscribers.length < totalTargets) {
          if (params.sendDelayMs > 0) await sleep(params.sendDelayMs);
      }
    }

    processedTotal += chunkSubscribers.length;
    lastId = chunkSubscribers[chunkSubscribers.length - 1].id;
  }

  await db.query(
    `
      UPDATE newsletter_campaigns
      SET
        status = $1,
        "totalTargets" = $2,
        "sentCount" = $3,
        "failedCount" = $4,
        "sentAt" = NOW(),
        "updatedAt" = NOW()
      WHERE id = $5
    `,
    [
      sent > 0 ? "sent" : "failed",
      totalTargets,
      sent,
      failed,
      params.campaignId,
    ],
  );

  return { sent, failed, totalTargets };
}

async function processCampaign(
  campaign: NewsletterCampaignRow,
  baseUrl: string,
) {

  if (campaign.isTest) {
    const delivered =
      campaign.channel === "email" && campaign.testEmail
        ? await notificationService.sendNewsletterCampaignEmail(
            campaign.testEmail,
            campaign.subject,
            campaign.content,
            `${baseUrl}/newsletter/unsubscribe-preview`,
          )
        : campaign.channel === "whatsapp" && campaign.testPhone
          ? await notificationService.sendNewsletterCampaignWhatsApp(
              campaign.testPhone,
              campaign.whatsappTemplateName
                ? {
                    mode: "template",
                    templateName: campaign.whatsappTemplateName,
                    languageCode: campaign.whatsappTemplateLanguage || "en",
                    templateParams: campaign.whatsappTemplateParams || [],
                  }
                : {
                    mode: "text",
                    content: buildWhatsAppMessage(
                      campaign.subject,
                      campaign.content,
                    ),
                  },
            )
          : campaign.channel === "sms" && campaign.testPhone
            ? await notificationService.sendNewsletterCampaignSMS(
                campaign.testPhone,
                campaign.content,
              )
            : false;

    await db.query(
      `
        UPDATE newsletter_campaigns
        SET
          status = $1,
          "totalTargets" = 1,
          "sentCount" = $2,
          "failedCount" = $3,
          "sentAt" = NOW(),
          "updatedAt" = NOW()
        WHERE id = $4
      `,
      [
        delivered ? "sent" : "failed",
        delivered ? 1 : 0,
        delivered ? 0 : 1,
        campaign.id,
      ],
    );

    return {
      sent: delivered ? 1 : 0,
      failed: delivered ? 0 : 1,
      totalTargets: 1,
    };
  }

  return sendCampaignToAudience({
    campaignId: campaign.id,
    channel: campaign.channel,
    subject: campaign.subject,
    content: campaign.content,
    whatsappTemplateName: campaign.whatsappTemplateName || undefined,
    whatsappTemplateLanguage: campaign.whatsappTemplateLanguage || undefined,
    whatsappTemplateParams: campaign.whatsappTemplateParams || undefined,
    batchSize: campaign.batchSize,
    sendDelayMs: campaign.sendDelayMs,
    limit: campaign.recipientLimit || undefined,
    audience: {
      status: campaign.audienceStatus,
      source: campaign.audienceSource || undefined,
      subscribedAfter: campaign.audienceSubscribedAfter || undefined,
      subscribedBefore: campaign.audienceSubscribedBefore || undefined,
    },
    baseUrl,
  });
}

export async function processDueScheduledCampaigns(options?: {
  maxToProcess?: number;
  baseUrl?: string;
}): Promise<number> {
  const maxToProcess = options?.maxToProcess ?? 20;
  const baseUrl = options?.baseUrl || getBaseUrl();

  const dueCampaignsResult = await db.query(
    `
      UPDATE newsletter_campaigns
      SET status = 'sending', "updatedAt" = NOW()
      WHERE id IN (
        SELECT id
        FROM newsletter_campaigns
        WHERE status = 'scheduled' AND "scheduledAt" <= NOW()
        ORDER BY "scheduledAt" ASC
        FOR UPDATE SKIP LOCKED
        LIMIT $1
      )
      RETURNING *
    `,
    [maxToProcess],
  );

  const campaigns = dueCampaignsResult.rows as NewsletterCampaignRow[];

  if (campaigns.length === 0) {
    return 0;
  }

  let processed = 0;
  for (const campaign of campaigns) {
    await processCampaign(campaign, baseUrl);
    processed += 1;
  }

  return processed;
}

// POST /api/newsletter/subscribe - Public subscription endpoint
router.post(
  "/subscribe",
  validateBody(NewsletterSubscribeSchema),
  async (req: Request, res: Response) => {
    try {
      const normalizedEmail = (req.body.email as string).trim().toLowerCase();
      const name = (req.body.name as string | undefined)?.trim() || null;
      const phone = (req.body.phone as string | undefined)?.trim() || null;
      const source =
        (req.body.source as string | undefined)?.trim() || "footer";
      const unsubscribeToken = randomBytes(24).toString("hex");

      await db.query(
        `
          INSERT INTO newsletter_subscribers (
            id, email, phone, name, source, status, "unsubscribeToken", "subscribedAt", "updatedAt"
          )
          VALUES ($1, $2, $3, $4, $5, 'active', $6, NOW(), NOW())
          ON CONFLICT (email)
          DO UPDATE SET
            phone = COALESCE(EXCLUDED.phone, newsletter_subscribers.phone),
            name = COALESCE(EXCLUDED.name, newsletter_subscribers.name),
            source = EXCLUDED.source,
            status = 'active',
            "unsubscribeToken" = EXCLUDED."unsubscribeToken",
            "unsubscribedAt" = NULL,
            "updatedAt" = NOW()
        `,
        [uuidv4(), normalizedEmail, phone, name, source, unsubscribeToken],
      );

      try {
        await notificationService.sendNewsletterWelcome(normalizedEmail);
      } catch (emailError) {
        console.error("Newsletter welcome email failed:", emailError);
      }

      res.json({
        success: true,
        message: "Subscription successful",
      });
    } catch (error) {
      console.error("Newsletter subscribe error:", error);
      res.status(500).json({ error: "Failed to subscribe" });
    }
  },
);

// GET /api/newsletter/subscribers - Admin subscriber list
router.get(
  "/subscribers",
  adminAuth,
  requireRole("manager"),
  async (req: AdminRequest, res: Response) => {
    try {
      const status =
        (req.query.status as string | undefined)?.toLowerCase() || "all";
      const search = (req.query.search as string | undefined)?.trim() || "";

      const values: Array<string> = [];
      const whereClauses: string[] = [];

      if (status === "active" || status === "unsubscribed") {
        values.push(status);
        whereClauses.push(`status = $${values.length}`);
      }

      if (search) {
        values.push(`%${search.toLowerCase()}%`);
        whereClauses.push(
          `(LOWER(email) LIKE $${values.length} OR LOWER(COALESCE(name, '')) LIKE $${values.length} OR COALESCE(phone, '') LIKE $${values.length})`,
        );
      }

      const whereSql =
        whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

      const subscribersResult = await db.query(
        `
          SELECT id, email, phone, name, source, status,
            "subscribedAt", "unsubscribedAt", "lastCampaignAt", "createdAt", "updatedAt"
          FROM newsletter_subscribers
          ${whereSql}
          ORDER BY "createdAt" DESC
        `,
        values,
      );

      const countsResult = await db.query(
        `
          SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE status = 'active')::int AS active,
            COUNT(*) FILTER (WHERE status = 'unsubscribed')::int AS unsubscribed
          FROM newsletter_subscribers
        `,
      );

      res.json({
        subscribers: subscribersResult.rows,
        counts: countsResult.rows[0],
      });
    } catch (error) {
      console.error("Newsletter list error:", error);
      res.status(500).json({ error: "Failed to fetch subscribers" });
    }
  },
);

// PATCH /api/newsletter/subscribers/:id/status - Admin status management
router.patch(
  "/subscribers/:id/status",
  adminAuth,
  requireRole("manager"),
  validateBody(UpdateNewsletterSubscriberStatusSchema),
  async (req: AdminRequest, res: Response) => {
    try {
      const { id } = req.params;
      const status = (req.body.status as string).toLowerCase();

      const result = await db.query(
        `
          UPDATE newsletter_subscribers
          SET
            status = $1,
            "unsubscribedAt" = CASE WHEN $1 = 'unsubscribed' THEN NOW() ELSE NULL END,
            "updatedAt" = NOW()
          WHERE id = $2
          RETURNING id, email, phone, name, source, status,
            "subscribedAt", "unsubscribedAt", "lastCampaignAt", "createdAt", "updatedAt"
        `,
        [status, id],
      );

      if (result.rowCount === 0) {
        res.status(404).json({ error: "Subscriber not found" });
        return;
      }

      res.json({ success: true, subscriber: result.rows[0] });
    } catch (error) {
      console.error("Newsletter status update error:", error);
      res.status(500).json({ error: "Failed to update subscriber" });
    }
  },
);

// PATCH /api/newsletter/subscribers/:id/contact - Admin contact update
router.patch(
  "/subscribers/:id/contact",
  adminAuth,
  requireRole("manager"),
  validateBody(UpdateNewsletterSubscriberContactSchema),
  async (req: AdminRequest, res: Response) => {
    try {
      const { id } = req.params;
      const rawPhone = req.body.phone as string | undefined;
      const rawName = req.body.name as string | undefined;

      let phone: string | null = null;
      if (rawPhone) {
        phone = normalizePhone(rawPhone.trim());
      }

      let name: string | null = null;
      if (rawName) {
        name = rawName.trim() || null;
      }

      const result = await db.query(
        `
          UPDATE newsletter_subscribers
          SET
            phone = CASE WHEN $1::boolean THEN $2 ELSE phone END,
            name = CASE WHEN $3::boolean THEN $4 ELSE name END,
            "updatedAt" = NOW()
          WHERE id = $5
          RETURNING id, email, phone, name, source, status,
            "subscribedAt", "unsubscribedAt", "lastCampaignAt", "createdAt", "updatedAt"
        `,
        [Boolean(rawPhone), phone, Boolean(rawName), name, id],
      );

      if (result.rowCount === 0) {
        res.status(404).json({ error: "Subscriber not found" });
        return;
      }

      res.json({ success: true, subscriber: result.rows[0] });
    } catch (error) {
      console.error("Newsletter contact update error:", error);
      res.status(500).json({ error: "Failed to update subscriber contact" });
    }
  },
);

// POST /api/newsletter/campaigns/send - Admin campaign send
router.post(
  "/campaigns/send",
  adminAuth,
  requireRole("manager"),
  validateBody(NewsletterCampaignSchema),
  async (req: AdminRequest, res: Response) => {
    try {
      const subject = (req.body.subject as string).trim();
      const content = req.body.content as string;
      const channel =
        (req.body.channel as "email" | "sms" | "whatsapp" | undefined) ||
        "email";
      const testEmail = (req.body.testEmail as string | undefined)
        ?.trim()
        .toLowerCase();
      const testPhone = (req.body.testPhone as string | undefined)?.trim();
      const isTest = Boolean(testEmail) || Boolean(testPhone);
      const whatsappTemplateName = (
        req.body.whatsappTemplateName as string | undefined
      )?.trim();
      const whatsappTemplateLanguage = (
        req.body.whatsappTemplateLanguage as string | undefined
      )?.trim();
      const whatsappTemplateParams = Array.isArray(
        req.body.whatsappTemplateParams,
      )
        ? (req.body.whatsappTemplateParams as string[])
            .map((param) => String(param).trim())
            .filter((param) => param.length > 0)
        : [];
      const batchSize = (req.body.batchSize as number | undefined) ?? 100;
      const sendDelayMs = (req.body.sendDelayMs as number | undefined) ?? 0;
      const limit = req.body.limit as number | undefined;
      const scheduleAtRaw = req.body.scheduleAt as string | undefined;
      const audienceStatus =
        (req.body.audienceStatus as
          | "active"
          | "unsubscribed"
          | "all"
          | undefined) || "active";
      const audienceSource = (
        req.body.audienceSource as string | undefined
      )?.trim();
      const audienceSubscribedAfter = req.body.audienceSubscribedAfter as
        | string
        | undefined;
      const audienceSubscribedBefore = req.body.audienceSubscribedBefore as
        | string
        | undefined;
      const baseUrl = getBaseUrl(req);

      if (channel === "sms") {
        res.status(400).json({
          error: "SMS campaigns are coming soon.",
        });
        return;
      }

      if (isTest && channel === "email" && !testEmail) {
        res
          .status(400)
          .json({ error: "Test email is required for email test." });
        return;
      }

      if (isTest && channel === "whatsapp" && !testPhone) {
        res
          .status(400)
          .json({ error: "Test phone is required for WhatsApp test." });
        return;
      }

      // Policy-safe default: live WhatsApp campaigns use approved templates.
      if (channel === "whatsapp" && !isTest && !whatsappTemplateName) {
        res.status(400).json({
          error:
            "Live WhatsApp campaigns require whatsappTemplateName. Use an approved template.",
        });
        return;
      }

      const scheduleAt = scheduleAtRaw ? new Date(scheduleAtRaw) : null;
      const isScheduled =
        scheduleAt instanceof Date && !Number.isNaN(scheduleAt.getTime())
          ? scheduleAt.getTime() > Date.now()
          : false;

      const campaignId = uuidv4();
      const status: NewsletterCampaignStatus = isScheduled
        ? "scheduled"
        : "sending";

      await db.query(
        `
          INSERT INTO newsletter_campaigns (
            id, channel, subject, content, status,
            "audienceStatus", "audienceSource", "audienceSubscribedAfter", "audienceSubscribedBefore",
            "recipientLimit", "batchSize", "sendDelayMs",
            "isTest", "testEmail", "testPhone",
            "whatsappTemplateName", "whatsappTemplateLanguage", "whatsappTemplateParams",
            "scheduledAt", "createdBy", "updatedAt"
          )
          VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9,
            $10, $11, $12,
            $13, $14, $15,
            $16, $17, $18::jsonb,
            $19, $20, NOW()
          )
        `,
        [
          campaignId,
          channel,
          subject,
          content,
          status,
          audienceStatus,
          audienceSource || null,
          audienceSubscribedAfter || null,
          audienceSubscribedBefore || null,
          limit || null,
          batchSize,
          sendDelayMs,
          isTest,
          testEmail || null,
          testPhone || null,
          whatsappTemplateName || null,
          whatsappTemplateLanguage || "en",
          whatsappTemplateParams.length > 0
            ? JSON.stringify(whatsappTemplateParams)
            : null,
          scheduleAt ? scheduleAt.toISOString() : null,
          req.admin?.id || null,
        ],
      );

      if (isScheduled) {
        res.json({
          success: true,
          campaignId,
          status: "scheduled",
          message: "Campaign scheduled successfully",
        });
        return;
      }

      res.json({
        success: true,
        campaignId,
        status: "sending",
        message: "Campaign started in the background. Check history for progress.",
      });

      // Process in background to avoid timeout
      setImmediate(async () => {
        try {
          const campaignRow = (
            await db.query(
              `SELECT * FROM newsletter_campaigns WHERE id = $1 LIMIT 1`,
              [campaignId],
            )
          ).rows[0] as NewsletterCampaignRow;

          await processCampaign(campaignRow, baseUrl);
          console.log(`✅ Background campaign ${campaignId} completed.`);
        } catch (error) {
          console.error(`❌ Background campaign ${campaignId} failed:`, error);
        }
      });
    } catch (error) {
      console.error("Newsletter campaign error:", error);
      res.status(500).json({ error: "Failed to send campaign" });
    }
  },
);

// GET /api/newsletter/campaigns - Admin campaign history
router.get(
  "/campaigns",
  adminAuth,
  requireRole("manager"),
  async (req: AdminRequest, res: Response) => {
    try {
      const limit = Number.parseInt((req.query.limit as string) || "20", 10);
      const safeLimit = Number.isInteger(limit)
        ? Math.min(Math.max(limit, 1), 100)
        : 20;

      const campaignsResult = await db.query(
        `
          SELECT
            id, subject, status,
            channel,
            "whatsappTemplateName", "whatsappTemplateLanguage", "whatsappTemplateParams",
            "audienceStatus", "audienceSource", "audienceSubscribedAfter", "audienceSubscribedBefore",
            "recipientLimit", "batchSize", "sendDelayMs",
            "isTest", "testEmail", "testPhone", "totalTargets", "sentCount", "failedCount",
            "scheduledAt", "sentAt", "createdAt", "updatedAt"
          FROM newsletter_campaigns
          ORDER BY "createdAt" DESC
          LIMIT $1
        `,
        [safeLimit],
      );

      res.json({ campaigns: campaignsResult.rows });
    } catch (error) {
      console.error("Campaign history error:", error);
      res.status(500).json({ error: "Failed to fetch campaign history" });
    }
  },
);

// DELETE /api/newsletter/campaigns/:id - Admin delete campaign
router.delete(
  "/campaigns/:id",
  adminAuth,
  requireRole("admin"),
  async (req: AdminRequest, res: Response) => {
    try {
      const { id } = req.params;
      const result = await db.query(
        "DELETE FROM newsletter_campaigns WHERE id = $1 RETURNING id",
        [id],
      );

      if (result.rowCount === 0) {
        res.status(404).json({ error: "Campaign not found" });
        return;
      }

      res.json({ success: true, message: "Campaign deleted successfully" });
    } catch (error) {
      console.error("Delete campaign error:", error);
      res.status(500).json({ error: "Failed to delete campaign" });
    }
  },
);

// PATCH /api/newsletter/campaigns/:id/cancel - Admin cancel scheduled campaign
router.patch(
  "/campaigns/:id/cancel",
  adminAuth,
  requireRole("manager"),
  async (req: AdminRequest, res: Response) => {
    try {
      const { id } = req.params;
      const result = await db.query(
        `
        UPDATE newsletter_campaigns
        SET status = 'failed', "updatedAt" = NOW()
        WHERE id = $1 AND status = 'scheduled'
        RETURNING id
      `,
        [id],
      );

      if (result.rowCount === 0) {
        res
          .status(400)
          .json({ error: "Only scheduled campaigns can be cancelled" });
        return;
      }

      res.json({ success: true, message: "Campaign cancelled" });
    } catch (error) {
      console.error("Cancel campaign error:", error);
      res.status(500).json({ error: "Failed to cancel campaign" });
    }
  },
);

// POST /api/newsletter/campaigns/process-scheduled - Admin trigger for due scheduled campaigns
router.post(
  "/campaigns/process-scheduled",
  adminAuth,
  requireRole("manager"),
  async (req: AdminRequest, res: Response) => {
    try {
      const processed = await processDueScheduledCampaigns({
        maxToProcess: 20,
      });

      res.json({
        success: true,
        processed,
        message:
          processed > 0
            ? `Processed ${processed} scheduled campaign(s)`
            : "No due scheduled campaigns",
      });
    } catch (error) {
      console.error("Process scheduled campaigns error:", error);
      res.status(500).json({ error: "Failed to process scheduled campaigns" });
    }
  },
);

// GET /api/newsletter/unsubscribe/:token - Public unsubscribe link
router.get("/unsubscribe/:token", async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    if (!token) {
      res.status(400).send("Invalid unsubscribe token");
      return;
    }

    const result = await db.query(
      `
        UPDATE newsletter_subscribers
        SET status = 'unsubscribed', "unsubscribedAt" = NOW(), "updatedAt" = NOW()
        WHERE "unsubscribeToken" = $1
        RETURNING id
      `,
      [token],
    );

    if (result.rowCount === 0) {
      res.status(404).send("This unsubscribe link is invalid or expired.");
      return;
    }

    res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Unsubscribed | SHERO</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #020617; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; text-align: center; }
            .card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); padding: 40px; border-radius: 16px; max-width: 400px; width: 100%; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); backdrop-filter: blur(5px); }
            .icon { background: #059669; color: white; width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 32px; font-weight: bold; }
            h2 { margin: 0 0 16px; font-size: 24px; letter-spacing: -0.025em; }
            p { color: #94a3b8; line-height: 1.6; margin: 0; font-size: 15px; }
            .logo { color: #059669; font-weight: 800; font-size: 18px; margin-top: 40px; display: block; text-decoration: none; border: 1px solid rgba(5, 150, 105, 0.3); padding: 8px 16px; border-radius: 8px; transition: all 0.3s; }
            .logo:hover { background: rgba(5, 150, 105, 0.1); border-color: #059669; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">✓</div>
            <h2>Unsubscribed</h2>
            <p>You have been successfully removed from our mailing list. You will no longer receive SHERO newsletter campaigns.</p>
            <a href="https://sherohq.com" class="logo">Visit SHERO</a>
          </div>
        </body>
        </html>
      `);
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error);
    res.status(500).send("Failed to process unsubscribe request.");
  }
});

export default router;
