import { describe, it, expect } from "vitest";
import {
  generateMfaChallengeToken,
  verifyMfaChallengeToken,
  generateRecoveryCodes,
  hashRecoveryCode,
  verifyRecoveryCode,
} from "./mfa-utils";

describe("mfa-utils security functions", () => {
  it("generates and verifies a valid signed MFA challenge token for user", () => {
    const userId = "usr_123456789";
    const token = generateMfaChallengeToken(userId, "user");

    expect(token).toContain(".");
    const verifiedId = verifyMfaChallengeToken(token, "user");
    expect(verifiedId).toBe(userId);
  });

  it("generates and verifies a valid signed MFA challenge token for admin", () => {
    const adminId = "adm_987654321";
    const token = generateMfaChallengeToken(adminId, "admin");

    const verifiedId = verifyMfaChallengeToken(token, "admin");
    expect(verifiedId).toBe(adminId);
  });

  it("rejects token verified with wrong subject type", () => {
    const userId = "usr_123456789";
    const token = generateMfaChallengeToken(userId, "user");

    const verifiedId = verifyMfaChallengeToken(token, "admin");
    expect(verifiedId).toBeNull();
  });

  it("rejects tampered MFA tokens", () => {
    const userId = "usr_123456789";
    const token = generateMfaChallengeToken(userId, "user");
    const tampered = token.slice(0, -4) + "XXXX";

    const verifiedId = verifyMfaChallengeToken(tampered, "user");
    expect(verifiedId).toBeNull();
  });

  it("correctly generates, hashes, and verifies recovery codes", () => {
    const codes = generateRecoveryCodes();
    expect(codes).toHaveLength(10);

    const firstCode = codes[0];
    const hashed = hashRecoveryCode(firstCode);

    expect(verifyRecoveryCode(firstCode, hashed)).toBe(true);
    expect(verifyRecoveryCode("INVALIDCODE", hashed)).toBe(false);
  });
});
