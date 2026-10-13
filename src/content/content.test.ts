import { describe, expect, it } from "vitest";
import { products } from "./products";
import { services } from "./services";
import { site, whatsappLink } from "./site";
import { work } from "./work";

/** Guards the brand's truth rules (PRODUCT.md) so a content edit can't break them silently. */
describe("content truth rules", () => {
  it("shows only the three authorised client projects", () => {
    expect(work.map((w) => w.name).sort()).toEqual(["Dajrim", "Tastea", "TrustCircle"]);
  });

  it("never invents client text", () => {
    for (const w of work) {
      for (const field of [w.summary, w.challenge, w.whatWeBuilt]) {
        expect(field === null || field.length > 0).toBe(true);
      }
    }
  });

  it("states real working hours, never 24/7", () => {
    expect(site.hours.days).toBe("Mon–Fri");
    expect(`${site.hours.open}–${site.hours.close}`).toBe("8:00–18:00");
    const all = JSON.stringify({ site, services, products });
    expect(all).not.toMatch(/24\s*\/\s*7/);
  });

  it("carries the legal line verbatim", () => {
    expect(site.legalLine).toBe("SHERO HQ is a brand of SHERO FINTECH.");
  });

  it("marks unreleased products as not live", () => {
    for (const p of products) expect(p.status).not.toBe("live");
  });

  it("sends hardware buyers to Merchander, not an on-site shop", () => {
    expect(services.find((s) => s.id === "hardware")?.href).toBe("/merchander");
  });

  it("avoids team language for a single-operator company", () => {
    const all = JSON.stringify({ site, services, products });
    expect(all).not.toMatch(/\bteam of\b|\bour team\b/i);
  });

  it("builds WhatsApp links with an encoded message", () => {
    expect(whatsappLink()).toBe("https://wa.me/233548711582");
    expect(whatsappLink("Hi & hello")).toBe("https://wa.me/233548711582?text=Hi%20%26%20hello");
  });
});
