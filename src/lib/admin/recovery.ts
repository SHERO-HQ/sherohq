// One-time recovery codes, for when the authenticator phone is lost. Only
// their hashes are stored; each works once.
import { createHash, randomBytes } from "node:crypto";

const hash = (code: string) => createHash("sha256").update(normalise(code)).digest("hex");
const normalise = (code: string) => code.toLowerCase().replace(/[^a-z0-9]/g, "");

export function newRecoveryCodes(count = 8): { codes: string[]; hashes: string[] } {
  const codes = Array.from({ length: count }, () => {
    const raw = randomBytes(5).toString("hex"); // 10 hex characters
    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });
  return { codes, hashes: codes.map(hash) };
}

/** The remaining hashes if the code matched one, or null. */
export function redeemRecoveryCode(code: string, hashes: string[]): string[] | null {
  if (normalise(code).length !== 10) return null;
  const target = hash(code);
  return hashes.includes(target) ? hashes.filter((h) => h !== target) : null;
}
