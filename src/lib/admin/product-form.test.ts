import { describe, expect, it } from "vitest";
import { parseProductForm, slugFromName } from "./product-form";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const base = {
  name: "Schoolbook",
  status: "in_development",
  theme: "shero",
  title: "Fees and results for small schools.",
  summary: "Fees, results and reports for small private schools.",
  problem: "Fees are tracked in exercise books.",
  audience: "Small private schools.",
  "compare-today-0": "Fees in exercise books",
  "compare-with-0": "Every payment recorded, with a receipt",
  detailLabel: "How many pupils?",
  detailNumeric: "on",
  published: "on",
  displayOrder: "3",
};

describe("parseProductForm", () => {
  it("parses a new product and makes its slug from the name", () => {
    const result = parseProductForm(form(base), null);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.values).toMatchObject({
      slug: "schoolbook",
      compare: [{ today: "Fees in exercise books", with: "Every payment recorded, with a receipt" }],
      detailNumeric: true,
      published: true,
      displayOrder: 3,
      liveUrl: null,
    });
  });

  it("keeps the existing slug when editing", () => {
    const result = parseProductForm(form({ ...base, slug: "something-else" }), "schoolbook");
    expect(result.ok && result.values.slug).toBe("schoolbook");
  });

  it("refuses a slug that is already a page", () => {
    const result = parseProductForm(form({ ...base, slug: "shop" }), null);
    expect(!result.ok && result.errors.slug).toBe("sherohq.com/shop is already a page. Choose another.");
  });

  it("needs an https address for a live product", () => {
    const missing = parseProductForm(form({ ...base, status: "live" }), null);
    expect(!missing.ok && missing.errors.liveUrl).toBe("A live product needs its address.");
    const plain = parseProductForm(form({ ...base, status: "live", liveUrl: "http://schoolbook.app" }), null);
    expect(!plain.ok && plain.errors.liveUrl).toBe("Use an https:// address.");
    const ok = parseProductForm(form({ ...base, status: "live", liveUrl: "https://schoolbook.app" }), null);
    expect(ok.ok).toBe(true);
  });

  it("flags a half-filled comparison row", () => {
    const result = parseProductForm(form({ ...base, "compare-today-1": "Reports by hand" }), null);
    expect(!result.ok && result.errors["compare-1"]).toBe("Fill in both sides, or clear the row.");
  });

  it("makes readable slugs", () => {
    expect(slugFromName("Pharmasyst Pro 2")).toBe("pharmasyst-pro-2");
  });
});
