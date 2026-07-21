import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAdminFromSession, getUserFromSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { hashOrderAccessToken } from "@/lib/orderUtils";
import { normalizeHubtelStatus, verifyHubtelTransaction } from "@/lib/hubtel";

vi.mock("@/lib/db", () => ({
  getClient: vi.fn(),
  query: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getAdminFromSession: vi.fn(),
  getUserFromSession: vi.fn(),
}));

vi.mock("@/lib/orderUtils", () => ({
  hashOrderAccessToken: vi.fn(),
}));

vi.mock("@/lib/hubtel", () => ({
  normalizeHubtelStatus: vi.fn(),
  verifyHubtelTransaction: vi.fn(),
}));

import { POST } from "./route";

const mockedQuery = vi.mocked(query);
const mockedGetAdmin = vi.mocked(getAdminFromSession);
const mockedGetUser = vi.mocked(getUserFromSession);
const mockedHashAccessToken = vi.mocked(hashOrderAccessToken);
const mockedNormalizeHubtelStatus = vi.mocked(normalizeHubtelStatus);
const mockedVerifyHubtelTransaction = vi.mocked(verifyHubtelTransaction);

const pendingOrder = {
  id: "ab12cd34-5678-4abc-8def-0123456789ab",
  status: "pending",
  userId: null,
  orderAccessTokenHash: "stored-hash",
  total: 100,
};

function request(body: Record<string, string>, token?: string) {
  return new NextRequest("http://localhost/api/payments/verify", {
    method: "POST",
    headers: token ? { "x-order-access-token": token } : undefined,
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedGetAdmin.mockResolvedValue(null);
  mockedGetUser.mockResolvedValue(null);
  mockedQuery.mockResolvedValue({ rows: [pendingOrder], rowCount: 1 } as any);
});

describe("POST /api/payments/verify", () => {
  it("rejects callers that do not own the order or present its access token", async () => {
    const response = await POST(
      request({ orderId: pendingOrder.id, provider: "hubtel" }),
    );

    expect(response.status).toBe(401);
    expect(mockedVerifyHubtelTransaction).not.toHaveBeenCalled();
  });

  it("reports a provider decline while leaving the order pending for retry", async () => {
    mockedHashAccessToken.mockReturnValue("stored-hash");
    mockedNormalizeHubtelStatus.mockReturnValue("Failed");
    mockedVerifyHubtelTransaction.mockResolvedValue({
      verified: false,
      status: "Failed",
      amount: null,
    });

    const response = await POST(
      request({ orderId: pendingOrder.id, provider: "hubtel" }, "access-token"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      status: "pending",
      paymentStatus: "failed",
      verified: false,
    });
  });

  it("does not re-verify an already confirmed order", async () => {
    mockedQuery.mockResolvedValue({
      rows: [{ ...pendingOrder, status: "processing" }],
      rowCount: 1,
    } as any);
    mockedHashAccessToken.mockReturnValue("stored-hash");

    const response = await POST(
      request({ orderId: pendingOrder.id, provider: "hubtel" }, "access-token"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      status: "processing",
      paymentStatus: "confirmed",
    });
    expect(mockedVerifyHubtelTransaction).not.toHaveBeenCalled();
  });
});
