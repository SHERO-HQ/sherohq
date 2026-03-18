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

function getBaseUrl(req: Request): string {
  const envBase = process.env.FRONTEND_URL?.replace(/\/$/, "");
  if (envBase) return envBase;

  const protocol = req.protocol || "https";
  const host = req.get("host") || "sherohq.com";
  return `${protocol}://${host}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// POST /api/newsletter/subscribe - Public subscription endpoint
router.post(
  "/subscribe",
  validateBody(NewsletterSubscribeSchema),
  async (req: Request, res: Response) => {
    try {
      const normalizedEmail = (req.body.email as string).trim().toLowerCase();
      const name = (req.body.name as string | undefined)?.trim() || null;
      const source =
        (req.body.source as string | undefined)?.trim() || "footer";
      const unsubscribeToken = randomBytes(24).toString("hex");

      await db.query(
        `
          INSERT INTO newsletter_subscribers (
            id, email, name, source, status, "unsubscribeToken", "subscribedAt", "updatedAt"
          )
          VALUES ($1, $2, $3, $4, 'active', $5, NOW(), NOW())
          ON CONFLICT (email)
          DO UPDATE SET
            name = COALESCE(EXCLUDED.name, newsletter_subscribers.name),
            source = EXCLUDED.source,
            status = 'active',
            "unsubscribeToken" = EXCLUDED."unsubscribeToken",
            "unsubscribedAt" = NULL,
            "updatedAt" = NOW()
        `,
        [uuidv4(), normalizedEmail, name, source, unsubscribeToken],
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
          `(LOWER(email) LIKE $${values.length} OR LOWER(COALESCE(name, '')) LIKE $${values.length})`,
        );
      }

      const whereSql =
        whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

      const subscribersResult = await db.query(
        `
          SELECT id, email, name, source, status,
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
          RETURNING id, email, name, source, status,
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
      const testEmail = (req.body.testEmail as string | undefined)
        ?.trim()
        .toLowerCase();
      const batchSize = (req.body.batchSize as number | undefined) ?? 100;
      const sendDelayMs = (req.body.sendDelayMs as number | undefined) ?? 0;
      const limit = req.body.limit as number | undefined;
      const baseUrl = getBaseUrl(req);

      if (testEmail) {
        const testSent = await notificationService.sendNewsletterCampaignEmail(
          testEmail,
          subject,
          content,
          `${baseUrl}/newsletter/unsubscribe-preview`,
        );

        if (!testSent) {
          res.status(500).json({ error: "Failed to send test campaign" });
          return;
        }

        res.json({
          success: true,
          sent: 1,
          failed: 0,
          totalTargets: 1,
          batchSize: 1,
          sendDelayMs: 0,
          message: "Test campaign sent",
        });
        return;
      }

      const subscribersResult = await db.query(
        `
          SELECT id, email, "unsubscribeToken"
          FROM newsletter_subscribers
          WHERE status = 'active'
          ORDER BY "createdAt" DESC
        `,
      );

      const subscribers = subscribersResult.rows as Array<
        Pick<NewsletterSubscriberRow, "id" | "email" | "unsubscribeToken">
      >;

      if (subscribers.length === 0) {
        res.status(400).json({ error: "No active subscribers available" });
        return;
      }

      const targets =
        typeof limit === "number" ? subscribers.slice(0, limit) : subscribers;

      if (targets.length === 0) {
        res.status(400).json({ error: "No subscribers selected for campaign" });
        return;
      }

      let sent = 0;
      let failed = 0;
      const deliveredIds: string[] = [];

      for (let i = 0; i < targets.length; i += batchSize) {
        const chunk = targets.slice(i, i + batchSize);

        const chunkResults = await Promise.allSettled(
          chunk.map(async (subscriber) => {
            const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe/${subscriber.unsubscribeToken}`;

            const delivered =
              await notificationService.sendNewsletterCampaignEmail(
                subscriber.email,
                subject,
                content,
                unsubscribeUrl,
              );

            return { id: subscriber.id, email: subscriber.email, delivered };
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
                `Campaign send failed for ${result.value.email}: provider delivery error`,
              );
            }
          } else {
            failed += 1;
            console.error("Campaign send failed in batch:", result.reason);
          }
        }

        const hasMoreBatches = i + batchSize < targets.length;
        if (sendDelayMs > 0 && hasMoreBatches) {
          await sleep(sendDelayMs);
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

      res.json({
        success: true,
        sent,
        failed,
        totalTargets: targets.length,
        batchSize,
        sendDelayMs,
        message: `Campaign completed. ${sent} sent, ${failed} failed.`,
      });
    } catch (error) {
      console.error("Newsletter campaign error:", error);
      res.status(500).json({ error: "Failed to send campaign" });
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
