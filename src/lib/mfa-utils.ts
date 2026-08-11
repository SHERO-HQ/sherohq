import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Generates 10 secure, random 10-character recovery codes.
 */
export function generateRecoveryCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    // Generate a 10-character alphanumeric code
    const code = randomBytes(5).toString("hex").toUpperCase();
    codes.push(code);
  }
  return codes;
}

/**
 * Hashes a recovery code for secure storage.
 */
export function hashRecoveryCode(code: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(code, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

/**
 * Verifies if a code matches a hashed recovery code.
 */
export function verifyRecoveryCode(code: string, hashedCode: string): boolean {
  try {
    const [salt, key] = hashedCode.split(":");
    const derivedKey = scryptSync(code, salt, 64).toString("hex");
    return timingSafeEqual(Buffer.from(key, "hex"), Buffer.from(derivedKey, "hex"));
  } catch {
    return false;
  }
}

const MFA_TOKEN_SECRET =
  process.env.JWT_SECRET || process.env.CRON_SECRET || "shero_mfa_token_secret_fallback_key";

/**
 * Generates a signed, short-lived (5-minute) MFA challenge token.
 */
export function generateMfaChallengeToken(
  subjectId: string,
  type: "user" | "admin"
): string {
  const payload = {
    id: subjectId,
    type,
    exp: Date.now() + 5 * 60 * 1000,
    nonce: randomBytes(16).toString("hex"),
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", MFA_TOKEN_SECRET)
    .update(payloadB64)
    .digest("base64url");
  return `${payloadB64}.${sig}`;
}

/**
 * Verifies a signed MFA challenge token and returns the subject ID if valid.
 */
export function verifyMfaChallengeToken(
  token: string,
  expectedType: "user" | "admin"
): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payloadB64, sig] = parts;

    const expectedSig = createHmac("sha256", MFA_TOKEN_SECRET)
      .update(payloadB64)
      .digest("base64url");

    if (
      !timingSafeEqual(
        Buffer.from(sig, "utf-8"),
        Buffer.from(expectedSig, "utf-8")
      )
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8")
    );

    if (payload.type !== expectedType) return null;
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return null;

    return payload.id || null;
  } catch {
    return null;
  }
}

