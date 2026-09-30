import "server-only";
import { eq } from "drizzle-orm";
import { after } from "next/server";
import { db } from "@/db";
import { admins, settings } from "@/db/schema";
import { notificationEmail, type Email, type OwnerNotification } from "@/lib/notify-messages";

// Emails SHERO sends itself about new orders, consultation requests and
// waitlist signups, through Resend (https://resend.com). Without
// RESEND_API_KEY nothing is sent; locally the email is printed instead.

const FROM = process.env.NOTIFY_FROM || "SHERO <notifications@sherohq.com>";

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/** The admin's address on this deployment, so a preview's links open the preview's admin. */
function adminBase(): string {
  if (process.env.VERCEL_ENV === "production") return "https://admin.sherohq.com/admin";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}/admin`;
  return `http://localhost:${process.env.PORT || 3000}/admin`;
}

/** Where notifications go and which are on: the Settings choice, else the admin account's email. */
export async function notificationSettings() {
  const [[row], [admin]] = await Promise.all([
    db
      .select({
        notifyEmail: settings.notifyEmail,
        orders: settings.notifyOrders,
        consultations: settings.notifyConsultations,
        waitlists: settings.notifyWaitlists,
      })
      .from(settings)
      .where(eq(settings.id, 1))
      .limit(1),
    db.select({ email: admins.email }).from(admins).limit(1),
  ]);
  return {
    to: row?.notifyEmail || admin?.email || null,
    custom: row?.notifyEmail ?? null,
    orders: row?.orders ?? true,
    consultations: row?.consultations ?? true,
    waitlists: row?.waitlists ?? true,
  };
}

export async function sendEmail(to: string, email: Email): Promise<{ ok: true } | { ok: false; message: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV !== "production") console.info(`[email to ${to}] ${email.subject}\n${email.text}`);
    return { ok: false, message: "Email sending isn't connected yet (RESEND_API_KEY)." };
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [to], subject: email.subject, text: email.text }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("Sending email failed", response.status, detail);
    return { ok: false, message: `The email service refused it (${response.status}).` };
  }
  return { ok: true };
}

/**
 * Emails the owner about a new order, request or signup, after the visitor's
 * response has gone: a slow or failed email never holds up or breaks the form.
 */
export function notifyOwner(notification: OwnerNotification) {
  after(async () => {
    try {
      const choice = await notificationSettings();
      if (!choice.to || !choice[notification.kind]) return;
      await sendEmail(choice.to, notificationEmail(notification, adminBase()));
    } catch (error) {
      console.error("Owner notification failed", error);
    }
  });
}
