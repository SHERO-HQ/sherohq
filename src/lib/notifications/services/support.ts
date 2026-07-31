import { COMPANY_EMAILS } from "@/constants/emails";
import { sendEmail, wrapEmailHtml } from "../core/email";

export const supportNotifications = {
  async sendSupportTicketCreatedEmail(ticket: {
    id: string;
    ticket_no: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    category: string;
  }) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com";
    const bodyHtml = `
      <h1 style="color: #059669; text-align: center; margin: 0 0 16px; font-size: 18px;">Support Ticket Received</h1>
      <p style="text-align: center; color: #64748b; font-size: 13px; margin: 0 0 20px;">Ticket <strong>#${ticket.ticket_no}</strong></p>
      <p>Hi ${ticket.name},</p>
      <p>Thank you for reaching out to SHERO TECHNOLOGIES Support. We have received your inquiry regarding <strong>"${ticket.subject}"</strong>.</p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0 0 6px; font-size: 12px; color: #64748b; text-transform: uppercase;">Category: ${ticket.category}</p>
        <p style="margin: 0; color: #334155; line-height: 1.5; white-space: pre-wrap;">${ticket.message}</p>
      </div>
      <p>Our support team is reviewing your ticket and will respond as soon as possible, typically within 24 hours.</p>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${baseUrl}/track/${ticket.ticket_no}" style="display: inline-block; padding: 12px 28px; background: #059669; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Track Ticket Status</a>
      </p>
    `;
    const htmlContent = wrapEmailHtml(bodyHtml, {
      preheader: `Ticket #${ticket.ticket_no} created: ${ticket.subject}`,
    });
    await sendEmail(ticket.email, `Support Ticket #${ticket.ticket_no} - ${ticket.subject}`, htmlContent);
  },

  async sendNewSupportTicketAdminAlert(ticket: {
    id: string;
    ticket_no: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    category: string;
  }) {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || COMPANY_EMAILS.SUPPORT;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com";
    const bodyHtml = `
      <h2 style="color: #059669; margin: 0 0 16px;">🎟️ New Support Ticket #${ticket.ticket_no}</h2>
      <p><strong>From:</strong> ${ticket.name} (&lt;${ticket.email}&gt;)</p>
      <p><strong>Category:</strong> ${ticket.category}</p>
      <p><strong>Subject:</strong> ${ticket.subject}</p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="margin: 0; color: #334155; line-height: 1.5; white-space: pre-wrap;">${ticket.message}</p>
      </div>
      <p style="text-align: center; margin-top: 20px;">
        <a href="${baseUrl}/admin/support" style="display: inline-block; padding: 10px 24px; background: #0f172a; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">View in Admin Panel</a>
      </p>
    `;
    const htmlContent = wrapEmailHtml(bodyHtml);
    await sendEmail(adminEmail, `🚨 NEW TICKET #${ticket.ticket_no}: ${ticket.subject}`, htmlContent);
  },

  async sendSupportTicketStatusEmail(ticket: {
    id: string;
    ticket_no: number;
    name: string;
    email: string;
    subject: string;
    status: string;
  }) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com";
    const formattedStatus = ticket.status.replace(/_/g, " ").toUpperCase();
    const isResolved = ticket.status === "resolved" || ticket.status === "closed";
    
    const bodyHtml = `
      <h1 style="color: ${isResolved ? "#059669" : "#2563eb"}; text-align: center; margin: 0 0 16px; font-size: 18px;">
        Ticket #${ticket.ticket_no} Update: ${formattedStatus}
      </h1>
      <p>Hi ${ticket.name},</p>
      <p>The status of your support ticket <strong>"${ticket.subject}"</strong> has been updated to <strong style="color: ${isResolved ? "#059669" : "#2563eb"};">${formattedStatus}</strong>.</p>
      ${isResolved ? "<p>We hope we answered your questions to your satisfaction! If you need further assistance, feel free to reply or submit a new ticket.</p>" : "<p>Our team is currently handling your request and will follow up shortly.</p>"}
      <p style="text-align: center; margin-top: 24px;">
        <a href="${baseUrl}/track/${ticket.ticket_no}" style="display: inline-block; padding: 12px 28px; background: #059669; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">View Ticket Details</a>
      </p>
    `;
    const htmlContent = wrapEmailHtml(bodyHtml, {
      preheader: `Ticket #${ticket.ticket_no} has been updated to ${formattedStatus}`,
    });
    await sendEmail(ticket.email, `Update on Ticket #${ticket.ticket_no} - ${formattedStatus}`, htmlContent);
  }
};
