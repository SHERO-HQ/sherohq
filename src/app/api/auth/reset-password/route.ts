import { apiResponse, validateCsrf } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/drizzle/schema";
import { eq, gt, and } from "drizzle-orm";
import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { PasswordSchema } from "@/lib/validations/auth";

const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: PasswordSchema,
});

export async function POST(request: NextRequest) {
  try {
    const csrfError = await validateCsrf(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const validated = ResetPasswordSchema.parse(body);
    const { token, password } = validated;

    const hashedToken = createHash("sha256").update(token).digest("hex");

    // 1. Find user by hashed token and check expiry
    const user = await db.query.users.findFirst({
      where: and(
        eq(users.resetToken, hashedToken),
        gt(users.resetTokenExpiry, new Date().toISOString())
      ),
      columns: { id: true },
    });

    if (!user) {
      return apiResponse.error("Invalid or expired reset token", 400);
    }

    // 2. Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Update user and clear token
    await db.update(users)
      .set({ passwordHash, resetToken: null, resetTokenExpiry: null })
      .where(eq(users.id, user.id));

    return apiResponse.success({
      success: true,
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    if (error instanceof z.ZodError) {
      return apiResponse.error("Invalid input data", 400);
    }
    return apiResponse.error("Internal server error", 500);
  }
}
