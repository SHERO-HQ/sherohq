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
  }
};
