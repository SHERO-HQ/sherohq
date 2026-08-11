import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    // Generate a secure TOTP secret
    const secret = speakeasy.generateSecret({
      name: `Sherotech:${admin.username}`,
      issuer: "Sherotech"});

    // Generate QR code data URL
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || "");

    // Store the base32 secret in the database (unverified state)
    await db.update(adminUsers)
      .set({ mfaSecret: secret.base32, mfaEnabled: false })
      .where(eq(adminUsers.id, admin.id));

    return apiResponse.success({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      otpAuthUrl: secret.otpauth_url
    });
  } catch (error) {
    console.error("MFA setup error:", error);
    return apiResponse.error("Failed to initialize MFA setup");
  }
}
