import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { getUserFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromSession();
    if (!user) return apiResponse.unauthorized();

    // Generate a secure TOTP secret
    const secret = speakeasy.generateSecret({
      name: `Sherotech:${user.email}`,
      issuer: "Sherotech"});

    // Generate QR code data URL
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || "");

    // Store the base32 secret in the database (unverified state)
    await query(
      `UPDATE users SET "mfaSecret" = $1, "mfaEnabled" = false WHERE id = $2`,
      [secret.base32, user.id]
    );

    return apiResponse.success({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      otpAuthUrl: secret.otpauth_url
    });
  } catch (error) {
    console.error("User MFA setup error:", error);
    return apiResponse.error("Failed to initialize MFA setup");
  }
}
