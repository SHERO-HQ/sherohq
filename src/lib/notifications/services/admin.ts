import { COMPANY_EMAILS } from "@/constants/emails";
import { sendEmail, wrapEmailHtml } from "../core/email";

export const adminNotifications = {
  async sendLowStockAlert(productName: string, stockLeft: number) {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || COMPANY_EMAILS.HELLO;
    const isOutOfStock = stockLeft <= 0;

    const bodyHtml = `
      <h2 style="color: ${isOutOfStock ? "#dc2626" : "#d97706"}; margin: 0 0 16px;">
        ${isOutOfStock ? "🚨 OUT OF STOCK ALERT" : "⚠️ LOW STOCK WARNING"}
      </h2>
      <p><strong>Product:</strong> ${productName}</p>
      <p><strong>Remaining Stock:</strong> <span style="font-size: 13px; font-weight: bold; color: ${isOutOfStock ? "#dc2626" : "#d97706"}">${stockLeft}</span></p>
      <p style="margin-top: 16px;">Please log into the admin dashboard to restock this item.</p>
    `;

    const htmlContent = wrapEmailHtml(bodyHtml, {
      preheader: `Stock Alert: ${productName} has ${stockLeft} units left.`,
    });

    await sendEmail(
      adminEmail,
      `${isOutOfStock ? "🚨 OUT OF STOCK" : "⚠️ LOW STOCK"}: ${productName}`,
      htmlContent,
    );
  },
  
  async sendNewWhatsAppAlert(customerName: string, customerPhone: string, messageContent: string) {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || COMPANY_EMAILS.HELLO;

    const adminUrl = process.env.ADMIN_URL || process.env.NEXT_PUBLIC_ADMIN_URL || "https://admin.sherohq.com/admin/whatsapp";

    const bodyHtml = `
      <h2 style="color: #25D366; margin: 0 0 16px;">💬 New WhatsApp Message</h2>
      <p><strong>From:</strong> ${customerName} (${customerPhone})</p>
      <div style="background-color: #f3f4f6; padding: 12px; border-radius: 8px; margin: 16px 0; font-style: italic;">
        "${messageContent}"
      </div>
      <p>Please log into the admin dashboard to reply to this message.</p>
      <a href="${adminUrl}" style="display: inline-block; background-color: #25D366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Open Dashboard</a>
    `;

    const htmlContent = wrapEmailHtml(bodyHtml, {
      preheader: `New WhatsApp message from ${customerName}`,
    });

    await sendEmail(
      adminEmail,
      `New WhatsApp Message from ${customerName}`,
      htmlContent,
    );
  }
};
