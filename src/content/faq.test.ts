import { describe, expect, it } from "vitest";
import { buildFaq, productsAnswer } from "./faq";

describe("the products FAQ answer", () => {
  it("names products in development and points to the waitlist", () => {
    expect(
      productsAnswer([
        { name: "Merchander", status: "in_development" },
        { name: "Pharmasyst", status: "in_development" },
      ]),
    ).toBe("Not yet. Merchander and Pharmasyst are in development. Join the waitlist on their pages to hear first.");
  });

  it("says which are live once one launches", () => {
    expect(
      productsAnswer([
        { name: "Merchander", status: "live" },
        { name: "Pharmasyst", status: "in_development" },
      ]),
    ).toBe("Merchander is live: open its page to start. Pharmasyst is in development. Join the waitlist on its page to hear first.");
  });

  it("leaves the question out when there are no products", () => {
    const questions = buildFaq([], "GHS 2,000").flatMap((g) => g.items.map((i) => i.q));
    expect(questions).not.toContain("Can I use your own products yet?");
  });
});
