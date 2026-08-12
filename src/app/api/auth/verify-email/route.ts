import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/drizzle/schema";
import { eq, and, gt } from "drizzle-orm";
import { apiResponse } from "@/lib/api-utils";
import { z } from "zod";

const VerifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return apiResponse.error("Invalid request body", 400);
    }

    const validated = VerifyEmailSchema.safeParse(body);
    if (!validated.success) {
      return apiResponse.validationError(validated.error);
    }

    const { token } = validated.data;

    // Look for matching unexpired token
    const user = await db.query.users.findFirst({
      where: and(
        eq(users.verificationToken, token),
        gt(users.verificationExpiry, new Date().toISOString())
      ),
    });

    if (!user) {
      return apiResponse.error("Invalid or expired verification token", 400);
    }

    // Mark user as verified and clear token
    await db.update(users)
      .set({
        emailVerified: true,
        verificationToken: null,
        verificationExpiry: null,
      })
      .where(eq(users.id, user.id));

    return apiResponse.success({
      message: "Your email has been verified successfully!",
    });
  } catch (error: any) {
    console.error("Email verification error:", error);
    return apiResponse.error("Failed to verify email. Please try again later.", 500);
  }
}
