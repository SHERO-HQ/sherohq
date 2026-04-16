import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { Resend } from "resend";
import * as dotenv from "dotenv";

dotenv.config();

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
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

class NotificationService {
  private transporter: nodemailer.Transporter | null = null;
  private resend: Resend | null = null;

  private initPromise: Promise<void> | null = null;

  private async ensureInitialized() {
    this.initPromise ??= this.initEmail();
    return this.initPromise;
  }

  private async initEmail() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, RESEND_API_KEY } =
      process.env;

    // Prioritize Resend for production stability
    if (RESEND_API_KEY && !RESEND_API_KEY.includes("your_api_key")) {
      this.resend = new Resend(RESEND_API_KEY);
      console.log("🚀 Email service initialized with Resend (API-based).");
      return;
    } else {
      console.log(
        "ℹ️ Resend API Key not found or using placeholder. Falling back to SMTP check...",
      );
    }

    if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number.parseInt(SMTP_PORT),
        secure: Number.parseInt(SMTP_PORT) === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
        tls: {
          // Default: reject self-signed/invalid certs (secure by default in all environments).
          // Set SMTP_ALLOW_SELF_SIGNED=true only for SMTP providers that use self-signed certs.
          rejectUnauthorized: process.env.SMTP_ALLOW_SELF_SIGNED !== "true",
        },
        family: 4,
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 10000,
        logger: process.env.NODE_ENV !== "production",
        debug: process.env.NODE_ENV !== "production",
      } as SMTPTransport.Options);

      try {
        await this.transporter.verify();
        console.log("✅ SMTP connection verified successfully.");
      } catch (error) {
        console.error(
          "❌ SMTP verification failed during initialization:",
          error,
        );
      }
      console.log("📧 Email service initialized with custom SMTP settings.");
    } else {
      console.log(
        "⚠️ No email provider configured. Email notifications will be LOGGED ONLY.",
      );
      if (process.env.NODE_ENV === "production") {
        console.warn(
          "❗ WARNING: Email is in SIMULATION mode in production because credentials (SMTP or RESEND) are missing.",
        );
      }
    }
  }

  public async sendOrderConfirmation(
    orderId: string,
    shippingInfo: ShippingInfo,
    items: OrderItem[],
    total: number,
  ) {
    await this.ensureInitialized();
    console.log(`\n--- 🔔 ORDER NOTIFICATION [Order: ${orderId}] ---`);

    await this.sendOrderEmail(orderId, shippingInfo, items, total);
    await this.sendSMS(orderId, shippingInfo);

    console.log(`--- 🏁 END NOTIFICATION ---\n`);
  }

  private async sendOrderEmail(
    orderId: string,
    shippingInfo: ShippingInfo,
    items: OrderItem[],
    total: number,
  ) {
    const itemsHtml = items
      .map(
        (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name} x ${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">GH₵${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `,
      )
      .join("");

    const baseUrl =
      process.env.FRONTEND_URL?.replace(/\/$/, "") || "https://sherohq.com";
    const logoUrl = `${baseUrl}/shero.png`;

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${logoUrl}" alt="SHERO TECHNOLOGIES" style="height: 40px;" />
        </div>
        <h1 style="color: #059669; text-align: center;">Order Confirmed!</h1>
        <p>Hi ${shippingInfo.firstName},</p>
        <p>Thank you for your order at <strong>SHERO TECHNOLOGIES</strong>. We've received your order and are processing it.</p>
        
        <div style="background: #f9fafb; padding: 15px; border-radius: 3px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Details</h3>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsHtml}
            <tr>
              <td style="padding: 8px; font-weight: bold;">Total</td>
              <td style="padding: 8px; font-weight: bold; text-align: right;">GH₵${total.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <div style="margin: 20px 0;">
          <h3>Shipping To:</h3>
          <p>${shippingInfo.firstName} ${shippingInfo.lastName}<br>
          ${shippingInfo.address}, ${shippingInfo.city}<br>
          ${shippingInfo.region} ${shippingInfo.postalCode || ""}</p>
        </div>

        <p style="font-size: 12px; color: #666; text-align: center; margin-top: 30px;">
          If you have any questions, please contact our support team at support@sherohq.com or call us at +233 54 871 1582.
        </p>
      </div>
    `;

    await this.sendEmail(
      shippingInfo.email,
      `Order Confirmation - #${orderId.substring(0, 8)}`,
      htmlContent,
      "info",
    );
  }

  public async sendInvoice(
    orderId: string,
    shippingInfo: ShippingInfo,
    items: OrderItem[],
    total: number,
  ) {
    if (!shippingInfo.email) return;

    await this.ensureInitialized();

    const shortOrderId = orderId.slice(0, 8).toUpperCase();
    const invoiceDate = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333;">${item.name} <span style="color: #666; font-size: 12px;">x${item.quantity}</span></td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; color: #333; font-weight: 500;">GH₵${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
      `,
      )
      .join("");

    const logoUrl = process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL}/shero.png`
      : "https://sherohq.com/shero.png";

    const subject = `Invoice #${shortOrderId} from SHERO Technologies`;

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
           <img src="${logoUrl}" alt="SHERO" style="height: 40px; margin-bottom: 20px;" />
          <h1 style="color: #059669; margin: 0;">We've Created an Invoice</h1>
          <p style="color: #666; font-size: 14px; margin-top: 10px;">Please review the invoice below.</p>
        </div>

        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="font-size: 16px; margin: 0 0 15px 0; color: #333;">Invoice Details</h2>
          <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>Invoice ID:</strong> #${shortOrderId}</p>
          <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>Date:</strong> ${invoiceDate}</p>
          <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>Status:</strong> Pending Payment</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr>
              <th style="text-align: left; color: #666; font-size: 12px; text-transform: uppercase; padding-bottom: 10px; border-bottom: 2px solid #eee;">Item</th>
              <th style="text-align: right; color: #666; font-size: 12px; text-transform: uppercase; padding-bottom: 10px; border-bottom: 2px solid #eee;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td style="padding-top: 20px; text-align: right; color: #666; font-weight: bold;">Total Due:</td>
              <td style="padding-top: 20px; text-align: right; color: #059669; font-size: 18px; font-weight: bold;">GH₵${total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <div style="text-align: center; margin-top: 40px;">
          <a href="${process.env.FRONTEND_URL}/checkout/${orderId}" style="display: inline-block; background: #059669; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 16px;">Pay Invoice Now</a>
        </div>

        <div style="margin-top: 40px; pt: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
          <p>SHERO Technologies</p>
          <p>If you have any questions, please reply to this email.</p>
        </div>
      </div>
    `;

    try {
      await this.sendEmail(shippingInfo.email, subject, htmlContent);
      console.log(`✅ Invoice sent to ${shippingInfo.email}`);
    } catch (error) {
      console.error(
        `❌ Failed to send invoice to ${shippingInfo.email}:`,
        error,
      );
      throw error;
    }
  }

  public async sendQuote(
    orderId: string,
    shippingInfo: ShippingInfo,
    items: OrderItem[],
    total: number,
  ) {
    if (!shippingInfo.email) return;

    await this.ensureInitialized();

    const shortOrderId = orderId.slice(0, 8).toUpperCase();
    const quoteDate = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333;">${item.name} <span style="color: #666; font-size: 12px;">x${item.quantity}</span></td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; color: #333; font-weight: 500;">GH₵${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
      `,
      )
      .join("");

    const logoUrl = process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL}/shero.png`
      : "https://sherohq.com/shero.png";

    const subject = `Quote #${shortOrderId} from SHERO Technologies`;

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
           <img src="${logoUrl}" alt="SHERO" style="height: 40px; margin-bottom: 20px;" />
          <h1 style="color: #2563EB; margin: 0;">Here is your Quote</h1>
          <p style="color: #666; font-size: 14px; margin-top: 10px;">Thank you for your interest. Please review the quote below.</p>
        </div>

        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="font-size: 16px; margin: 0 0 15px 0; color: #333;">Quote Details</h2>
          <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>Quote ID:</strong> #${shortOrderId}</p>
          <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>Date:</strong> ${quoteDate}</p>
          <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>Valid Until:</strong> 30 Days from date</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr>
              <th style="text-align: left; color: #666; font-size: 12px; text-transform: uppercase; padding-bottom: 10px; border-bottom: 2px solid #eee;">Item</th>
              <th style="text-align: right; color: #666; font-size: 12px; text-transform: uppercase; padding-bottom: 10px; border-bottom: 2px solid #eee;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td style="padding-top: 20px; text-align: right; color: #666; font-weight: bold;">Total Estimate:</td>
              <td style="padding-top: 20px; text-align: right; color: #2563EB; font-size: 18px; font-weight: bold;">GH₵${total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <div style="text-align: center; margin-top: 40px;">
          <p style="color: #666; font-style: italic;">To accept this quote, please reply to this email.</p>
        </div>

        <div style="margin-top: 40px; pt: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
          <p>SHERO Technologies</p>
          <p>Tamale, Ghana</p>
        </div>
      </div>
    `;

    try {
      await this.sendEmail(shippingInfo.email, subject, htmlContent);
      console.log(`✅ Quote sent to ${shippingInfo.email}`);
    } catch (error) {
      console.error(`❌ Failed to send quote to ${shippingInfo.email}:`, error);
      throw error;
    }
  }

  public async sendPaymentReceipt(
    orderId: string,
    shippingInfo: ShippingInfo,
    items: OrderItem[],
    total: number,
    paymentDetails?: { method: string; transactionId?: string },
  ) {
    await this.ensureInitialized();
    console.log(`\n--- 🧾 PAYMENT RECEIPT [Order: ${orderId}] ---`);

    await this.sendReceiptEmail(
      orderId,
      shippingInfo,
      items,
      total,
      paymentDetails,
    );

    console.log(`--- 🏁 END RECEIPT ---\n`);
  }

  private async sendReceiptEmail(
    orderId: string,
    shippingInfo: ShippingInfo,
    items: OrderItem[],
    total: number,
    paymentDetails?: { method: string; transactionId?: string },
  ) {
    const itemsHtml = items
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid #efefef;">
          <div style="font-weight: 600; color: #334155;">${item.name}</div>
          <div style="font-size: 12px; color: #64748b;">Qty: ${item.quantity}</div>
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #efefef; text-align: right; color: #334155;">
          GH₵${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `,
      )
      .join("");

    const thermalDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const baseUrl =
      process.env.FRONTEND_URL?.replace(/\/$/, "") || "https://sherohq.com";
    const logoUrl = `${baseUrl}/shero.png`;

    const htmlContent = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 0; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
        <div style="text-align: center; padding: 20px; border-bottom: 1px solid #f1f5f9;">
          <img src="${logoUrl}" alt="SHERO TECHNOLOGIES" style="height: 35px;" />
        </div>
        <!-- Header Arc -->
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 40px 20px; text-align: center; color: white;">
          <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; opacity: 0.9;">Payment Successful</div>
          <h1 style="margin: 0; font-size: 32px; font-weight: 800;">GH₵${total.toFixed(2)}</h1>
          <div style="margin-top: 12px; display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px;">
            Order #${orderId.substring(0, 8)}
          </div>
        </div>

        <div style="padding: 32px 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <p style="color: #64748b; margin: 0;">Hi ${shippingInfo.firstName},</p>
            <h2 style="color: #1e293b; margin: 8px 0 0; font-size: 20px;">Thank you for your payment!</h2>
            <p style="color: #64748b; font-size: 14px; margin-top: 8px;">Your transaction was completed successfully and your order is now being processed.</p>
          </div>

          <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 32px;">
            <h3 style="margin: 0 0 16px; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Transaction Detail</h3>
            <table style="width: 100%; font-size: 14px; color: #334155;">
              <tr>
                <td style="padding: 4px 0;">Date</td>
                <td style="padding: 4px 0; text-align: right; font-weight: 600;">${thermalDate}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;">Payment Method</td>
                <td style="padding: 4px 0; text-align: right; font-weight: 600; text-transform: capitalize;">${paymentDetails?.method || "Online Payment"}</td>
              </tr>
              ${
                paymentDetails?.transactionId
                  ? `
              <tr>
                <td style="padding: 4px 0;">Transaction ID</td>
                <td style="padding: 4px 0; text-align: right; font-weight: 600; font-family: monospace;">${paymentDetails.transactionId}</td>
              </tr>
              `
                  : ""
              }
            </table>
          </div>

          <h3 style="font-size: 16px; color: #1e293b; margin-bottom: 16px;">Items Summary</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
            ${itemsHtml}
            <tr>
              <td style="padding: 16px 8px; font-weight: 800; color: #1e293b; font-size: 18px;">Total Paid</td>
              <td style="padding: 16px 8px; font-weight: 800; color: #059669; font-size: 18px; text-align: right;">GH₵${total.toFixed(2)}</td>
            </tr>
          </table>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; text-align: center;">
            <p style="font-size: 14px; color: #64748b; margin-bottom: 16px;">Need help with this order?</p>
            <div style="display: flex; justify-content: center; gap: 12px;">
               <a href="https://wa.me/233548711582" style="background-color: #25D366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 3px; font-weight: 600; font-size: 13px;">WhatsApp Support</a>
            </div>
          </div>
        </div>

        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
          <p style="margin: 0 0 8px;">&copy; ${new Date().getFullYear()} SHERO TECHNOLOGIES. All rights reserved.</p>
          <p style="margin: 0;">Tamale, Ghana | www.sherohq.com</p>
        </div>
      </div>
    `;

    await this.sendEmail(
      shippingInfo.email,
      `Payment Receipt - Order #${orderId.substring(0, 8)}`,
      htmlContent,
      "info",
    );
  }

  private async sendSMS(orderId: string, shippingInfo: ShippingInfo) {
    const message = `SHERO TECHNOLOGIES: Order #${orderId.substring(0, 8)} confirmed! Total items will be delivered to ${shippingInfo.city}. Thanks for shopping with us!`;

    // In a real app, you'd use Twilio, Vonage, etc.
    console.log(
      `📱 [SIMULATION] SMS sent to ${shippingInfo.phone}: "${message}"`,
    );
  }

  public async sendVerificationEmail(
    email: string,
    token: string,
    name: string,
  ) {
    await this.ensureInitialized();
    const baseUrl =
      process.env.FRONTEND_URL ||
      process.env.PUBLIC_URL ||
      "http://localhost:3000";

    if (
      process.env.NODE_ENV === "production" &&
      baseUrl.includes("localhost")
    ) {
      console.warn(
        "❗ WARNING: baseUrl set to localhost in production for verification email!",
      );
    }
    const verifyLink = `${baseUrl}/verify-email?token=${token}`;

    const logoUrl = `${baseUrl}/shero.png`;

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${logoUrl}" alt="SHERO" style="height: 40px;" />
        </div>
        <h1 style="color: #059669; text-align: center;">Verify Your Email</h1>
        <p>Hi ${name},</p>
        <p>Thank you for creating an account with <strong>SHERO TECHNOLOGIES</strong>. Please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyLink}" style="background-color: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 3px; font-weight: bold; display: inline-block;">
            Verify Email
          </a>
        </div>

        <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
        <p style="color: #059669; word-break: break-all; font-size: 14px;">
          <a href="${verifyLink}" style="color: #059669; text-decoration: underline;">${verifyLink}</a>
        </p>

        <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 3px; padding: 12px; margin: 20px 0;">
          <p style="color: #991b1b; font-size: 12px; margin: 0;">
            <strong>Tip:</strong> If the link above is not clickable, please move this email to your <strong>Inbox</strong> or mark it as <strong>"Not Spam"</strong>.
          </p>
        </div>

        <p style="color: #666; font-size: 12px; margin-top: 30px;">This link expires in 30 minutes. If you didn't create an account, please ignore this email.</p>
        
        <p style="font-size: 12px; color: #666; text-align: center; margin-top: 30px;">
          SHERO TECHNOLOGIES - Ghana's Leading Tech Store
        </p>
      </div>
    `;

    await this.sendEmail(
      email,
      "Verify Your Email - SHERO TECHNOLOGIES",
      htmlContent,
      "noreply",
    );
  }
  public async sendScheduleConfirmation(
    email: string,
    name: string,
    service: string,
    date: Date,
    time: string,
  ) {
    await this.ensureInitialized();
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const baseUrl =
      process.env.FRONTEND_URL?.replace(/\/$/, "") || "https://sherohq.com";
    const logoUrl = `${baseUrl}/shero.png`;

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${logoUrl}" alt="SHERO" style="height: 40px;" />
        </div>
        <h1 style="color: #059669; text-align: center;">Consultation Confirmed!</h1>
        <p>Hi ${name},</p>
        <p>Your consultation with <strong>SHERO TECHNOLOGIES</strong> has been successfully scheduled.</p>
        
        <div style="background: #f9fafb; padding: 15px; border-radius: 3px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Appointment Details</h3>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${time} GMT</p>
        </div>

        <p>Our team will contact you shortly to confirm the meeting link or location.</p>
        
        <p style="font-size: 12px; color: #666; text-align: center; margin-top: 30px;">
          SHERO TECHNOLOGIES - Ghana's Leading Tech Store
        </p>
      </div>
    `;

    await this.sendEmail(
      email,
      "Consultation Confirmed - SHERO TECHNOLOGIES",
      htmlContent,
      "support",
    );
  }

  public async sendContactConfirmation(
    email: string,
    name: string,
    subject: string,
    message: string,
  ) {
    await this.ensureInitialized();
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h1 style="color: #059669; text-align: center;">Message Received</h1>
        <p>Hi ${name},</p>
        <p>Thanks for reaching out! We've received your message and will get back to you within 24 hours.</p>
        
        <div style="background: #f9fafb; padding: 15px; border-radius: 3px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Message</h3>
          <p><strong>Subject:</strong> ${subject}</p>
          <p style="white-space: pre-wrap; color: #555;">${message}</p>
        </div>
        
        <p style="font-size: 12px; color: #666; text-align: center; margin-top: 30px;">
          SHERO TECHNOLOGIES Support Team
        </p>
      </div>
    `;

    await this.sendEmail(
      email,
      `Re: ${subject} - SHERO TECHNOLOGIES`,
      htmlContent,
      "support",
    );
  }

  public async sendNewsletterWelcome(email: string) {
    await this.ensureInitialized();

    const baseUrl =
      process.env.FRONTEND_URL?.replace(/\/$/, "") || "https://sherohq.com";
    const logoUrl = `${baseUrl}/shero.png`;

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${logoUrl}" alt="SHERO" style="height: 40px;" />
        </div>
        <h1 style="color: #059669; text-align: center;">Welcome to SHERO Updates</h1>
        <p>Thanks for subscribing to SHERO newsletter updates.</p>
        <p>You will receive product drops, practical guides, and selected offers from our team.</p>
        <p style="font-size: 12px; color: #666; text-align: center; margin-top: 30px;">
          SHERO TECHNOLOGIES
        </p>
      </div>
    `;

    await this.sendEmail(
      email,
      "Subscription Confirmed - SHERO TECHNOLOGIES",
      htmlContent,
      "info",
    );
  }

  public async sendNewsletterCampaignEmail(
    email: string,
    subject: string,
    content: string,
    unsubscribeUrl: string,
  ): Promise<boolean> {
    await this.ensureInitialized();

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 700px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
        <div style="margin-bottom: 20px; color: #0f172a; line-height: 1.6;">
          ${content}
        </div>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-size: 12px; color: #64748b; margin: 0;">
          You are receiving this because you subscribed to SHERO updates.
        </p>
        <p style="font-size: 12px; margin-top: 8px;">
          <a href="${unsubscribeUrl}" style="color: #059669;">Unsubscribe</a>
        </p>
      </div>
    `;

    return this.sendEmail(email, subject, htmlContent, "info");
  }

  private normalizePhone(phone: string): string {
    const compact = phone.replace(/[\s()-]/g, "").trim();
    if (compact.startsWith("00")) {
      return `+${compact.slice(2)}`;
    }
    return compact;
  }

  public async sendNewsletterCampaignWhatsApp(
    phone: string,
    options: {
      mode?: "text" | "template";
      content?: string;
      templateName?: string;
      languageCode?: string;
      templateParams?: string[];
    },
  ): Promise<boolean> {
    await this.ensureInitialized();

    const normalizedPhone = this.normalizePhone(phone);
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const mode = options.mode || "text";
    const languageCode = options.languageCode || "en";

    const payload =
      mode === "template"
        ? {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: normalizedPhone,
            type: "template",
            template: {
              name: options.templateName,
              language: { code: languageCode },
              ...(options.templateParams && options.templateParams.length > 0
                ? {
                    components: [
                      {
                        type: "body",
                        parameters: options.templateParams.map((param) => ({
                          type: "text",
                          text: param,
                        })),
                      },
                    ],
                  }
                : {}),
            },
          }
        : {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: normalizedPhone,
            type: "text",
            text: {
              preview_url: false,
              body: (options.content || "").slice(0, 4096),
            },
          };

    if (mode === "template" && !options.templateName) {
      console.error("❌ WhatsApp template mode requires templateName");
      return false;
    }

    if (token && phoneNumberId) {
      try {
        const response = await fetch(
          `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );

        if (!response.ok) {
          const errorBody = await response.text();
          console.error(
            `❌ WhatsApp API failed for ${normalizedPhone}: ${response.status} ${errorBody}`,
          );
          return false;
        }

        console.log(`✅ WhatsApp message sent to ${normalizedPhone}`);
        return true;
      } catch (error) {
        console.error(`❌ WhatsApp send error for ${normalizedPhone}:`, error);
        return false;
      }
    }

    if (mode === "template") {
      console.log(
        `📝 [SIMULATION] WhatsApp template to ${normalizedPhone}: ${options.templateName} (${languageCode})`,
      );
    } else {
      console.log(
        `📝 [SIMULATION] WhatsApp to ${normalizedPhone}: ${(options.content || "").slice(0, 120)}`,
      );
    }

    return true;
  }

  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    fromType: "info" | "support" | "noreply" = "info",
  ): Promise<boolean> {
    const fromEmails = {
      info: "info@sherohq.com",
      support: "support@sherohq.com",
      noreply: "noreply@sherohq.com",
    };

    const senderEmail = fromEmails[fromType];

    if (this.resend) {
      // Resend requires a verified domain or their onboarding address
      const resendSender = process.env.RESEND_FROM || senderEmail;
      const from = `"SHERO TECHNOLOGIES" <${resendSender}>`;

      console.log(`📡 Sending email via Resend to: ${to} (from: ${from})`);
      try {
        const { data, error } = await this.resend.emails.send({
          from,
          to: [to],
          subject,
          html,
        });

        if (error) {
          console.error("❌ Resend failed to send email:", error);
          if (
            resendSender === "onboarding@resend.dev" &&
            !to.includes(process.env.SMTP_USER || "")
          ) {
            console.warn(
              "💡 TIP: onboarding@resend.dev only sends to your own Resend account email.",
            );
          }
          return false;
        }
        console.log(`✅ Email sent via Resend to: ${to} | ID: ${data?.id}`);
        return true;
      } catch (error) {
        console.error("❌ Resend error:", error);
        return false;
      }
      return false;
    }

    if (this.transporter) {
      const from = `"SHERO TECHNOLOGIES" <${process.env.SMTP_USER || senderEmail}>`;
      console.log(`📡 Sending email via SMTP to: ${to} (from: ${from})`);
      try {
        await this.transporter.sendMail({
          from,
          to,
          subject,
          html,
        });
        console.log(`✅ Email sent via SMTP to: ${to} | Subject: ${subject}`);
        return true;
      } catch (error) {
        console.error("❌ Failed to send SMTP email:", error);
        return false;
      }
    } else {
      console.log(
        `📝 [SIMULATION] Email to ${to} [from: ${senderEmail}]: "${subject}"`,
      );
      return true;
    }

    return false;
  }
}

export const notificationService = new NotificationService();
