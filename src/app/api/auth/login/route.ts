import { apiResponse, validateCsrf } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users, userSessions } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
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
    const csrfError = await validateCsrf(request);
    if (csrfError) return csrfError;

    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const limiter = await rateLimit(`user_login_${ip}`, 5, 60 * 1000);

    if (!limiter.success) {
      return apiResponse.error("Too many login attempts. Please try again in a minute.", 429);
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return apiResponse.error("Invalid request body", 400);
    }

    const validated = LoginSchema.safeParse(body);
    if (!validated.success) {
      return apiResponse.validationError(validated.error);
    }
    const { email, password } = validated.data;

    // Per-account rate limiting
    const accountLimiter = await rateLimit(`account_login_${email.toLowerCase()}`, 5, 15 * 60_000);
    if (!accountLimiter.success) {
      return apiResponse.error("This account is temporarily locked due to too many failed attempts. Please try again in 15 minutes.", 429);
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    const fakeHash =
      "$2a$10$fakeHashForTimingConsistencyPreventionXXXXXXXXXXXXXXXXXXXXXXXX";
    const isMatch = await bcrypt.compare(
      password,
      user?.passwordHash || fakeHash,
    );

    if (!user || !isMatch) {
      return apiResponse.unauthorized("Invalid credentials");
    }

    if (user.isActive === false) {
      return apiResponse.error("Your account has been deactivated.", 403);
    }

    // 2. Handle Multi-Factor Authentication (MFA)
    if ((user as any).mfaEnabled) {
      const { generateMfaChallengeToken } = await import("@/lib/mfa-utils");
      return apiResponse.success({
        requiresMFA: true,
        mfaToken: generateMfaChallengeToken(user.id, "user"), // Temporary short-lived signed token
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

    // Invalidate old sessions for rotation
    await db.delete(userSessions).where(eq(userSessions.userId, user.id));

    await db.insert(userSessions).values({
      id: sessionId,
      userId: user.id,
      token,
      expiresAt: expiresAt.toISOString(),
    });

    const cookieStore = await cookies();
    cookieStore.set(USER_SESSION_COOKIE, token, {
      expires: expiresAt,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return apiResponse.success({
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
  } catch (error: any) {
    console.error("Login error:", error);
    return apiResponse.error(
      "An unexpected error occurred during login. Please try again.",
      500,
      error?.message || error
    );
  }
}
