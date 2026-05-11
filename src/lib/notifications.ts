import nodemailer from "nodemailer";
import { Resend } from "resend";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  postalCode?: string;
}

const toReadableOrderId = (orderId: string): string => {
  const compact = String(orderId ?? "").replace(/-/g, "").trim();
  if (!compact) return "ORD-UNKNOWN";
  return `ORD-${compact.slice(0, 8).toUpperCase()}`;
};

class NotificationService {
  private transporter: nodemailer.Transporter | null = null;
  private resend: Resend | null = null;

  constructor() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, RESEND_API_KEY } = process.env;

    if (RESEND_API_KEY && !RESEND_API_KEY.includes("your_api_key")) {
      this.resend = new Resend(RESEND_API_KEY);
    } else if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });
    }
  }

  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    options: { throwOnError?: boolean } = {},
  ) {
    try {
      if (this.resend) {
        await this.resend.emails.send({
          from: process.env.RESEND_FROM || "onboarding@resend.dev",
          to,
          subject,
          html,
        });
      } else if (this.transporter) {
        await this.transporter.sendMail({
          from: process.env.SMTP_USER,
          to,
          subject,
          html,
        });
      } else {
        console.log(`[Email Simulation] To: ${to}, Subject: ${subject}`);
      }
    } catch (error) {
      console.error("❌ [Email Error]:", error);
      if (options.throwOnError) {
        throw error;
      }
    }
  }

  public async sendNewsletterCampaignEmail(
    to: string,
    subject: string,
    content: string,
    unsubscribeUrl: string
  ) {
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="margin-bottom: 20px; white-space: pre-wrap;">${content}</div>
        <hr />
        <p style="font-size: 12px; color: #666; text-align: center;">
          You are receiving this because you subscribed to SHERO TECHNOLOGIES updates.
          <br />
          <a href="${unsubscribeUrl}">Unsubscribe</a>
        </p>
      </div>
    `;
    await this.sendEmail(to, subject, htmlContent, { throwOnError: true });
  }

  public async sendOrderConfirmation(
    orderId: string,
    shippingInfo: ShippingInfo,
    items: OrderItem[],
    total: number
  ) {
    const readableOrderId = toReadableOrderId(orderId);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com";
    
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name} x ${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">GH₵${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join("");

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h1 style="color: #059669; text-align: center;">Order Confirmed!</h1>
        <p>Hi ${shippingInfo.firstName},</p>
        <p>Thank you for your order at <strong>SHERO TECHNOLOGIES</strong>.</p>
        <div style="background: #f9fafb; padding: 15px; border-radius: 3px; margin: 20px 0;">
          <p><strong>Order ID:</strong> ${readableOrderId}</p>
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsHtml}
            <tr>
              <td style="padding: 8px; font-weight: bold;">Total</td>
              <td style="padding: 8px; font-weight: bold; text-align: right;">GH₵${total.toFixed(2)}</td>
            </tr>
          </table>
        </div>
        <p>Track your order here: <a href="${baseUrl}/track/${orderId}">${baseUrl}/track/${orderId}</a></p>
      </div>
    `;

    await this.sendEmail(shippingInfo.email, `Order Confirmation - ${readableOrderId}`, htmlContent);
    
    // Admin alert
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "info.sherohq@gmail.com";
    await this.sendEmail(adminEmail, `🚨 NEW ORDER: ${readableOrderId}`, `
      <h2>New Order Received!</h2>
      <p>Customer: ${shippingInfo.firstName} ${shippingInfo.lastName}</p>
      <p>Total: GH₵${total.toFixed(2)}</p>
      <p><a href="${baseUrl}/admin/orders/${orderId}">View in Admin Panel</a></p>
    `);
  }
}

export const notificationService = new NotificationService();
