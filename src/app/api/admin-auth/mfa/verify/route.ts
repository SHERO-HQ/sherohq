import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import speakeasy from "speakeasy";

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const { code } = await request.json();
    
    // Fetch the secret from DB
    const res = await query('SELECT "mfaSecret" FROM admin_users WHERE id = $1', [admin.id]);
    const secret = res.rows[0]?.mfaSecret;

    if (!secret) {
      return apiResponse.error("MFA not initialized", 400);
    }

    // Verify the TOTP code
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: "base32",
      token: code,
      window: 1, // Allow 30s clock drift
    });

    if (!verified) {
      return apiResponse.error("Invalid verification code. Please try again.", 400);
    }

    // Enable MFA
    await query(
      `UPDATE admin_users SET "mfaEnabled" = true WHERE id = $1`,
      [admin.id]
    );

    return apiResponse.success({ message: "MFA enabled successfully" });
  } catch (error) {
    console.error("MFA verify error:", error);
    return apiResponse.error("Failed to verify MFA code");
  }
}
