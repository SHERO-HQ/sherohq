import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { notificationService } from "@/lib/notifications";
import { rateLimit } from "@/lib/rate-limit";

const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const limiter = await rateLimit(`forgot_password_${ip}`, 3, 60 * 1000);

    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many password reset requests. Please try again in a minute." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const validated = ForgotPasswordSchema.parse(body);
    const { email } = validated;

    // 1. Check if user exists
    const result = await query("SELECT id, name FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    // Note: To prevent account enumeration, always return success even if user doesn't exist
    if (!user) {
      if (process.env.NODE_ENV !== "production") {
        console.log(`Password reset requested for non-existent email: ${email}`);
      }
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, we have sent a reset link.",
      });
    }

    // 2. Generate reset token
    const token = randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // 3. Save to DB
    await query(
      'UPDATE users SET "resetToken" = $1, "resetTokenExpiry" = $2 WHERE id = $3',
      [token, expiry.toISOString(), user.id]
    );

    // 4. Send Email (Simulated for now, logging to console)
    const origin = request.nextUrl.origin;
    const resetLink = `${origin}/reset-password?token=${token}`;
    
    if (process.env.NODE_ENV !== "production") {
      console.log(`
        --------------------------------------------------
        PASSWORD RESET REQUEST
        To: ${email}
        User: ${user.name}
        Link: ${resetLink}
        --------------------------------------------------
      `);
    }

    try {
      await notificationService.sendPasswordResetEmail(email, user.name, resetLink);
    } catch (e) {
      console.error("Failed to send password reset email:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Password reset link sent successfully.",
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Forgot password error:", error);
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
