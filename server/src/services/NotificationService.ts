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

  constructor() {
    this.initEmail();
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
          // Do not fail on invalid certs (common with some SMTP providers)
          rejectUnauthorized: false,
          // Support for older/strict SMTP servers
          ciphers: "SSLv3",
        },
        family: 4,
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 10000,
        logger: true,
        debug: true,
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

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
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
          If you have any questions, please contact our support team at info.sheroh1@gmail.com or call us at +233 54 871 582.
        </p>
      </div>
    `;

    await this.sendEmail(
      shippingInfo.email,
      `Order Confirmation - #${orderId.substring(0, 8)}`,
      htmlContent,
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
    const baseUrl =
      process.env.FRONTEND_URL ||
      process.env.PUBLIC_URL ||
      "http://localhost:5173";

    if (
      process.env.NODE_ENV === "production" &&
      baseUrl.includes("localhost")
    ) {
      console.warn(
        "❗ WARNING: baseUrl set to localhost in production for verification email!",
      );
    }
    const verifyLink = `${baseUrl}/verify-email?token=${token}`;

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
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

        <p style="color: #666; font-size: 12px; margin-top: 30px;">This link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
        
        <p style="font-size: 12px; color: #666; text-align: center; margin-top: 30px;">
          SHERO TECHNOLOGIES - Ghana's Leading Tech Store
        </p>
      </div>
    `;

    await this.sendEmail(
      email,
      "Verify Your Email - SHERO TECHNOLOGIES",
      htmlContent,
    );
  }
  public async sendScheduleConfirmation(
    email: string,
    name: string,
    service: string,
    date: Date,
    time: string,
  ) {
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h1 style="color: #059669; text-align: center;">Consultation Confirmed!</h1>
        <p>Hi ${name},</p>
        <p>Your consultation with <strong>SHERO TECHNOLOGIES</strong> has been successfully scheduled.</p>
        
        <div style="background: #f9fafb; padding: 15px; border-radius: 3px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Appointment Details</h3>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${time}</p>
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
    );
  }

  public async sendContactConfirmation(
    email: string,
    name: string,
    subject: string,
    message: string,
  ) {
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
    );
  }

  private async sendEmail(to: string, subject: string, html: string) {
    if (this.resend) {
      // Resend requires a verified domain or their onboarding address
      const resendSender = process.env.RESEND_FROM || "onboarding@resend.dev";
      const from = `"SHERO TECHNOLOGIES" <${resendSender}>`;

      console.log(`📡 Sending email via Resend to: ${to}`);
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
          return;
        }
        console.log(`✅ Email sent via Resend to: ${to} | ID: ${data?.id}`);
      } catch (error) {
        console.error("❌ Resend error:", error);
      }
      return;
    }

    if (this.transporter) {
      const from = `"SHERO TECHNOLOGIES" <${process.env.SMTP_USER}>`;
      console.log(`📡 Sending email via SMTP to: ${to}`);
      try {
        await this.transporter.sendMail({
          from,
          to,
          subject,
          html,
        });
        console.log(`✅ Email sent via SMTP to: ${to} | Subject: ${subject}`);
      } catch (error) {
        console.error("❌ Failed to send SMTP email:", error);
      }
    } else {
      console.log(`📝 [SIMULATION] Email to ${to}: "${subject}"`);
    }
  }
}

export const notificationService = new NotificationService();
