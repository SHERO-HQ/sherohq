import { createHmac } from "node:crypto";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getClient } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  getClient: vi.fn(),
  query: vi.fn(),
}));

import { POST } from "./route";

const mockedGetClient = vi.mocked(getClient);
const orderId = "ab12cd34-5678-4abc-8def-0123456789ab";

beforeEach(() => {
  vi.clearAllMocks();
  process.env.PAYSTACK_SECRET = "test-paystack-secret";
});

describe("POST /api/payments/webhook", () => {
  it("does not reconfirm or notify an order already processed by an earlier webhook", async () => {
    const client = {
      query: vi.fn(async (sql: string) => {
        if (sql.includes("SELECT id, status")) {
          return {
            rowCount: 1,
            rows: [
              {
                id: orderId,
                status: "processing",
                total: 100,
                items: [],
                shippingInfo: {},
                paymentMethod: "card",
              },
            ],
          };
        }
        return { rowCount: 0, rows: [] };
      }),
      release: vi.fn(),
    };
    mockedGetClient.mockResolvedValue(client as any);

    const body = JSON.stringify({
      event: "charge.success",
      data: {
        metadata: { orderId },
        reference: orderId,
        status: "success",
        amount: 10_000,
      },
    });
    const signature = createHmac("sha512", process.env.PAYSTACK_SECRET)
      .update(body)
      .digest("hex");

    const response = await POST(
      new NextRequest("http://localhost/api/payments/webhook", {
        method: "POST",
        headers: { "x-paystack-signature": signature },
        body,
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("OK");
    expect(client.query).not.toHaveBeenCalledWith(
      expect.stringContaining("UPDATE orders SET status"),
      expect.anything(),
    );
    expect(client.query).not.toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO activity_logs"),
      expect.anything(),
    );
    expect(client.release).toHaveBeenCalledOnce();
  });
});
