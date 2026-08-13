import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendPendingOrderReminderNotification } from "./sendPendingOrderReminder";
import * as emailModule from "../../core/email";
import * as waMessagesModule from "@/lib/whatsapp-messages";

vi.mock("../../core/email", () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
  wrapEmailHtml: vi.fn((body: string) => `<html>${body}</html>`),
}));

vi.mock("@/lib/whatsapp-messages", () => ({
  sendWhatsAppMessageDirect: vi.fn().mockResolvedValue({ success: true, messageId: "msg_123" }),
  storeOutgoingMessage: vi.fn().mockResolvedValue(true),
}));

describe("sendPendingOrderReminderNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockParams = {
    orderId: "e1b2c3d4-5678-4abc-9def-0123456789ab",
    shippingInfo: {
      firstName: "Kwame",
      lastName: "Mensah",
      email: "kwame@example.com",
      phone: "+233548711582",
      address: "123 High Street",
      city: "Accra",
      region: "Greater Accra",
    },
    items: [
      {
        id: "prod-1",
        name: "MacBook Pro M3",
        price: 15000,
        quantity: 1,
      },
    ],
    total: 15000,
    paymentMethod: "momo",
    stage: "1hr" as const,
    securityToken: "mock-security-hmac-token",
  };

  it("sends 1hr reminder email with correct subject and direct pay link", async () => {
    await sendPendingOrderReminderNotification(mockParams);

    expect(emailModule.sendEmail).toHaveBeenCalledTimes(1);
    const [recipient, subject, htmlContent] = vi.mocked(emailModule.sendEmail).mock.calls[0];

    expect(recipient).toBe("kwame@example.com");
    expect(subject).toContain("Action Required: Complete your order");
    expect(htmlContent).toContain("mock-security-hmac-token");
    expect(htmlContent).toContain("MacBook Pro M3");
    expect(htmlContent).toContain("15,000.00");
  });

  it("sends 24hr reminder email with final reminder subject", async () => {
    await sendPendingOrderReminderNotification({
      ...mockParams,
      stage: "24hr",
    });

    expect(emailModule.sendEmail).toHaveBeenCalledTimes(1);
    const [, subject] = vi.mocked(emailModule.sendEmail).mock.calls[0];

    expect(subject).toContain("Final Reminder: Your reserved order");
  });

  it("sends WhatsApp notification if customer phone is provided", async () => {
    await sendPendingOrderReminderNotification(mockParams);

    expect(waMessagesModule.sendWhatsAppMessageDirect).toHaveBeenCalledTimes(1);
    const [phone, content] = vi.mocked(waMessagesModule.sendWhatsAppMessageDirect).mock.calls[0];

    expect(phone).toBe("233548711582");
    expect(content).toContain("Kwame");
    expect(content).toContain("GHS 15000.00");
  });
});
