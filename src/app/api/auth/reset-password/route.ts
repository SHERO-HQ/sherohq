import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ResetPasswordSchema.parse(body);
    const { token, password } = validated;

    // 1. Find user by token and check expiry
    const result = await query(
      'SELECT id FROM users WHERE "resetToken" = $1 AND "resetTokenExpiry" > NOW()',
      [token]
    );
    const user = result.rows[0];

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // 2. Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Update user and clear token
    await query(
      'UPDATE users SET "passwordHash" = $1, "resetToken" = NULL, "resetTokenExpiry" = NULL WHERE id = $2',
      [passwordHash, user.id]
    );

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
