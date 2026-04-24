import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { getUserFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import speakeasy from "speakeasy";
import { generateRecoveryCodes, hashRecoveryCode } from "@/lib/mfa-utils";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromSession();
    if (!user) return apiResponse.unauthorized();

    const { code } = await request.json();
    if (!code) return apiResponse.error("Verification code is required", 400);

    // Fetch the secret we just stored
    const res = await query('SELECT "mfaSecret" FROM users WHERE id = $1', [user.id]);
    const secret = res.rows[0]?.mfaSecret;

    if (!secret) {
      return apiResponse.error("MFA setup not initialized", 400);
    }

    // Verify the TOTP code
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: "base32",
      token: code,
      window: 1, // Allow 30s clock drift
    });

    if (!verified) {
      return apiResponse.error("Invalid verification code", 400);
    }

    // Enable MFA permanently and store recovery codes
    const recoveryCodes = generateRecoveryCodes();
    const hashedCodes = recoveryCodes.map(hashRecoveryCode);

    await query(
      'UPDATE users SET "mfaEnabled" = true, "mfaRecoveryCodes" = $1 WHERE id = $2',
      [JSON.stringify(hashedCodes), user.id]
    );

    return apiResponse.success({ 
      message: "MFA enabled successfully",
      recoveryCodes 
    });
  } catch (error) {
    console.error("User MFA verification error:", error);
    return apiResponse.error("Failed to verify MFA code");
  }
}
