import nodemailer from "nodemailer";
import { Resend } from "resend";
import { COMPANY_CONTACTS } from "@/constants/contacts";
import { COMPANY_EMAILS } from "@/constants/emails";
import { SOCIAL_LINKS } from "@/constants/socials";
import { logActivity } from "@/lib/activity";
import { getErrorMessage } from "@/utils/error";

let transporter: nodemailer.Transporter | null = null;
let resend: Resend | null = null;

export function initEmailProvider() {
  if (transporter || resend) return;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, RESEND_API_KEY } = process.env;

  if (RESEND_API_KEY && !RESEND_API_KEY.includes("your_api_key")) {
    resend = new Resend(RESEND_API_KEY);
  } else if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
}

export function wrapEmailHtml(
  bodyHtml: string,
  options?: { hideFooterContact?: boolean; preheader?: string },
): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com";
  const logoUrl = `${baseUrl.replace(/\/$/, "")}/assets/logo/shero.png`;
  const year = new Date().getFullYear();

  const preheaderHtml = options?.preheader
    ? `<div style="display: none; max-height: 0px; overflow: hidden;">${options.preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>`
    : "";

  return `
    ${preheaderHtml}
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <!-- Header with Logo -->
      <div style="text-align: center; padding: 28px 20px 20px; border-bottom: 1.5px solid #059669;">
        <a href="${baseUrl}" target="_blank" style="text-decoration: none;">
          <img src="${logoUrl}" alt="SHERO TECHNOLOGIES" width="40" height="40" style="display: inline-block; vertical-align: middle;" />
        </a>
      </div>
      <!-- Body -->
      <div style="padding: 28px 24px 12px;">
        ${bodyHtml}
      </div>
      <!-- Footer -->
      <div style="border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6;">
        ${
          !options?.hideFooterContact
            ? `<p style="margin: 0 0 8px;">Need help? <a href="https://wa.me/${COMPANY_CONTACTS.WHATSAPP}" style="color: #059669; text-decoration: none;">WhatsApp</a> · <a href="mailto:${COMPANY_EMAILS.SUPPORT}" style="color: #059669; text-decoration: none;">${COMPANY_EMAILS.SUPPORT}</a></p>`
            : ""
        }
        <div style="margin: 12px 0;">
          <a href="${SOCIAL_LINKS.TWITTER}" style="color: #64748b; text-decoration: none; margin: 0 8px;">Twitter</a>
          <a href="${SOCIAL_LINKS.TIKTOK}" style="color: #64748b; text-decoration: none; margin: 0 8px;">TikTok</a>
          <a href="${SOCIAL_LINKS.FACEBOOK}" style="color: #64748b; text-decoration: none; margin: 0 8px;">Facebook</a>
          <a href="${SOCIAL_LINKS.INSTAGRAM}" style="color: #64748b; text-decoration: none; margin: 0 8px;">Instagram</a>
        </div>
        <p style="margin: 0;">&copy; ${year} SHERO TECHNOLOGIES. All rights reserved.</p>
      </div>
    </div>
  `;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  options: {
    throwOnError?: boolean;
    requestId?: string;
    attachments?: { filename: string; content: Buffer }[];
  } = {},
) {
  initEmailProvider();
  
  const logPrefix = options.requestId ? `[Newsletter ${options.requestId}]` : "[Newsletter]";

  try {
    if (resend) {
      const from = process.env.RESEND_FROM?.trim();
      if (!from) {
        throw new Error("RESEND_FROM is required for Resend email delivery.");
      }

      const result = await resend.emails.send({
        from,
        to,
        subject,
        html,
        attachments: options.attachments,
      });

      if (result.error) {
        throw new Error(`Resend rejected the email: ${result.error.message}`);
      }
    } else if (transporter) {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        html,
        attachments: options.attachments,
      });
    } else {
      if (process.env.NODE_ENV === "production" && options.throwOnError) {
        throw new Error("Email delivery is not configured.");
      }
      if (process.env.NODE_ENV !== "production") {
        console.log(`${logPrefix} [Email Simulation] To: ${to}, Subject: ${subject}`);
      }
    }
  } catch (error) {
    const msg = getErrorMessage(error, "Email delivery failed");
    console.error(`${logPrefix} ❌ [Email Error]:`, error);

    logActivity(
      null,
      "system_alert",
      "error",
      `Email delivery failed for ${to}: ${msg}`,
    ).catch(() => {});

    if (options.throwOnError) {
      throw new Error(`Email delivery failed: ${msg}`);
    }
  }
}
