import { createHmac } from "node:crypto";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockTxExecute = vi.fn();
const mockTxUpdate = vi.fn();
const mockTxInsert = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    select: (...args: any[]) => ({
      from: (...args: any[]) => ({
        where: (...args: any[]) => ({
          limit: (...args: any[]) => {
            if (args[0] === 1) {
              return [{
                id: "ab12cd34-5678-4abc-8def-0123456789ab",
                status: "processing",
                total: 100,
                items: [],
                shippingInfo: {},
                paymentMethod: "card",
              }];
            }
            return [];
          }
        })
      })
    }),
    transaction: async (cb: any) => {
      return cb({
        execute: vi.fn(async () => {
          mockTxExecute();
          return {
            rowCount: 1,
            rows: [{
              id: "ab12cd34-5678-4abc-8def-0123456789ab",
              status: "processing",
              total: 100,
              items: [],
              shippingInfo: {},
              paymentMethod: "card",
            }]
          };
        }),
        update: (...args: any[]) => ({
          set: (...args: any[]) => ({
            where: (...args: any[]) => mockTxUpdate(...args)
          })
        }),
        insert: (...args: any[]) => ({
          values: (...args: any[]) => mockTxInsert(...args)
        })
      });
    }
  },
  getClient: () => ({
    query: vi.fn(async (queryStr) => {
      if (queryStr.includes("SELECT")) {
        return {
          rowCount: 1,
          rows: [{
            id: "ab12cd34-5678-4abc-8def-0123456789ab",
            status: "pending",
            total: 100,
            items: [],
            shippingInfo: {},
            paymentMethod: "card",
          }]
        };
      }
      return { rowCount: 1, rows: [] };
    }),
    release: vi.fn()
  })
}));

import { POST } from "./route";

const orderId = "ab12cd34-5678-4abc-8def-0123456789ab";

beforeEach(() => {
  vi.clearAllMocks();
  process.env.PAYSTACK_SECRET = "test-paystack-secret";
});

describe("POST /api/payments/webhook", () => {
  it("does not reconfirm or notify an order already processed by an earlier webhook", async () => {
    const body = JSON.stringify({
      event: "charge.success",
      data: {
        metadata: { orderId },
        reference: orderId,
        status: "success",
        amount: 10_000,
      },
    });
    // @ts-ignore
    const signature = createHmac("sha512", process.env.PAYSTACK_SECRET || "")
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
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(mockTxUpdate).not.toHaveBeenCalled();
    expect(mockTxInsert).not.toHaveBeenCalled();
  });
});
