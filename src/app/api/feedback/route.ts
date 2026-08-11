import { apiResponse, validateCsrf } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { customerFeedback } from "@/lib/drizzle/schema";
import { notificationService } from "@/lib/notifications";
import { sanitizeText, canonicalizeEmail } from "@/lib/sanitize";

type Body = {
  name?: string;
  email?: string;
  anonymous?: boolean;
  rating?: number;
  message: string;
};

export async function POST(req: NextRequest) {
  try {
    const csrfError = await validateCsrf(req);
    if (csrfError) return csrfError;

    const body: Body = await req.json();

    if (!body || !body.message || String(body.message).trim().length < 3) {
      return apiResponse.error("Message is required", 400);
    }

    const anonymous = Boolean(body.anonymous);
    const name = anonymous ? null : (body.name ? sanitizeText(body.name as string) : null);
    const email = anonymous ? null : (body.email ? canonicalizeEmail(body.email as string) : null);
    const rating = Number(body.rating || null) || null;
    const message = sanitizeText(body.message as string);

    // Try to persist to DB if available
    if (process.env.POSTGRES_URL || process.env.DATABASE_URL) {
      try {
        const page = null;
        const res = await db.insert(customerFeedback).values({
          name,
          email,
          rating,
          message,
          page
        }).returning({ id: customerFeedback.id });
        const insertedId = res[0]?.id;

        // Optionally notify admin about new feedback
        const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
        if (adminEmail) {
          const base =
            process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com";
          const content = `
              <h3>New customer feedback</h3>
              <p><strong>Submitter:</strong> ${anonymous ? "Anonymous" : name || "—"}</p>
              ${anonymous ? "" : `<p><strong>Email:</strong> ${email || "—"}</p>`}
              <p><strong>Rating:</strong> ${rating || "—"}</p>
              <p><strong>Message:</strong><br/>${message}</p>
              <p><a href="${base}/admin/feedback/${insertedId}">View in admin</a></p>
            `;
          await notificationService.sendNewsletterCampaignEmail(
            adminEmail,
            "New customer feedback",
            content,
            base,
          );
        }

        return apiResponse.success({ ok: true, id: insertedId }, 201);
      } catch (err: any) {
        if (process.env.NODE_ENV !== "production") {
          console.error("[Feedback API] DB insert failed:", err?.message || err);
        }
        // fallthrough to fallback handling
      }
    }

    // Fallback: log + email admin
    if (process.env.NODE_ENV !== "production") {
      console.log("[Feedback API] Feedback received (no DB):", {
        submitter: anonymous ? "anonymous" : name || "-",
        rating,
        message,
      });
    }

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (adminEmail) {
      try {
        const base =
          process.env.NEXT_PUBLIC_SITE_URL || "https://your-site.com";
        const content = `
          <h3>Customer feedback (no DB)</h3>
          <p><strong>Submitter:</strong> ${anonymous ? "Anonymous" : name || "—"}</p>
          ${anonymous ? "" : `<p><strong>Email:</strong> ${email || "—"}</p>`}
          <p><strong>Rating:</strong> ${rating || "—"}</p>
          <p><strong>Message:</strong><br/>${message}</p>
        `;
        await notificationService.sendNewsletterCampaignEmail(
          adminEmail,
          "Customer feedback received",
          content,
          base,
        );
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.error("[Feedback API] Admin email failed:", err);
        }
      }
    }

    return apiResponse.success({ ok: true }, 201);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[Feedback API] Unexpected error:", err);
    }
    return apiResponse.error("Internal server error", 500);
  }
}
