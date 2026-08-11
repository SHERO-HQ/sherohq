import { apiResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users, userSessions } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import speakeasy from "speakeasy";
import { verifyRecoveryCode, verifyMfaChallengeToken } from "@/lib/mfa-utils";

const USER_SESSION_COOKIE = "user_session_token";

export async function POST(request: NextRequest) {
  try {
    const { mfaToken, code } = await request.json();
    
    if (!mfaToken || !code) {
      return apiResponse.error("MFA token and code are required", 400);
    }

    // Verify signed MFA token and retrieve userId
    const userId = verifyMfaChallengeToken(mfaToken, "user");
    if (!userId) {
      return apiResponse.error("Invalid or expired MFA session token", 401);
    }

    // Fetch user and their MFA secret
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user || !user.mfaEnabled) {
      return apiResponse.unauthorized("Invalid session or MFA not enabled");
    }

    // Verify the code (TOTP or Recovery Code)
    let verified = false;

    if (code.length === 10) {
      // Check recovery codes
      const hashedRecoveryCodes: string[] = (user.mfaRecoveryCodes as string[]) || [];
      const codeIndex = hashedRecoveryCodes.findIndex(hashed => verifyRecoveryCode(code.toUpperCase(), hashed));
      
      if (codeIndex !== -1) {
        verified = true;
        // Remove the used recovery code
        hashedRecoveryCodes.splice(codeIndex, 1);
        await db.update(users)
          .set({ mfaRecoveryCodes: JSON.stringify(hashedRecoveryCodes) })
          .where(eq(users.id, user.id));
      }
    } else {
      // Standard TOTP verification
      verified = speakeasy.totp.verify({
        secret: user.mfaSecret!,
        encoding: "base32",
        token: code,
        window: 1,
      });
    }

    if (!verified) {
      return apiResponse.error("Invalid verification code", 400);
    }

    // MFA Verified: Create a real session
    const token = randomBytes(32).toString("hex");
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

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
  } catch (error) {
    console.error("User MFA login error:", error);
    return apiResponse.error("Internal server error", 500);
  }
}
