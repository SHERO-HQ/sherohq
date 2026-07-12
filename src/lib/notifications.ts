import nodemailer from "nodemailer";
import { Resend } from "resend";
import { COMPANY_CONTACTS } from "@/constants/contacts";
import { COMPANY_EMAILS } from "@/constants/emails";
import { SOCIAL_LINKS } from "@/constants/socials";
import { logActivity } from "@/lib/activity";
import { generateInvoicePdf } from "./pdfInvoice";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface ShippingInfo {
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
  const compact = String(orderId ?? "")
    .replace(/-/g, "")
    .trim();
  if (!compact) return "ORD-UNKNOWN";
  return `ORD-${compact.slice(0, 8).toUpperCase()}`;
};

class NotificationService {
  private transporter: nodemailer.Transporter | null = null;
  private resend: Resend | null = null;

  constructor() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, RESEND_API_KEY } =
      process.env;

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

  /**
   * Wrap email body HTML with a branded header (logo) and footer.
   * Uses a PNG logo hosted on the site since SVG is poorly supported in email clients.
   */
  private wrapEmailHtml(bodyHtml: string, options?: { hideFooterContact?: boolean; preheader?: string }): string {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com";
    const logoUrl = `${baseUrl.replace(/\/$/, "")}/assets/logo/shero.png`;
    const year = new Date().getFullYear();

    const preheaderHtml = options?.preheader
      ? `<div style="display: none; max-height: 0px; overflow: hidden;">${options.preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>`
      : "";

    return `
      ${preheaderHtml}
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header with Logo -->
        <div style="text-align: center; padding: 28px 20px 20px; border-bottom: 2px solid #059669;">
          <a href="${baseUrl}" target="_blank" style="text-decoration: none;">
            <img src="${logoUrl}" alt="SHERO TECHNOLOGIES" width="48" height="48" style="display: inline-block; vertical-align: middle;" />
          </a>
          <div style="margin-top: 8px; font-size: 16px; font-weight: 700; color: #0f172a; letter-spacing: 1px;">SHERO TECHNOLOGIES</div>
        </div>

        <!-- Body -->
        <div style="padding: 28px 24px 12px;">
          ${bodyHtml}
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6;">
          ${!options?.hideFooterContact ? `
            <p style="margin: 0 0 8px;">Need help? <a href="https://wa.me/${COMPANY_CONTACTS.WHATSAPP}" style="color: #059669; text-decoration: none;">WhatsApp</a> · <a href="mailto:${COMPANY_EMAILS.SUPPORT}" style="color: #059669; text-decoration: none;">${COMPANY_EMAILS.SUPPORT}</a></p>
          ` : ""}
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

  private getEmailProviderName() {
    if (this.resend) return "Resend";
    if (this.transporter) return "SMTP";
    return null;
  }

  private getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error);
  }

  private formatToInternationalPhone(phone: string): string {
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("0") && digits.length === 10) {
      return `233${digits.slice(1)}`;
    }
    if (digits.startsWith("233") && digits.length === 12) {
      return digits;
    }
    return digits;
  }

  private async sendWhatsAppNotification(to: string, message: string) {
    const { WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID } = process.env;
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      console.warn(`[WhatsApp Token Missing - Simulation] To: ${to}`);
      return;
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to,
            type: "text",
            text: { preview_url: false, body: message },
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Meta API response error");
      }
      console.log(`✅ WhatsApp alert sent successfully to ${to}`);
    } catch (error) {
      const msg = this.getErrorMessage(error);
      console.error(`❌ WhatsApp Cloud API error for ${to}:`, error);
      logActivity(null, "system_alert", "error", `WhatsApp notification failed for ${to}: ${msg}`).catch(() => {});
    }
  }

  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    options: { throwOnError?: boolean; requestId?: string; attachments?: { filename: string; content: Buffer }[] } = {},
  ) {
    const logPrefix = options.requestId
      ? `[Newsletter ${options.requestId}]`
      : "[Newsletter]";

    try {
      if (this.resend) {
        const from = process.env.RESEND_FROM?.trim();
        if (!from) {
          throw new Error(
            "RESEND_FROM is required for Resend email delivery. Set a verified sender such as SHERO TECHNOLOGIES <newsletter@your-domain.com>.",
          );
        }

        const result = await this.resend.emails.send({
          from,
          to,
          subject,
          html,
          attachments: options.attachments,
        });

        if (result.error) {
          throw new Error(`Resend rejected the email: ${result.error.message}`);
        }
      } else if (this.transporter) {
        await this.transporter.sendMail({
          from: process.env.SMTP_USER,
          to,
          subject,
          html,
          attachments: options.attachments,
        });
      } else {
        if (process.env.NODE_ENV === "production" && options.throwOnError) {
          throw new Error(
            "Email delivery is not configured. Set RESEND_API_KEY and RESEND_FROM, or SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.",
          );
        }

        if (process.env.NODE_ENV !== "production") {
          console.log(
            `${logPrefix} [Email Simulation] To: ${to}, Subject: ${subject}`,
          );
        }
      }
    } catch (error) {
      const msg = this.getErrorMessage(error);
      console.error(`${logPrefix} ❌ [Email Error]:`, error);
      
      // Log to database so admin is aware
      logActivity(null, "system_alert", "error", `Email delivery failed for ${to}: ${msg}`).catch(() => {});

      if (options.throwOnError) {
        const provider = this.getEmailProviderName();
        const providerPrefix = provider
          ? `${provider} email delivery failed`
          : "Email delivery failed";
        throw new Error(`${providerPrefix}: ${msg}`);
      }
    }
  }

  public async sendWelcomeEmail(email: string, name: string) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com";
    const bodyHtml = `
      <h1 style="color: #059669; text-align: center; margin: 0 0 20px;">Welcome to SHERO TECHNOLOGIES!</h1>
      <p>Hi ${name},</p>
      <p>We're thrilled to have you here. Your account has been successfully created.</p>
      <p>Start exploring the best technology products, gadgets, and accessories today.</p>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${baseUrl}/shop" style="display: inline-block; padding: 12px 32px; background: #059669; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Start Shopping</a>
      </p>
    `;
    const htmlContent = this.wrapEmailHtml(bodyHtml, { preheader: "Welcome to SHERO! Let's get started." });
    await this.sendEmail(email, "Welcome to SHERO TECHNOLOGIES!", htmlContent);
  }

  public async sendPasswordResetEmail(email: string, name: string, resetLink: string) {
    const bodyHtml = `
      <h1 style="text-align: center; margin: 0 0 20px;">Reset Your Password</h1>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password for your SHERO TECHNOLOGIES account.</p>
      <p>Click the button below to set a new password. This link is valid for 1 hour.</p>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${resetLink}" style="display: inline-block; padding: 12px 32px; background: #0f172a; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
      </p>
      <p style="margin-top: 24px; font-size: 13px; color: #64748b;">If you didn't request this, you can safely ignore this email.</p>
    `;
    const htmlContent = this.wrapEmailHtml(bodyHtml, { preheader: "Action required: Reset your SHERO password." });
    await this.sendEmail(email, "Reset Your Password", htmlContent);
  }

  public async sendLowStockAlert(productName: string, stockLeft: number) {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || COMPANY_EMAILS.INFO;
    const isOutOfStock = stockLeft <= 0;
    
    const bodyHtml = `
      <h2 style="color: ${isOutOfStock ? '#dc2626' : '#d97706'}; margin: 0 0 16px;">
        ${isOutOfStock ? '🚨 OUT OF STOCK ALERT' : '⚠️ LOW STOCK WARNING'}
      </h2>
      <p><strong>Product:</strong> ${productName}</p>
      <p><strong>Remaining Stock:</strong> <span style="font-size: 18px; font-weight: bold; color: ${isOutOfStock ? '#dc2626' : '#d97706'}">${stockLeft}</span></p>
      <p style="margin-top: 16px;">Please log into the admin dashboard to restock this item.</p>
    `;

    const htmlContent = this.wrapEmailHtml(bodyHtml, { preheader: `Stock Alert: ${productName} has ${stockLeft} units left.` });

    await this.sendEmail(
      adminEmail,
      `${isOutOfStock ? '🚨 OUT OF STOCK' : '⚠️ LOW STOCK'}: ${productName}`,
      htmlContent
    );
  }

  public async sendAbandonedCartEmail(
    email: string,
    firstName: string,
    items: any[],
    checkoutUrl: string
  ) {
    const itemRows = items.map((item: any) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
          <p style="margin: 0; font-weight: 600; color: #0f172a;">${item.name}</p>
          <p style="margin: 4px 0 0; font-size: 13px; color: #64748b;">Qty: ${item.quantity} | Price: GH₵${Number(item.price).toFixed(2)}</p>
        </td>
      </tr>
    `).join("");

    const bodyHtml = `
      <h2 style="color: #0f172a; margin: 0 0 16px;">Hey ${firstName}, you left something behind!</h2>
      <p style="font-size: 16px; color: #334155; line-height: 1.6;">
        We noticed you left some amazing items in your cart. They're still waiting for you, but they might not stay in stock forever.
      </p>
      
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <h3 style="margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">Your Cart</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${itemRows}
        </table>
      </div>

      <p style="text-align: center; margin: 32px 0;">
        <a href="${checkoutUrl}" style="display: inline-block; padding: 14px 32px; background: #059669; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
          Complete Your Purchase
        </a>
      </p>
    `;

    const htmlContent = this.wrapEmailHtml(bodyHtml, { preheader: "Your SHERO cart is waiting for you." });

    await this.sendEmail(email, "Did you forget something? 🛒", htmlContent);
  }

  public async sendNewsletterCampaignEmail(
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
    const htmlContent = this.wrapEmailHtml(bodyHtml, { hideFooterContact: true });
    await this.sendEmail(to, subject, htmlContent, {
      throwOnError: true,
      requestId,
    });
  }

  public async sendOrderConfirmation(
    orderId: string,
    shippingInfo: ShippingInfo,
    items: OrderItem[],
    total: number,
    paymentMethod?: string,
  ) {
    const readableOrderId = toReadableOrderId(orderId);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com";

    // Derive subtotal and shipping from items vs. the stored total
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = Math.max(0, Math.round((total - subtotal) * 100) / 100);
    const isFreeShipping = shipping === 0;

    // Estimated delivery: 3-5 business days from now
    const deliveryStart = new Date();
    let addedDays = 0;
    while (addedDays < 3) {
      deliveryStart.setDate(deliveryStart.getDate() + 1);
      if (deliveryStart.getDay() !== 0 && deliveryStart.getDay() !== 6) addedDays++;
    }
    const deliveryEnd = new Date(deliveryStart);
    addedDays = 0;
    while (addedDays < 2) {
      deliveryEnd.setDate(deliveryEnd.getDate() + 1);
      if (deliveryEnd.getDay() !== 0 && deliveryEnd.getDay() !== 6) addedDays++;
    }
    const dateOpts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    const deliveryRange = `${deliveryStart.toLocaleDateString("en-GH", dateOpts)} – ${deliveryEnd.toLocaleDateString("en-GH", dateOpts)}`;

    // Build item rows
    const itemsHtml = items
      .map(
        (item) => {
          const imgUrl = item.image && !item.image.startsWith("http") 
            ? `${baseUrl}${item.image}` 
            : item.image || "";
          
          const imgHtml = imgUrl 
            ? `<img src="${imgUrl}" alt="${item.name}" width="40" height="40" style="border-radius: 4px; object-fit: cover; margin-right: 12px; border: 1px solid #e2e8f0; vertical-align: middle;" />`
            : "";

          return `
          <tr>
            <td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; color: #334155;">
              <table style="border: 0; padding: 0; margin: 0; border-collapse: collapse;">
                <tr>
                  <td style="padding: 0;">${imgHtml}</td>
                  <td style="padding: 0; vertical-align: middle;">
                    <strong style="display: block; margin-bottom: 2px;">${item.name}</strong>
                    <span style="font-size: 12px; color: #94a3b8;">Qty: ${item.quantity} × GH₵${item.price.toFixed(2)}</span>
                  </td>
                </tr>
              </table>
            </td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #0f172a; font-weight: 600; white-space: nowrap; vertical-align: top;">
              GH₵${(item.price * item.quantity).toFixed(2)}
            </td>
          </tr>`;
        }
      )
      .join("");

    const orderDate = new Date().toLocaleString("en-GH", { 
      year: "numeric", month: "short", day: "numeric", 
      hour: "numeric", minute: "2-digit", hour12: true 
    });

    const bodyHtml = `
      <h1 style="color: #059669; text-align: center; margin: 0 0 8px;">Order Confirmed!</h1>
      <p style="text-align: center; color: #64748b; font-size: 14px; margin: 0 0 24px;">Order <strong style="color: #0f172a;">${readableOrderId}</strong> &middot; ${orderDate}</p>

      <p style="margin: 0 0 20px;">Hi ${shippingInfo.firstName},</p>
      <p style="margin: 0 0 24px;">Thank you for your order at <strong>SHERO TECHNOLOGIES</strong>. Here's your receipt:</p>

      <!-- Items Table -->
      <div style="background: #f8fafc; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f1f5f9;">
              <th style="padding: 10px 8px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600;">Item</th>
              <th style="padding: 10px 8px; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Summary Rows -->
        <div style="padding: 12px 8px 4px; border-top: 2px solid #e2e8f0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Subtotal</td>
              <td style="padding: 6px 0; text-align: right; color: #334155; font-size: 14px;">GH₵${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Shipping</td>
              <td style="padding: 6px 0; text-align: right; font-size: 14px;">
                ${isFreeShipping
                  ? '<span style="color: #059669; font-weight: 600;">FREE</span>'
                  : `<span style="color: #334155;">GH₵${shipping.toFixed(2)}</span>`
                }
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 8px 0 0;"><div style="border-top: 1px solid #e2e8f0;"></div></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: 700; font-size: 16px; color: #0f172a;">Total</td>
              <td style="padding: 10px 0; text-align: right; font-weight: 700; font-size: 18px; color: #059669;">GH₵${total.toFixed(2)}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Delivery Info -->
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: top; width: 50%; padding: 4px 8px 4px 0;">
              <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #16a34a; font-weight: 600;">Estimated Delivery</p>
              <p style="margin: 0; font-size: 14px; color: #0f172a; font-weight: 600;">${deliveryRange}</p>
              <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">3–5 business days</p>

              ${paymentMethod ? `
                <p style="margin: 16px 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #16a34a; font-weight: 600;">Payment Method</p>
                <p style="margin: 0; font-size: 14px; color: #0f172a; font-weight: 600;">${
                  paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' :
                  paymentMethod === 'store_pickup' ? 'Store Pickup' :
                  paymentMethod === 'card' ? 'Card Payment' :
                  paymentMethod === 'momo' ? 'Mobile Money' : 'Paid'
                }</p>
              ` : ''}
            </td>
            <td style="vertical-align: top; width: 50%; padding: 4px 0 4px 8px; border-left: 1px solid #bbf7d0;">
              <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #16a34a; font-weight: 600;">Delivery Address</p>
              <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.5;">${shippingInfo.address}<br />${shippingInfo.city}, ${shippingInfo.region}</p>
            </td>
          </tr>
        </table>
      </div>

      <!-- CTA -->
      <p style="text-align: center; margin: 0 0 24px;">
        <a href="${baseUrl}/track/${orderId}" style="display: inline-block; padding: 12px 32px; background: #059669; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px;">Track Your Order</a>
      </p>

      <!-- Referral Nudge -->
      <div style="background: #f8fafc; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 12px; border: 1px solid #e2e8f0;">
        <p style="margin: 0 0 8px; font-size: 16px; font-weight: 600; color: #0f172a;">Love SHERO?</p>
        <p style="margin: 0 0 16px; font-size: 14px; color: #64748b;">Share the experience with a friend and they'll thank you later.</p>
        <a href="${baseUrl}" style="color: #059669; font-weight: 600; text-decoration: none;">Share SHERO Store →</a>
      </div>
    `;
    const htmlContent = this.wrapEmailHtml(bodyHtml, { preheader: "Thank you for your order! Here's your receipt." });

    let attachments;
    try {
      const pdfBuffer = await generateInvoicePdf(orderId, shippingInfo, items, total, paymentMethod || "cash_on_delivery");
      attachments = [{ filename: `Invoice-${readableOrderId}.pdf`, content: pdfBuffer }];
    } catch (e) {
      console.error("Failed to generate PDF invoice:", e);
    }

    await this.sendEmail(
      shippingInfo.email,
      `Order Confirmation - ${readableOrderId}`,
      htmlContent,
      { attachments }
    );

    // Admin alert
    const adminEmail =
      process.env.ADMIN_NOTIFICATION_EMAIL || COMPANY_EMAILS.INFO;
    await this.sendEmail(
      adminEmail,
      `🚨 NEW ORDER: ${readableOrderId}`,
      this.wrapEmailHtml(`
        <h2 style="color: #059669; margin: 0 0 16px;">🚨 New Order Received!</h2>
        <p><strong>Customer:</strong> ${shippingInfo.firstName} ${shippingInfo.lastName}</p>
        <p><strong>Phone:</strong> ${shippingInfo.phone}</p>
        <p><strong>Total:</strong> GH₵${total.toFixed(2)}</p>
        <p style="text-align: center; margin-top: 20px;">
          <a href="${baseUrl}/admin/orders/${orderId}" style="display: inline-block; padding: 10px 28px; background: #059669; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">View in Admin Panel</a>
        </p>
      `),
    );

    // -------------------------------------------------------------------------
    // WhatsApp Notifications (Meta Business Cloud API)
    // -------------------------------------------------------------------------
    
    // 1. Alert Admin
    const adminWhatsapp = process.env.ADMIN_WHATSAPP_NUMBER || COMPANY_CONTACTS.WHATSAPP;
    const adminAlertText = 
      `🚨 *NEW ORDER RECEIVED!*\n\n` +
      `📦 *Order ID:* ${readableOrderId}\n` +
      `👤 *Customer:* ${shippingInfo.firstName} ${shippingInfo.lastName}\n` +
      `💰 *Total:* GHS ${total.toFixed(2)}\n` +
      `📞 *Phone:* ${shippingInfo.phone}\n` +
      `📍 *Region:* ${shippingInfo.region} - ${shippingInfo.city}\n\n` +
      `🔗 _View in Admin:_ ${baseUrl}/admin/orders/${orderId}`;
    
    this.sendWhatsAppNotification(adminWhatsapp, adminAlertText)
      .catch((err) => console.error("Admin WhatsApp notification failed:", err));

    // 2. Alert Customer
    const customerPhone = this.formatToInternationalPhone(shippingInfo.phone);
    if (customerPhone) {
      const customerMsg =
        `Hi ${shippingInfo.firstName},\n\n` +
        `Thank you for shopping at *SHERO TECHNOLOGIES*!\n\n` +
        `We have successfully received your order *${readableOrderId}*.\n\n` +
        `💰 *Total:* GHS ${total.toFixed(2)}\n` +
        `📍 *Delivery Details:* ${shippingInfo.address}, ${shippingInfo.city}\n\n` +
        `🔗 *Live Track:* ${baseUrl}/track/${orderId}\n\n` +
        `If you need immediate support, reply directly to this chat. Thank you for choosing SHERO!`;
      
      this.sendWhatsAppNotification(customerPhone, customerMsg)
        .catch((err) => console.error("Customer WhatsApp notification failed:", err));
    }
  }

  public async sendOrderStatusUpdateNotification(
    orderId: string,
    newStatus: string,
    shippingInfo: ShippingInfo,
    items?: OrderItem[],
    total?: number,
  ) {
    const readableOrderId = toReadableOrderId(orderId);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com";
    
    let title = "Order Update";
    let message = `There is an update on your order <strong>${readableOrderId}</strong>.`;
    let preheader = "Update on your SHERO order.";

    if (newStatus === "shipped") {
      title = "Your Order is on the Way!";
      message = `Great news, ${shippingInfo.firstName}! Your order <strong>${readableOrderId}</strong> has been shipped and is on its way to you.`;
      preheader = "Your SHERO order has shipped!";
    } else if (newStatus === "delivered") {
      title = "Your Order has been Delivered!";
      message = `Hi ${shippingInfo.firstName}, your order <strong>${readableOrderId}</strong> has been delivered. We hope you love your new gear!`;
      preheader = "Your SHERO order has been delivered!";
    }

    const bodyHtml = `
      <h1 style="color: #059669; text-align: center; margin: 0 0 20px;">${title}</h1>
      <p style="margin: 0 0 16px;">${message}</p>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${baseUrl}/track/${orderId}" style="display: inline-block; padding: 12px 32px; background: #059669; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Track Your Order</a>
      </p>
    `;
    
    const htmlContent = this.wrapEmailHtml(bodyHtml, { preheader });

    await this.sendEmail(
      shippingInfo.email,
      `Order Update: ${title}`,
      htmlContent,
    );

    // WhatsApp Notification
    const customerPhone = this.formatToInternationalPhone(shippingInfo.phone);
    if (customerPhone) {
      let waMessage = `Hi ${shippingInfo.firstName},\n\nThere is an update on your order *${readableOrderId}* at *SHERO TECHNOLOGIES*.\n\n`;
      if (newStatus === "shipped") waMessage = `Hi ${shippingInfo.firstName} 🚚\n\nYour order *${readableOrderId}* from *SHERO TECHNOLOGIES* has been shipped and is on its way to you!\n\n`;
      if (newStatus === "delivered") waMessage = `Hi ${shippingInfo.firstName} 🎉\n\nYour order *${readableOrderId}* from *SHERO TECHNOLOGIES* has been delivered!\n\nWe hope you love it.\n\n`;
      
      waMessage += `🔗 *Track your order:* ${baseUrl}/track/${orderId}`;
      
      this.sendWhatsAppNotification(customerPhone, waMessage)
        .catch((err) => console.error("Customer WhatsApp status update notification failed:", err));
    }
  }

  public async sendReviewRequestNotification(
    orderId: string,
    shippingInfo: ShippingInfo,
  ) {
    const readableOrderId = toReadableOrderId(orderId);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com";

    const bodyHtml = `
      <h1 style="color: #059669; text-align: center; margin: 0 0 20px;">How did we do?</h1>
      <p style="margin: 0 0 16px;">Hi ${shippingInfo.firstName},</p>
      <p style="margin: 0 0 16px;">Your order <strong>${readableOrderId}</strong> was recently delivered. We'd love to hear about your experience!</p>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${baseUrl}/feedback?order=${orderId}" style="display: inline-block; padding: 12px 32px; background: #0f172a; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Leave a Review</a>
      </p>
    `;
    
    const htmlContent = this.wrapEmailHtml(bodyHtml, { preheader: "How was your experience with SHERO?" });

    await this.sendEmail(
      shippingInfo.email,
      `How was your order ${readableOrderId}?`,
      htmlContent,
    );
  }

  public async sendPaymentFailureNotification(
    orderId: string,
    shippingInfo: ShippingInfo,
  ) {
    const readableOrderId = toReadableOrderId(orderId);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com";

    const bodyHtml = `
      <h1 style="color: #dc2626; text-align: center; margin: 0 0 20px;">Payment Was Not Completed</h1>
      <p>Hi ${shippingInfo.firstName},</p>
      <p>Unfortunately, your payment for order <strong>${readableOrderId}</strong> could not be processed successfully.</p>
      <p>Don't worry — no money has been deducted from your account. You can try again or contact our support team for assistance.</p>
      <p style="text-align: center; margin-top: 20px;">
        <a href="${baseUrl}/shop/checkout?retry=${orderId}" style="display: inline-block; padding: 10px 28px; background: #059669; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Try Again</a>
      </p>
      <p style="text-align: center; margin-top: 8px;">
        <a href="${baseUrl}/track/${orderId}" style="color: #059669; text-decoration: none;">View your order details →</a>
      </p>
    `;
    const htmlContent = this.wrapEmailHtml(bodyHtml);

    await this.sendEmail(
      shippingInfo.email,
      `Payment Failed - Order ${readableOrderId}`,
      htmlContent,
    );

    // Alert Customer via WhatsApp
    const customerPhone = this.formatToInternationalPhone(shippingInfo.phone);
    if (customerPhone) {
      const customerMsg =
        `Hi ${shippingInfo.firstName},\n\n` +
        `Unfortunately, the payment for your order *${readableOrderId}* at *SHERO TECHNOLOGIES* failed.\n\n` +
        `You can try again or contact us for help.\n\n` +
        `🔗 *View Order:* ${baseUrl}/track/${orderId}`;
      
      this.sendWhatsAppNotification(customerPhone, customerMsg)
        .catch((err) => console.error("Customer WhatsApp failure notification failed:", err));
    }
  }
}

export const notificationService = new NotificationService();
