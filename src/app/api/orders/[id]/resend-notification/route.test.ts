import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({
  getAdminFromSession: vi.fn().mockResolvedValue({ id: "admin-1", username: "admin", role: "superadmin" }),
  getUserFromSession: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/db", () => {
  const mockOrder = {
    id: "ord-test-123",
    status: "pending",
    paymentMethod: "momo",
    createdAt: "2026-08-13T10:00:00.000Z",
    total: "500.00",
    shippingInfo: JSON.stringify({
      firstName: "Ama",
      lastName: "Osei",
      email: "ama@example.com",
      phone: "+233548711582",
    }),
    items: JSON.stringify([
      { id: "p1", name: "Wireless Headphones", price: 500, quantity: 1 },
    ]),
  };

  return {
    db: {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockOrder]),
          }),
        }),
      }),
    },
  };
});

vi.mock("@/lib/notifications", () => ({
  notificationService: {
    sendPendingOrderReminderNotification: vi.fn().mockResolvedValue(undefined),
    sendOrderConfirmation: vi.fn().mockResolvedValue(undefined),
    sendOrderStatusUpdateNotification: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@/lib/activity", () => ({
  logActivity: vi.fn().mockResolvedValue(undefined),
}));

describe("POST /api/orders/[id]/resend-notification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends payment reminder notification directly for pending orders", async () => {
    const request = new NextRequest("http://localhost/api/orders/ord-test-123/resend-notification", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request, { params: Promise.resolve({ id: "ord-test-123" }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.type).toBe("reminder");
    expect(json.message).toContain("ama@example.com");
  });
});
