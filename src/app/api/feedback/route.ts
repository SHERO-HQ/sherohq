import { NextResponse } from "next/server";
import { query as dbQuery } from "../../../lib/db";
import { notificationService } from "../../../lib/notifications";

type Body = {
  name?: string;
  email?: string;
  anonymous?: boolean;
  rating?: number;
  message: string;
};

export async function POST(req: Request) {
  try {
    const body: Body = await req.json();

    if (!body || !body.message || String(body.message).trim().length < 3) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const anonymous = Boolean(body.anonymous);
    const name = anonymous ? null : ((body.name || null) as string | null);
    const email = anonymous ? null : ((body.email || null) as string | null);
    const rating = Number(body.rating || null) || null;
    const message = String(body.message).trim();

    // Try to persist to DB if available
    if (process.env.DATABASE_URL) {
      try {
        const insertSql = `
          INSERT INTO customer_feedback (name, email, rating, message, page, created_at)
          VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id
        `;

        const page = null;
        const res = await dbQuery(insertSql, [
          name,
          email,
          rating,
          message,
          page,
        ]);
        const insertedId = res?.rows?.[0]?.id;

        // Optionally notify admin about new feedback
        const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
        if (adminEmail) {
          const base =
            process.env.NEXT_PUBLIC_SITE_URL || "https://your-site.com";
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

        return NextResponse.json({ ok: true, id: insertedId }, { status: 201 });
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

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[Feedback API] Unexpected error:", err);
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
