import { apiResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";
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
      return apiResponse.error("Too many password reset requests. Please try again in a minute.", 429);
    }

    const body = await request.json();
    const validated = ForgotPasswordSchema.parse(body);
    const { email } = validated;

    // 1. Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
      columns: { id: true, name: true },
    });

    // Note: To prevent account enumeration, always return success even if user doesn't exist
    if (!user) {
      if (process.env.NODE_ENV !== "production") {
        console.log(`Password reset requested for non-existent email: ${email}`);
      }
      return apiResponse.success({
        success: true,
        message: "If an account with that email exists, we have sent a reset link.",
      });
    }

    // 2. Generate reset token and hash it for storage
    const token = randomBytes(32).toString("hex");
    const hashedToken = createHash("sha256").update(token).digest("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // 3. Save hashed token to DB
    await db.update(users)
      .set({ resetToken: hashedToken, resetTokenExpiry: expiry.toISOString() })
      .where(eq(users.id, user.id));

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

    return apiResponse.success({
      success: true,
      message: "Password reset link sent successfully.",
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Forgot password error:", error);
    }
    if (error instanceof z.ZodError) {
      return apiResponse.error("Invalid email address", 400);
    }
    return apiResponse.error("Internal server error", 500);
  }
}
