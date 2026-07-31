import { COMPANY_EMAILS } from "@/constants/emails";
import { sendEmail, wrapEmailHtml } from "../core/email";

export const inquiriesNotifications = {
  async sendInquiryConfirmationEmail(inquiry: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    const bodyHtml = `
      <h1 style="color: #059669; text-align: center; margin: 0 0 16px; font-size: 18px;">Thank You for Contacting SHERO</h1>
      <p>Hi ${inquiry.name},</p>
      <p>We received your message regarding <strong>"${inquiry.subject}"</strong>.</p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 13px; color: #334155;">
        ${inquiry.message}
      </div>
      <p>Our team will get back to you shortly.</p>
    `;
    const htmlContent = wrapEmailHtml(bodyHtml);
    await sendEmail(inquiry.email, `We Received Your Inquiry: ${inquiry.subject}`, htmlContent);
  },

  async sendNewInquiryAdminAlert(inquiry: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || COMPANY_EMAILS.HELLO;
    const bodyHtml = `
      <h2 style="color: #059669; margin: 0 0 16px;">📩 New Inquiry Submitted</h2>
      <p><strong>From:</strong> ${inquiry.name} (&lt;${inquiry.email}&gt;)</p>
      <p><strong>Subject:</strong> ${inquiry.subject}</p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="margin: 0; color: #334155; line-height: 1.5; white-space: pre-wrap;">${inquiry.message}</p>
      </div>
    `;
    const htmlContent = wrapEmailHtml(bodyHtml);
    await sendEmail(adminEmail, `🚨 NEW INQUIRY: ${inquiry.subject} from ${inquiry.name}`, htmlContent);
  }
};
