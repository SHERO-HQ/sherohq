import { sendEmail, wrapEmailHtml } from "../core/email";

export const authNotifications = {
  async sendWelcomeEmail(email: string, name: string) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com";
    const bodyHtml = `
      <h1 style="color: #059669; text-align: center; margin: 0 0 20px; font-size: 18px;">Welcome to SHERO TECHNOLOGIES!</h1>
      <p>Hi ${name},</p>
      <p>We're thrilled to have you here. Your account has been successfully created.</p>
      <p>Start exploring the best technology products, gadgets, and accessories today.</p>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${baseUrl}/shop" style="display: inline-block; padding: 12px 32px; background: #059669; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Start Shopping</a>
      </p>
    `;
    const htmlContent = wrapEmailHtml(bodyHtml, {
      preheader: "Welcome to SHERO! Let's get started.",
    });
    await sendEmail(email, "Welcome to SHERO TECHNOLOGIES!", htmlContent);
  },

  async sendVerificationEmail(email: string, name: string, verificationLink: string) {
    const bodyHtml = `
      <h1 style="color: #059669; text-align: center; margin: 0 0 20px; font-size: 18px;">Verify Your Email Address</h1>
      <p>Hi ${name},</p>
      <p>Thank you for creating an account with SHERO TECHNOLOGIES! Please confirm your email address by clicking the button below to verify your account.</p>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${verificationLink}" style="display: inline-block; padding: 12px 32px; background: #059669; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email Address</a>
      </p>
      <p style="margin-top: 24px; font-size: 13px; color: #64748b;">This verification link will expire in 30 minutes. If you did not create an account, you can safely ignore this email.</p>
    `;
    const htmlContent = wrapEmailHtml(bodyHtml, {
      preheader: "Action required: Verify your SHERO email address.",
    });
    await sendEmail(email, "Verify Your Email - SHERO TECHNOLOGIES", htmlContent);
  },

  async sendPasswordResetEmail(email: string, name: string, resetLink: string) {
    const bodyHtml = `
      <h1 style="text-align: center; margin: 0 0 20px; font-size: 18px;">Reset Your Password</h1>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password for your SHERO TECHNOLOGIES account.</p>
      <p>Click the button below to set a new password. This link is valid for 1 hour.</p>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${resetLink}" style="display: inline-block; padding: 12px 32px; background: #0f172a; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
      </p>
      <p style="margin-top: 24px; font-size: 13px; color: #64748b;">If you didn't request this, you can safely ignore this email.</p>
    `;
    const htmlContent = wrapEmailHtml(bodyHtml, {
      preheader: "Action required: Reset your SHERO password.",
    });
    await sendEmail(email, "Reset Your Password", htmlContent);
  }
};
