import { describe, expect, it } from "vitest";
import { hashPassword, passwordProblem, verifyPassword } from "./password";
import { newRecoveryCodes, redeemRecoveryCode } from "./recovery";
import { base32Decode, base32Encode, codeForStep, matchTotp, stepAt } from "./totp";

// RFC 6238 test secret: ASCII "12345678901234567890".
const rfcSecret = base32Encode(Buffer.from("12345678901234567890"));

describe("TOTP", () => {
  it("matches the RFC 6238 SHA-1 test vectors", () => {
    expect(codeForStep(rfcSecret, stepAt(59_000), 8)).toBe("94287082");
    expect(codeForStep(rfcSecret, stepAt(1_111_111_109_000), 8)).toBe("07081804");
    expect(codeForStep(rfcSecret, stepAt(2_000_000_000_000), 8)).toBe("69279037");
  });

  it("round-trips base32", () => {
    expect(base32Decode(rfcSecret).toString()).toBe("12345678901234567890");
  });

  it("accepts the current code and one step of drift, and nothing older", () => {
    const now = 1_700_000_000_000;
    const step = stepAt(now);
    expect(matchTotp(rfcSecret, codeForStep(rfcSecret, step), now, null)).toBe(step);
    expect(matchTotp(rfcSecret, codeForStep(rfcSecret, step - 1), now, null)).toBe(step - 1);
    expect(matchTotp(rfcSecret, codeForStep(rfcSecret, step - 2), now, null)).toBeNull();
    expect(matchTotp(rfcSecret, "12345", now, null)).toBeNull();
  });

  it("refuses a code that was already used", () => {
    const now = 1_700_000_000_000;
    const step = stepAt(now);
    expect(matchTotp(rfcSecret, codeForStep(rfcSecret, step), now, step)).toBeNull();
  });
});

describe("passwords", () => {
  it("verifies the right password only", async () => {
    const stored = await hashPassword("correct horse battery");
    expect(stored.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("correct horse battery", stored)).toBe(true);
    expect(await verifyPassword("correct horse batterY", stored)).toBe(false);
    expect(await verifyPassword("anything", "not-a-hash")).toBe(false);
  });

  it("asks for at least 12 characters", () => {
    expect(passwordProblem("short")).toBe("Use at least 12 characters.");
    expect(passwordProblem("twelve chars")).toBeNull();
  });
});

describe("recovery codes", () => {
  it("each code works once, ignoring case and dashes", () => {
    const { codes, hashes } = newRecoveryCodes();
    expect(codes).toHaveLength(8);
    const left = redeemRecoveryCode(codes[0].toUpperCase().replace("-", ""), hashes);
    expect(left).toHaveLength(7);
    expect(redeemRecoveryCode(codes[0], left!)).toBeNull();
    expect(redeemRecoveryCode("00000-00000", hashes)).toBeNull();
  });
});
