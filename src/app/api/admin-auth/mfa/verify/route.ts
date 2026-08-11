import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import speakeasy from "speakeasy";
import { generateRecoveryCodes, hashRecoveryCode } from "@/lib/mfa-utils";

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const { code } = await request.json();
    
    // Fetch the secret from DB
    const adminRecord = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.id, admin.id),
      columns: { mfaSecret: true },
    });
    const secret = adminRecord?.mfaSecret as string | undefined;

    if (!secret) {
      return apiResponse.error("MFA not initialized", 400);
    }

    // Verify the TOTP code
    const verified = speakeasy.totp.verify({
      secret: secret as string,
      encoding: "base32",
      token: code,
      window: 1, // Allow 30s clock drift
    });

    if (!verified) {
      return apiResponse.error("Invalid verification code. Please try again.", 400);
    }

    // Enable MFA and generate recovery codes
    const recoveryCodes = generateRecoveryCodes();
    const hashedCodes = recoveryCodes.map(hashRecoveryCode);

    await db.update(adminUsers)
      .set({ mfaEnabled: true, mfaRecoveryCodes: JSON.stringify(hashedCodes) })
      .where(eq(adminUsers.id, admin.id));

    return apiResponse.success({ 
      message: "MFA enabled successfully",
      recoveryCodes 
    });
  } catch (error) {
    console.error("MFA verify error:", error);
    return apiResponse.error("Failed to verify MFA code");
  }
}
