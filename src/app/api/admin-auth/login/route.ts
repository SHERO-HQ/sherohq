import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { adminUsers, sessions } from "@/lib/drizzle/schema";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { logActivity } from "@/lib/activity";
import { apiResponse, validateCsrf } from "@/lib/api-utils";
import { ADMIN_SESSION_COOKIE, getAuthCookieOptions } from "@/lib/auth";

import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const csrfError = await validateCsrf(request);
    if (csrfError) return csrfError;

    // 1. Rate Limiting (5 attempts per 1 minute)
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const limiter = await rateLimit(`login_${ip}`, 5, 60 * 1000);
    
    if (!limiter.success) {
      return apiResponse.error("Too many login attempts. Please try again in a minute.", 429);
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return apiResponse.error("Invalid request body", 400);
    }

    const { username, password } = body;
    
    if (!username || !password) {
      return apiResponse.error("Username and password are required", 400);
    }

    // Per-account rate limiting
    const accountLimiter = await rateLimit(`account_login_${username.toLowerCase()}`, 5, 15 * 60_000);
    if (!accountLimiter.success) {
      return apiResponse.error("This account is temporarily locked due to too many failed attempts. Please try again in 15 minutes.", 429);
    }

    // Find admin by username or email
    const admin = await db.query.adminUsers.findFirst({
      where: or(eq(adminUsers.username, username), eq(adminUsers.email, username))
    });

    const fakeHash = "$2a$10$fakeHashForTimingConsistencyPreventionXXXXXXXXXXXXXXXXXXXXXXXX";
    const isValid = await bcrypt.compare(password, admin?.passwordHash || fakeHash);

    if (!admin || !isValid) {
      return apiResponse.unauthorized("Invalid username or password");
    }

    if (admin.isActive === false) {
      return apiResponse.forbidden("This account has been deactivated. Please contact a superadmin.");
    }

    // Check for password expiration (6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const passwordExpired = admin.passwordUpdatedAt
      ? new Date(admin.passwordUpdatedAt) < sixMonthsAgo
      : false;
    const mustReset = Boolean(admin.passwordResetRequired || passwordExpired);

    // 2. Handle Multi-Factor Authentication (MFA)
    if (admin.mfaEnabled) {
      const { generateMfaChallengeToken } = await import("@/lib/mfa-utils");
      return apiResponse.success({
        requiresMFA: true,
        mfaToken: generateMfaChallengeToken(admin.id, "admin"),
        admin: {
          id: admin.id,
          username: admin.username,
          avatar: admin.avatar,
        }
      });
    }

    // Create session
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Invalidate old sessions for rotation
    await db.delete(sessions).where(eq(sessions.adminId, admin.id));

    await db.insert(sessions).values({
      id: uuidv4(),
      adminId: admin.id,
      token,
      expiresAt: expiresAt.toISOString(),
    });

    const cookieOptions = await getAuthCookieOptions(7 * 24 * 60 * 60);
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, token, cookieOptions);

    await logActivity(admin.id, "admin_login", "success", `Admin logged in: ${admin.username}`);

    return apiResponse.success({
      token,
      mustReset,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        avatar: admin.avatar,
      },
    });
  } catch (error: any) {
    console.error("Admin login error:", error);
    return apiResponse.error(
      "An unexpected error occurred during login. Please try again.",
      500,
      error?.message || error
    );
  }
}
