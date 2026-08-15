import { describe, it, expect } from "vitest";
import { getSmartReply } from "./whatsapp-auto-reply";

describe("WhatsApp Button and Smart Reply Resolution", () => {
  it("resolves shop smart reply from button ID", () => {
    const result = getSmartReply("btn_shop", "btn_shop");
    expect(result).not.toBeNull();
    expect(result?.message).toContain("/shop");
  });

  it("resolves shop smart reply from human-readable button title", () => {
    const result = getSmartReply("🛒 Shop Products", undefined);
    expect(result).not.toBeNull();
    expect(result?.message).toContain("/shop");
  });

  it("resolves order status smart reply from button ID and button title", () => {
    const resultFromId = getSmartReply("btn_order", "btn_order");
    expect(resultFromId).not.toBeNull();
    expect(resultFromId?.message).toContain("Order ID");

    const resultFromTitle = getSmartReply("📦 Order Status", undefined);
    expect(resultFromTitle).not.toBeNull();
    expect(resultFromTitle?.message).toContain("Order ID");

    const resultFromCTA = getSmartReply("Track Order", "track_order");
    expect(resultFromCTA).not.toBeNull();
    expect(resultFromCTA?.message).toContain("Order ID");
  });

  it("resolves support ticket smart reply from button ID and button title", () => {
    const resultFromId = getSmartReply("btn_support", "btn_support");
    expect(resultFromId).not.toBeNull();
    expect(resultFromId?.message).toContain("support ticket");

    const resultFromTitle = getSmartReply("🎫 Support Ticket", undefined);
    expect(resultFromTitle).not.toBeNull();
    expect(resultFromTitle?.message).toContain("support ticket");
  });
});
