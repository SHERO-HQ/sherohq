import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth";

import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting (5 attempts per 1 minute)
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const limiter = await rateLimit(`login_${ip}`, 5, 60 * 1000);
    
    if (!limiter.success) {
      return apiResponse.error("Too many login attempts. Please try again in a minute.", 429);
    }

    const { username, password } = await request.json();
    
    if (!username || !password) {
      return apiResponse.error("Username and password are required", 400);
    }

    // Find admin by username or email
    const result = await query(
      `SELECT * FROM admin_users WHERE username = $1 OR email = $2`,
      [username, username]
    );

    const admin = result.rows[0];
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
    const passwordExpired = new Date(admin.passwordUpdatedAt) < sixMonthsAgo;
    const mustReset = admin.passwordResetRequired || passwordExpired;

    // 2. Handle Multi-Factor Authentication (MFA)
    if (admin.mfaEnabled) {
      // In a real production app, we would generate a temporary 'mfaToken'
      // For this implementation, we return a flag so the frontend can show the MFA prompt
      return apiResponse.success({
        requiresMFA: true,
        mfaToken: Buffer.from(admin.id).toString("base64"), // Demo token
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

    await query(
      `INSERT INTO sessions (id, "adminId", token, "expiresAt") VALUES ($1, $2, $3, $4)`,
      [uuidv4(), admin.id, token, expiresAt.toISOString()]
    );

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

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
  } catch (error) {
    console.error("Admin login error:", error);
    return apiResponse.error("An unexpected error occurred during login. Please try again.");
  }
}
