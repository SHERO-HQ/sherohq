import { COMPANY_EMAILS } from "@/constants/emails";
import { getServiceDisplayTitle } from "@/constants/services";
import { sendEmail, wrapEmailHtml } from "../core/email";
import { sendWhatsAppNotification } from "../core/whatsapp";

export const consultationsNotifications = {
  async sendConsultationScheduledEmail(consultation: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    service: string;
    date: string;
    time: string;
    message?: string;
  }) {
    const serviceTitle = getServiceDisplayTitle(consultation.service);
    const meetUrl =
      process.env.NEXT_PUBLIC_CONSULTATION_MEET_URL ||
      "https://meet.google.com/kps-huth-jfd";
    const meetDialIn =
      process.env.NEXT_PUBLIC_CONSULTATION_MEET_DIAL_IN ||
      "(ZA) +27 10 823 1292 PIN: 183 170 582#";

    const bodyHtml = `
      <h1 style="color: #059669; text-align: center; margin: 0 0 16px; font-size: 20px;">Consultation Confirmed</h1>
      <p>Hi ${consultation.name},</p>
      <p>Thank you for scheduling a consultation with <strong>SHERO TECHNOLOGIES</strong>. Here are the details of your session:</p>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0 0 6px;"><strong>Service:</strong> ${serviceTitle}</p>
        <p style="margin: 0 0 6px;"><strong>Date:</strong> ${consultation.date}</p>
        <p style="margin: 0 0 6px;"><strong>Time:</strong> ${consultation.time} GMT+00:00 (Accra / UTC)</p>
        <p style="margin: 0 0 6px; font-size: 12px; color: #64748b;"><em>Note: All times are based on Accra / GMT+0 (UTC). Please convert to your local timezone if you are joining from another region.</em></p>
        ${consultation.phone ? `<p style="margin: 0 0 6px;"><strong>Contact Phone:</strong> ${consultation.phone}</p>` : ""}
        ${consultation.message ? `<p style="margin: 8px 0 0; color: #475569;"><em>"${consultation.message}"</em></p>` : ""}
      </div>

      <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 18px; margin: 20px 0; text-align: center;">
        <p style="margin: 0 0 10px; font-weight: bold; color: #047857; font-size: 15px;">📹 Video Call Joining Info</p>
        <p style="margin: 0 0 14px; font-size: 13px; color: #334155;">Join our Google Meet room at your scheduled time:</p>
        <a href="${meetUrl}" target="_blank" style="display: inline-block; padding: 12px 28px; background: #059669; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Join Google Meet</a>
        <p style="margin: 12px 0 4px; font-size: 12px; color: #64748b;">Direct link: <a href="${meetUrl}" style="color: #059669; word-break: break-all;">${meetUrl}</a></p>
        <p style="margin: 4px 0 0; font-size: 11px; color: #94a3b8;">Phone Dial-in: ${meetDialIn}</p>
      </div>

      <p>Our specialists look forward to speaking with you. If you have any questions or need to reschedule, simply reply directly to this email (<a href="mailto:${COMPANY_EMAILS.INFO}" style="color: #059669;">${COMPANY_EMAILS.INFO}</a>) or reach out via WhatsApp.</p>
    `;
    const htmlContent = wrapEmailHtml(bodyHtml, {
      preheader: `Consultation confirmed: ${serviceTitle} on ${consultation.date}`,
    });
    await sendEmail(
      consultation.email,
      `Consultation Confirmed: ${serviceTitle}`,
      htmlContent,
      {
        from: process.env.RESEND_FROM || `SHERO Technologies <${COMPANY_EMAILS.INFO}>`,
        replyTo: COMPANY_EMAILS.INFO,
      },
    );
  },

  async sendConsultationScheduledWhatsApp(consultation: {
    name: string;
    phone?: string;
    service: string;
    date: string;
    time: string;
  }) {
    if (!consultation.phone) return;

    const serviceTitle = getServiceDisplayTitle(consultation.service);
    const meetUrl =
      process.env.NEXT_PUBLIC_CONSULTATION_MEET_URL ||
      "https://meet.google.com/kps-huth-jfd";
    const meetDialIn =
      process.env.NEXT_PUBLIC_CONSULTATION_MEET_DIAL_IN ||
      "(ZA) +27 10 823 1292 PIN: 183 170 582#";

    const text = [
      `👋 *Hello ${consultation.name}*,`,
      ``,
      `Your consultation with *SHERO TECHNOLOGIES* has been confirmed!`,
      ``,
      `🛠 *Service*: ${serviceTitle}`,
      `📅 *Date*: ${consultation.date}`,
      `⏰ *Time*: ${consultation.time} GMT+0 (Accra / UTC)`,
      `ℹ️ *(All times are in GMT+00:00 / Accra. Please adjust for your local timezone)*`,
      ``,
      `📹 *Google Meet Video Call Link*:`,
      `${meetUrl}`,
      ``,
      `📞 *Phone Dial-in*: ${meetDialIn}`,
      ``,
      `We look forward to meeting with you. Reply to this message if you have any questions or need to reschedule.`,
    ].join("\n");

    try {
      await sendWhatsAppNotification(consultation.phone, text);
    } catch (err) {
      console.error("WhatsApp consultation notification error:", err);
    }
  },

  async sendNewConsultationAdminAlert(consultation: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    service: string;
    date: string;
    time: string;
    message?: string;
  }) {
    const serviceTitle = getServiceDisplayTitle(consultation.service);
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || COMPANY_EMAILS.INFO;
    const adminPhone =
      process.env.ADMIN_NOTIFICATION_PHONE ||
      process.env.ADMIN_PHONE_NUMBER ||
      "233548711582";
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com";
    const meetUrl =
      process.env.NEXT_PUBLIC_CONSULTATION_MEET_URL ||
      "https://meet.google.com/kps-huth-jfd";

    const bodyHtml = `
      <h2 style="color: #059669; margin: 0 0 16px;">📅 New Consultation Requested</h2>
      <p><strong>Client Name:</strong> ${consultation.name}</p>
      <p><strong>Email:</strong> ${consultation.email}</p>
      <p><strong>Phone:</strong> ${consultation.phone || "N/A"}</p>
      <p><strong>Service:</strong> ${serviceTitle}</p>
      <p><strong>Date & Time:</strong> ${consultation.date} at ${consultation.time} GMT (Accra / UTC)</p>
      <p><strong>Google Meet Room:</strong> <a href="${meetUrl}">${meetUrl}</a></p>
      ${consultation.message ? `<p><strong>Notes:</strong> ${consultation.message}</p>` : ""}
      <p style="text-align: center; margin-top: 20px;">
        <a href="${baseUrl}/admin/support" style="display: inline-block; padding: 10px 24px; background: #0f172a; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Manage Consultations</a>
      </p>
    `;
    const htmlContent = wrapEmailHtml(bodyHtml);

    const waAdminText = [
      `🚨 *NEW CONSULTATION BOOKED*`,
      ``,
      `👤 *Client*: ${consultation.name}`,
      `📧 *Email*: ${consultation.email}`,
      `📱 *Phone*: ${consultation.phone || "N/A"}`,
      `🛠 *Service*: ${serviceTitle}`,
      `📅 *Date & Time*: ${consultation.date} at ${consultation.time} GMT (Accra / UTC)`,
      `📹 *Meet*: ${meetUrl}`,
      consultation.message ? `📝 *Notes*: "${consultation.message}"` : "",
    ].filter(Boolean).join("\n");

    await Promise.allSettled([
      sendEmail(
        adminEmail,
        `🚨 NEW CONSULTATION: ${serviceTitle} - ${consultation.name}`,
        htmlContent,
        {
          replyTo: consultation.email,
        },
      ),
      adminPhone ? sendWhatsAppNotification(adminPhone, waAdminText) : Promise.resolve(),
    ]);
  },

  async sendConsultationStatusEmail(consultation: {
    id: string;
    name: string;
    email: string;
    service: string;
    date: string;
    time: string;
    status: string;
  }) {
    const serviceTitle = getServiceDisplayTitle(consultation.service);
    const formattedStatus = consultation.status.replace(/_/g, " ").toUpperCase();
    const meetUrl =
      process.env.NEXT_PUBLIC_CONSULTATION_MEET_URL ||
      "https://meet.google.com/kps-huth-jfd";

    const bodyHtml = `
      <h1 style="color: #059669; text-align: center; margin: 0 0 16px; font-size: 18px;">Consultation Update: ${formattedStatus}</h1>
      <p>Hi ${consultation.name},</p>
      <p>Your consultation for <strong>${serviceTitle}</strong> scheduled for <strong>${consultation.date} (${consultation.time} GMT / Accra Time)</strong> is now <strong>${formattedStatus}</strong>.</p>
      <p>Google Meet link: <a href="${meetUrl}" style="color: #059669;">${meetUrl}</a></p>
      <p>If you have any questions or need to reschedule, please reply directly to this email (<a href="mailto:${COMPANY_EMAILS.INFO}" style="color: #059669;">${COMPANY_EMAILS.INFO}</a>) or reach out via WhatsApp.</p>
    `;
    const htmlContent = wrapEmailHtml(bodyHtml);
    await sendEmail(
      consultation.email,
      `Consultation Update: ${serviceTitle}`,
      htmlContent,
      {
        from: process.env.RESEND_FROM || `SHERO Technologies <${COMPANY_EMAILS.INFO}>`,
        replyTo: COMPANY_EMAILS.INFO,
      },
    );
  }
};
