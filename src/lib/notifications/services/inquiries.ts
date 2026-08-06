import { COMPANY_EMAILS } from "@/constants/emails";
import { sendEmail, wrapEmailHtml } from "../core/email";

export const inquiriesNotifications = {
  async sendInquiryConfirmationEmail(inquiry: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    const isFeedback = inquiry.subject === "feedback_submission";
    const bodyHtml = isFeedback 
      ? `
      <h1 style="color: #059669; text-align: center; margin: 0 0 16px; font-size: 18px;">Thank You for Your Feedback</h1>
      <p>Hi ${inquiry.name},</p>
      <p>We truly appreciate you taking the time to share your thoughts with us.</p>
      <p>Your input is incredibly valuable to us as we continuously strive to improve our services and products for our customers.</p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 13px; color: #334155;">
        <div style="white-space: pre-wrap;">${inquiry.message}</div>
      </div>
      <p>Thank you again for being a valued part of the SHERO community!</p>
      <p style="margin-top: 24px;">Best regards,<br/><strong>The SHERO Team</strong></p>
    ` 
      : `
      <h1 style="color: #059669; text-align: center; margin: 0 0 16px; font-size: 18px;">Thank You for Reaching Out</h1>
      <p>Hi ${inquiry.name},</p>
      <p>We received your message regarding <strong>"${inquiry.subject}"</strong>.</p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 13px; color: #334155;">
        <div style="white-space: pre-wrap;">${inquiry.message}</div>
      </div>
      <p>Our team will review your inquiry and get back to you within 24-48 hours.</p>
      <p style="margin-top: 24px;">Best regards,<br/><strong>The SHERO Team</strong></p>
    `;

    const htmlContent = wrapEmailHtml(bodyHtml);
    const emailSubject = isFeedback ? "Thank You for Your Feedback!" : `We Received Your Inquiry: ${inquiry.subject}`;
    await sendEmail(inquiry.email, emailSubject, htmlContent);
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
