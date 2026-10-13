import { describe, expect, it } from "vitest";
import { toBlocks } from "./richText";

describe("toBlocks", () => {
  it("splits paragraphs on blank lines", () => {
    expect(toBlocks("One.\n\nTwo.")).toEqual([
      { type: "p", text: "One." },
      { type: "p", text: "Two." },
    ]);
  });

  it("groups numbered lines into one ordered list", () => {
    expect(toBlocks("It lets you:\n\n1. Order.\n2. Pay.")).toEqual([
      { type: "p", text: "It lets you:" },
      { type: "ol", items: ["Order.", "Pay."] },
    ]);
  });

  it("groups bullets into an unordered list", () => {
    expect(toBlocks("- a\n• b")).toEqual([{ type: "ul", items: ["a", "b"] }]);
  });
});
