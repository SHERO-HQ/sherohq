import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { apiResponse } from "@/lib/api-utils";
import { randomBytes } from "node:crypto";
import { notificationService } from "@/lib/notifications";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const ResendSchema = z.object({
  email: z.string().email("Valid email is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return apiResponse.error("Invalid request body", 400);
    }

    const validated = ResendSchema.safeParse(body);
    if (!validated.success) {
      return apiResponse.validationError(validated.error);
    }

    const { email } = validated.data;

    // Rate limit resend requests (3 requests per 10 minutes)
    const limiter = await rateLimit(`resend_verification_${email.toLowerCase()}`, 3, 10 * 60_000);
    if (!limiter.success) {
      return apiResponse.error("Too many verification requests. Please wait a few minutes before trying again.", 429);
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    // Don't disclose user existence; return generic success if user doesn't exist or already verified
    if (!user || user.emailVerified) {
      return apiResponse.success({
        message: "If an unverified account with that email exists, a verification link has been sent.",
      });
    }

    const verificationToken = randomBytes(32).toString("hex");
    const verificationExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    await db.update(users)
      .set({
        verificationToken,
        verificationExpiry: verificationExpiry.toISOString(),
      })
      .where(eq(users.id, user.id));

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com";
    const verificationLink = `${siteUrl.replace(/\/$/, "")}/verify-email?token=${verificationToken}`;

    await notificationService.sendVerificationEmail(email, user.name || "Customer", verificationLink);

    return apiResponse.success({
      message: "Verification email sent successfully! Please check your inbox.",
    });
  } catch (error: any) {
    console.error("Resend verification error:", error);
    return apiResponse.error("Failed to send verification email. Please try again later.", 500);
  }
}
