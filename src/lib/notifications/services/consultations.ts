import { COMPANY_EMAILS } from "@/constants/emails";
import { COMPANY_CONTACTS } from "@/constants/contacts";
import { sendEmail, wrapEmailHtml } from "../core/email";

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
    const bodyHtml = `
      <h1 style="color: #059669; text-align: center; margin: 0 0 16px; font-size: 18px;">Consultation Request Received</h1>
      <p>Hi ${consultation.name},</p>
      <p>Thank you for requesting a consultation with <strong>SHERO TECHNOLOGIES</strong>. Here are the details of your request:</p>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0 0 6px;"><strong>Service:</strong> ${consultation.service}</p>
        <p style="margin: 0 0 6px;"><strong>Requested Date:</strong> ${consultation.date}</p>
        <p style="margin: 0 0 6px;"><strong>Time Window:</strong> ${consultation.time}</p>
        ${consultation.phone ? `<p style="margin: 0 0 6px;"><strong>Contact Phone:</strong> ${consultation.phone}</p>` : ""}
        ${consultation.message ? `<p style="margin: 8px 0 0; color: #475569;"><em>"${consultation.message}"</em></p>` : ""}
      </div>
      <p>Our specialists will contact you shortly to confirm the appointment and send the meeting schedule.</p>
    `;
    const htmlContent = wrapEmailHtml(bodyHtml, {
      preheader: `Consultation requested for ${consultation.service}`,
    });
    await sendEmail(consultation.email, `Consultation Request - ${consultation.service}`, htmlContent);
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
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || COMPANY_EMAILS.HELLO;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com";
    const bodyHtml = `
      <h2 style="color: #059669; margin: 0 0 16px;">📅 New Consultation Requested</h2>
      <p><strong>Client Name:</strong> ${consultation.name}</p>
      <p><strong>Email:</strong> ${consultation.email}</p>
      <p><strong>Phone:</strong> ${consultation.phone || "N/A"}</p>
      <p><strong>Service:</strong> ${consultation.service}</p>
      <p><strong>Date & Time:</strong> ${consultation.date} at ${consultation.time}</p>
      ${consultation.message ? `<p><strong>Notes:</strong> ${consultation.message}</p>` : ""}
      <p style="text-align: center; margin-top: 20px;">
        <a href="${baseUrl}/admin/support" style="display: inline-block; padding: 10px 24px; background: #0f172a; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Manage Consultations</a>
      </p>
    `;
    const htmlContent = wrapEmailHtml(bodyHtml);
    await sendEmail(adminEmail, `🚨 NEW CONSULTATION: ${consultation.service} - ${consultation.name}`, htmlContent);
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
    const formattedStatus = consultation.status.replace(/_/g, " ").toUpperCase();
    const bodyHtml = `
      <h1 style="color: #059669; text-align: center; margin: 0 0 16px; font-size: 18px;">Consultation Update: ${formattedStatus}</h1>
      <p>Hi ${consultation.name},</p>
      <p>Your consultation for <strong>${consultation.service}</strong> scheduled for <strong>${consultation.date} (${consultation.time})</strong> is now <strong>${formattedStatus}</strong>.</p>
      <p>If you have any questions or need to reschedule, please feel free to reach out to us via email or WhatsApp.</p>
    `;
    const htmlContent = wrapEmailHtml(bodyHtml);
    await sendEmail(consultation.email, `Consultation Update: ${consultation.service}`, htmlContent);
  }
};
