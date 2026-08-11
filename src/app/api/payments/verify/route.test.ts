import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAdminFromSession, getUserFromSession } from "@/lib/auth";
import { hashOrderAccessToken } from "@/lib/orderUtils";
import { normalizeHubtelStatus, verifyHubtelTransaction } from "@/lib/hubtel";

const mockDbSelect = vi.fn();
const mockDbUpdate = vi.fn();
const mockDbInsert = vi.fn();
const mockDbTransaction = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    select: (...args: any[]) => ({
      from: (...args: any[]) => ({
        where: (...args: any[]) => ({
          limit: (...args: any[]) => mockDbSelect(...args),
        })
      })
    }),
    update: (...args: any[]) => ({
      set: (...args: any[]) => ({
        where: (...args: any[]) => mockDbUpdate(...args)
      })
    }),
    insert: (...args: any[]) => ({
      values: (...args: any[]) => mockDbInsert(...args)
    }),
    transaction: (cb: any) => mockDbTransaction(cb),
  }
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
  mockDbSelect.mockResolvedValue([pendingOrder]);
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
    mockDbSelect.mockResolvedValue([{ ...pendingOrder, status: "processing" }]);
    mockedHashAccessToken.mockReturnValue("stored-hash");

    const response = await POST(
      request({ orderId: pendingOrder.id, provider: "hubtel" }, "access-token"),
    );
    
    expect(response.status).toBe(200);
    expect(mockedVerifyHubtelTransaction).not.toHaveBeenCalled();
  });
});
