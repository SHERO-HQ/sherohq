import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const USER_SESSION_COOKIE = "user_session_token";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const limiter = await rateLimit(`user_login_${ip}`, 5, 60 * 1000);

    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again in a minute." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const validated = LoginSchema.parse(body);
    const { email, password } = validated;

    const result = await query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    const fakeHash =
      "$2a$10$fakeHashForTimingConsistencyPreventionXXXXXXXXXXXXXXXXXXXXXXXX";
    const isMatch = await bcrypt.compare(
      password,
      user?.passwordHash || fakeHash,
    );

    if (!user || !isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    if (user.isActive === false) {
      return NextResponse.json(
        { error: "Your account has been deactivated." },
        { status: 403 },
      );
    }

    // 2. Handle Multi-Factor Authentication (MFA)
    if (user.mfaEnabled) {
      return NextResponse.json({
        requiresMFA: true,
        mfaToken: Buffer.from(user.id).toString("base64"), // Temporary token for the second step
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    }

    const token = randomBytes(32).toString("hex");
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await query(
      'INSERT INTO user_sessions (id, "userId", token, "expiresAt") VALUES ($1, $2, $3, $4)',
      [sessionId, user.id, token, expiresAt.toISOString()],
    );

    const cookieStore = await cookies();
    cookieStore.set(USER_SESSION_COOKIE, token, {
      expires: expiresAt,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        emailVerified: !!user.emailVerified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
