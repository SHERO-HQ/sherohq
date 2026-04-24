import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

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
