import { describe, expect, it } from "vitest";
import { firstSentence, hasImage, isMark, toBlocks } from "./project-text";

describe("toBlocks", () => {
  it("splits paragraphs, numbered and bulleted lists", () => {
    const text = "Intro line.\n\n1. Take orders\n2. Track stock\n\n- Fast\n• Cheap\nClosing.";
    expect(toBlocks(text)).toEqual([
      { type: "p", text: "Intro line." },
      { type: "ol", items: ["Take orders", "Track stock"] },
      { type: "ul", items: ["Fast", "Cheap"] },
      { type: "p", text: "Closing." },
    ]);
  });

  it("splits a bullet that runs on from the sentence before it", () => {
    expect(toBlocks("It lets you: • Sell • Ship")).toEqual([
      { type: "p", text: "It lets you:" },
      { type: "ul", items: ["Sell", "Ship"] },
    ]);
  });

  it("handles Windows line endings and empty text", () => {
    expect(toBlocks("A\r\nB")).toEqual([
      { type: "p", text: "A" },
      { type: "p", text: "B" },
    ]);
    expect(toBlocks("")).toEqual([]);
  });
});

describe("firstSentence", () => {
  it("returns the first sentence without a Challenge label", () => {
    expect(firstSentence("Challenge: Orders get lost. Then more.")).toBe("Orders get lost.");
  });

  it("returns the whole text when there is no full stop", () => {
    expect(firstSentence("  No stop here ")).toBe("No stop here");
    expect(firstSentence(null)).toBe("");
  });
});

describe("images", () => {
  it("accepts URLs and paths only", () => {
    expect(hasImage("https://x.test/a.png")).toBe(true);
    expect(hasImage("/a.png")).toBe(true);
    expect(hasImage("placeholder")).toBe(false);
    expect(hasImage(null)).toBe(false);
  });

  it("treats SVGs as marks", () => {
    expect(isMark("https://x.test/logo.svg")).toBe(true);
    expect(isMark("https://x.test/shot.jpg")).toBe(false);
  });
});
