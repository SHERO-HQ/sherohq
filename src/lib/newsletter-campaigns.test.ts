import { describe, expect, it } from "vitest";
import {
  NewsletterCampaignValidationError,
  normalizeNewsletterCampaignInput,
} from "./newsletter-campaigns";

describe("normalizeNewsletterCampaignInput", () => {
  it("requires a WhatsApp template for test sends", () => {
    expect(() =>
      normalizeNewsletterCampaignInput({
        channel: "whatsapp",
        subject: "Verify Account",
        content: "Your code is 123456",
        testPhone: "+233501234567",
      }),
    ).toThrow(NewsletterCampaignValidationError);
  });

  it("accepts WhatsApp test sends with an approved template name", () => {
    const input = normalizeNewsletterCampaignInput({
      channel: "whatsapp",
      subject: "Verify Account",
      content: "Your code is 123456",
      testPhone: "+233501234567",
      whatsappTemplateName: "verify_account",
    });

    expect(input.whatsappTemplateName).toBe("verify_account");
    expect(input.testPhone).toBe("+233501234567");
  });
});
