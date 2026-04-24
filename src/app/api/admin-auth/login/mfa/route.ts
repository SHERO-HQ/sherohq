import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth";
import speakeasy from "speakeasy";
import { verifyRecoveryCode } from "@/lib/mfa-utils";

export async function POST(request: NextRequest) {
  try {
    const { mfaToken, code } = await request.json();
    
    if (!mfaToken || !code) {
      return apiResponse.error("MFA token and code are required", 400);
    }

    // Decode adminId from demo token
    const adminId = Buffer.from(mfaToken, "base64").toString("utf-8");

    // Fetch admin
    const res = await query('SELECT * FROM admin_users WHERE id = $1', [adminId]);
    const admin = res.rows[0];

    if (!admin || !admin.mfaEnabled) {
      return apiResponse.error("Invalid session", 401);
    }

    // Verify the code (TOTP or Recovery Code)
    let verified = false;

    if (code.length === 10) {
      // Check recovery codes
      const hashedRecoveryCodes: string[] = admin.mfaRecoveryCodes || [];
      const codeIndex = hashedRecoveryCodes.findIndex(hashed => verifyRecoveryCode(code.toUpperCase(), hashed));
      
      if (codeIndex !== -1) {
        verified = true;
        // Remove the used recovery code
        hashedRecoveryCodes.splice(codeIndex, 1);
        await query('UPDATE admin_users SET "mfaRecoveryCodes" = $1 WHERE id = $2', [JSON.stringify(hashedRecoveryCodes), admin.id]);
        await logActivity(admin.id, "admin_mfa_recovery_used", "info", `Admin used a recovery code to log in: ${admin.username}`);
      }
    } else {
      // Standard TOTP verification
      verified = speakeasy.totp.verify({
        secret: admin.mfaSecret,
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
