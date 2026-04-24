import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import speakeasy from "speakeasy";
import { verifyRecoveryCode } from "@/lib/mfa-utils";

const USER_SESSION_COOKIE = "user_session_token";

export async function POST(request: NextRequest) {
  try {
    const { mfaToken, code } = await request.json();
    
    if (!mfaToken || !code) {
      return NextResponse.json({ error: "MFA token and code are required" }, { status: 400 });
    }

    // Decode userId from the temporary token
    const userId = Buffer.from(mfaToken, "base64").toString("utf-8");

    // Fetch user and their MFA secret
    const res = await query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = res.rows[0];

    if (!user || !user.mfaEnabled) {
      return NextResponse.json({ error: "Invalid session or MFA not enabled" }, { status: 401 });
    }

    // Verify the code (TOTP or Recovery Code)
    let verified = false;

    if (code.length === 10) {
      // Check recovery codes
      const hashedRecoveryCodes: string[] = user.mfaRecoveryCodes || [];
      const codeIndex = hashedRecoveryCodes.findIndex(hashed => verifyRecoveryCode(code.toUpperCase(), hashed));
      
      if (codeIndex !== -1) {
        verified = true;
        // Remove the used recovery code
        hashedRecoveryCodes.splice(codeIndex, 1);
        await query('UPDATE users SET "mfaRecoveryCodes" = $1 WHERE id = $2', [JSON.stringify(hashedRecoveryCodes), user.id]);
      }
    } else {
      // Standard TOTP verification
      verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: "base32",
        token: code,
        window: 1,
      });
    }

    if (!verified) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    // MFA Verified: Create a real session
    const token = randomBytes(32).toString("hex");
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await query(
      'INSERT INTO user_sessions (id, "userId", token, "expiresAt") VALUES ($1, $2, $3, $4)',
      [sessionId, user.id, token, expiresAt.toISOString()]
    );

    const cookieStore = await cookies();
    cookieStore.set(USER_SESSION_COOKIE, token, {
      expires: expiresAt,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
