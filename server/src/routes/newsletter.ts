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

  const subscribersResult = await db.query(
    `
      SELECT id, email, "unsubscribeToken"
      , phone
      FROM newsletter_subscribers
      ${whereSql}
      ORDER BY "createdAt" DESC
    `,
    values,
  );

  const subscribers = subscribersResult.rows as Array<
    Pick<NewsletterSubscriberRow, "id" | "email" | "phone" | "unsubscribeToken">
  >;

  const targets =
    typeof params.limit === "number"
      ? subscribers.slice(0, params.limit)
      : subscribers;

  if (targets.length === 0) {
    await db.query(
      `
        UPDATE newsletter_campaigns
        SET
          status = 'failed',
          "totalTargets" = 0,
          "sentCount" = 0,
          "failedCount" = 0,
          "sentAt" = NOW(),
          "updatedAt" = NOW()
        WHERE id = $1
      `,
      [params.campaignId],
    );

    return { sent: 0, failed: 0, totalTargets: 0 };
  }

  let sent = 0;
  let failed = 0;
  const deliveredIds: string[] = [];

  for (let i = 0; i < targets.length; i += params.batchSize) {
    const chunk = targets.slice(i, i + params.batchSize);

    const chunkResults = await Promise.allSettled(
      chunk.map(async (subscriber) => {
        if (params.channel === "email") {
          const unsubscribeUrl = `${params.baseUrl}/api/newsletter/unsubscribe/${subscriber.unsubscribeToken}`;
          const delivered =
            await notificationService.sendNewsletterCampaignEmail(
              subscriber.email,
              params.subject,
              params.content,
              unsubscribeUrl,
            );

          return {
            id: subscriber.id,
            target: subscriber.email,
            delivered,
          };
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
          return {
            id: subscriber.id,
            target: subscriber.phone,
            delivered,
          };
        }

        return {
          id: subscriber.id,
          target: subscriber.email,
          delivered: false,
        };
      }),
    );

    for (const result of chunkResults) {
      if (result.status === "fulfilled") {
        if (result.value.delivered) {
          sent += 1;
          deliveredIds.push(result.value.id);
        } else {
          failed += 1;
          console.error(
            `Campaign send failed for ${result.value.target}: provider delivery error`,
          );
        }
      } else {
        failed += 1;
        console.error("Campaign send failed in batch:", result.reason);
      }
    }

    const hasMoreBatches = i + params.batchSize < targets.length;
    if (params.sendDelayMs > 0 && hasMoreBatches) {
      await sleep(params.sendDelayMs);
    }
  }

  if (deliveredIds.length > 0) {
    await db.query(
      `
        UPDATE newsletter_subscribers
        SET "lastCampaignAt" = NOW(), "updatedAt" = NOW()
        WHERE id = ANY($1::text[])
      `,
      [deliveredIds],
    );
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
      targets.length,
      sent,
      failed,
      params.campaignId,
    ],
  );

  return { sent, failed, totalTargets: targets.length };
}

async function processCampaign(
  campaign: NewsletterCampaignRow,
  baseUrl: string,
) {
  if (campaign.channel === "sms") {
    await db.query(
      `
        UPDATE newsletter_campaigns
        SET
          status = 'failed',
          "failedCount" = COALESCE("totalTargets", 0),
          "sentAt" = NOW(),
          "updatedAt" = NOW()
        WHERE id = $1
      `,
      [campaign.id],
    );

    return {
      sent: 0,
      failed: campaign.totalTargets,
      totalTargets: campaign.totalTargets,
    };
  }

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
  async (req: AdminRequest, res: Response) => {
    try {
      const { id } = req.params;
      const status = (req.body.status as string | undefined)?.toLowerCase();

      if (status !== "active" && status !== "unsubscribed") {
        res.status(400).json({ error: "Invalid status" });
        return;
      }

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
  async (req: AdminRequest, res: Response) => {
    try {
      const { id } = req.params;
      const rawPhone = req.body.phone as string | null | undefined;
      const rawName = req.body.name as string | null | undefined;

      const hasPhone = typeof rawPhone !== "undefined";
      const hasName = typeof rawName !== "undefined";

      if (!hasPhone && !hasName) {
        res.status(400).json({ error: "Provide phone or name to update." });
        return;
      }

      let phone: string | null = null;
      if (hasPhone) {
        const normalized = String(rawPhone ?? "").trim();
        if (normalized.length > 0) {
          const parsed = normalizePhone(normalized);
          if (!/^\+?[1-9]\d{7,14}$/.test(parsed)) {
            res.status(400).json({ error: "Invalid phone number format." });
            return;
          }
          phone = parsed;
        }
      }

      let name: string | null = null;
      if (hasName) {
        const normalizedName = String(rawName ?? "").trim();
        if (normalizedName.length > 100) {
          res.status(400).json({ error: "Name is too long." });
          return;
        }
        name = normalizedName || null;
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
        [hasPhone, phone, hasName, name, id],
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

      const campaignRow = (
        await db.query(
          `SELECT * FROM newsletter_campaigns WHERE id = $1 LIMIT 1`,
          [campaignId],
        )
      ).rows[0] as NewsletterCampaignRow;

      const result = await processCampaign(campaignRow, baseUrl);

      if (result.totalTargets === 0) {
        res.status(400).json({ error: "No subscribers selected for campaign" });
        return;
      }

      res.json({
        success: true,
        campaignId,
        sent: result.sent,
        failed: result.failed,
        totalTargets: result.totalTargets,
        batchSize,
        sendDelayMs,
        message: `Campaign completed. ${result.sent} sent, ${result.failed} failed.`,
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

    res
      .status(200)
      .send(
        "<html><body style='font-family:sans-serif;padding:24px;'><h2>You have been unsubscribed.</h2><p>You will no longer receive SHERO newsletter campaigns.</p></body></html>",
      );
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error);
    res.status(500).send("Failed to process unsubscribe request.");
  }
});

export default router;
