import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { notificationService } from "@/lib/notifications";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  phone: z.string().optional(),
});

const USER_SESSION_COOKIE = "user_session_token";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = RegisterSchema.parse(body);
    const { email, password, name, phone } = validated;

    const check = await query("SELECT id FROM users WHERE email = $1", [email]);
    if (check.rowCount && check.rowCount > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const verificationToken = randomBytes(32).toString("hex");
    const verificationExpiry = new Date(Date.now() + 30 * 60 * 1000);

    await query(
      `INSERT INTO users (id, email, "passwordHash", name, phone, "emailVerified", "verificationToken", "verificationExpiry")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        email,
        hashedPassword,
        name,
        phone || null,
        false,
        verificationToken,
        verificationExpiry.toISOString(),
      ],
    );

    // Auto login
    const token = randomBytes(32).toString("hex");
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await query(
      'INSERT INTO user_sessions (id, "userId", token, "expiresAt") VALUES ($1, $2, $3, $4)',
      [sessionId, userId, token, expiresAt.toISOString()],
    );

    const cookieStore = await cookies();
    cookieStore.set(USER_SESSION_COOKIE, token, {
      expires: expiresAt,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    // Send welcome email (async)
    notificationService.sendWelcomeEmail(email, name).catch((err) => {
      console.error("Failed to send welcome email:", err);
    });
    return NextResponse.json(
      {
        success: true,
        user: { id: userId, email, name, phone, emailVerified: false },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
