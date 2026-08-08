import { sendEmail, wrapEmailHtml } from "../core/email";

export const marketingNotifications = {
  async sendAbandonedCartEmail(
    email: string,
    firstName: string,
    items: any[],
    checkoutUrl: string,
  ) {
    const itemRows = items
      .map(
        (item: any) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
          <p style="margin: 0; font-weight: 600; color: #0f172a;">${item.name}</p>
          <p style="margin: 4px 0 0; font-size: 13px; color: #64748b;">Qty: ${item.quantity} | Price: GHS${Number(item.price).toFixed(2)}</p>
        </td>
      </tr>
    `,
      )
      .join("");

    const bodyHtml = `
      <h2 style="color: #0f172a; margin: 0 0 16px;">Hey ${firstName}, you left something behind!</h2>
      <p style="font-size: 13px; color: #334155; line-height: 1.6;">
        We noticed you left some amazing items in your cart. They're still waiting for you, but they might not stay in stock forever.
      </p>
      
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <h3 style="margin: 0 0 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">Your Cart</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${itemRows}
        </table>
      </div>

      <p style="text-align: center; margin: 32px 0;">
        <a href="${checkoutUrl}" style="display: inline-block; padding: 14px 32px; background: #059669; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px;">
          Complete Your Purchase
        </a>
      </p>
    `;

    const htmlContent = wrapEmailHtml(bodyHtml, {
      preheader: "Your SHERO cart is waiting for you."
    });

    await sendEmail(email, "Did you forget something? 🛒", htmlContent);
  },

  async sendNewsletterCampaignEmail(
    to: string,
    subject: string,
    content: string,
    unsubscribeUrl: string,
    requestId?: string,
  ) {
    const bodyHtml = `
      <div style="margin-bottom: 20px; white-space: pre-wrap;">${content}</div>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">
        You are receiving this because you subscribed to SHERO TECHNOLOGIES updates.<br />
        <a href="${unsubscribeUrl}" style="color: #059669;">Unsubscribe</a>
      </p>
    `;
    const htmlContent = wrapEmailHtml(bodyHtml, {
      hideFooterContact: true
    });
    await sendEmail(to, subject, htmlContent, {
      throwOnError: true,
      requestId
    });
  }
};
