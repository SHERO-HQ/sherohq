import { describe, expect, it } from "vitest";
import { business, whatsappLink } from "./site";

describe("whatsappLink", () => {
  it("links to SHERO's number by default", () => {
    expect(whatsappLink()).toBe("https://wa.me/233548711582");
  });

  it("URL-encodes the prefilled message", () => {
    expect(whatsappLink("Is the HP EliteBook still available?")).toBe(
      "https://wa.me/233548711582?text=Is%20the%20HP%20EliteBook%20still%20available%3F",
    );
  });
});

describe("business", () => {
  it("keeps the Meta verification line word for word", () => {
    expect(business.legalLine).toBe("SHERO HQ is a brand of SHERO FINTECH");
  });
});
