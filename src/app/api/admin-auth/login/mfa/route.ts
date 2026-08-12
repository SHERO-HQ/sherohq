import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { adminUsers, sessions } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";
import { ADMIN_SESSION_COOKIE, getAuthCookieOptions } from "@/lib/auth";
import speakeasy from "speakeasy";
import { verifyRecoveryCode, verifyMfaChallengeToken } from "@/lib/mfa-utils";

export async function POST(request: NextRequest) {
  try {
    const { mfaToken, code } = await request.json();
    
    if (!mfaToken || !code) {
      return apiResponse.error("MFA token and code are required", 400);
    }

    // Verify signed MFA token and retrieve adminId
    const adminId = verifyMfaChallengeToken(mfaToken, "admin");
    if (!adminId) {
      return apiResponse.error("Invalid or expired MFA session token", 401);
    }

    // Fetch admin
    const admin = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.id, adminId)
    });

    if (!admin || !admin.mfaEnabled) {
      return apiResponse.error("Invalid session", 401);
    }

    // Verify the code (TOTP or Recovery Code)
    let verified = false;

    if (code.length === 10) {
      // Check recovery codes
      const hashedRecoveryCodes: string[] = (admin.mfaRecoveryCodes as string[]) || [];
      const codeIndex = hashedRecoveryCodes.findIndex(hashed => verifyRecoveryCode(code.toUpperCase(), hashed));
      
      if (codeIndex !== -1) {
        verified = true;
        // Remove the used recovery code
        hashedRecoveryCodes.splice(codeIndex, 1);
        await db.update(adminUsers)
          .set({ mfaRecoveryCodes: JSON.stringify(hashedRecoveryCodes) })
          .where(eq(adminUsers.id, admin.id));
        await logActivity(admin.id, "admin_mfa_recovery_used", "info", `Admin used a recovery code to log in: ${admin.username}`);
      }
    } else {
      // Standard TOTP verification
      verified = speakeasy.totp.verify({
        secret: admin.mfaSecret!,
        encoding: "base32",
        token: code,
        window: 1,
      });
    }

    if (!verified) {
      return apiResponse.error("Invalid verification code", 400);
    }

    // Create session
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.insert(sessions).values({
      id: uuidv4(),
      adminId: admin.id,
      token,
      expiresAt: expiresAt.toISOString(),
    });

    const cookieOptions = await getAuthCookieOptions(7 * 24 * 60 * 60);
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, token, cookieOptions);

    await logActivity(admin.id, "admin_login_mfa", "success", `Admin logged in with MFA: ${admin.username}`);

    return apiResponse.success({
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        avatar: admin.avatar,
      },
    });
  } catch (error) {
    console.error("MFA login error:", error);
    return apiResponse.error("MFA verification failed");
  }
}
