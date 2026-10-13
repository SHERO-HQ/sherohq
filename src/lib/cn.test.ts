import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("lets a later display class win", () => {
    expect(cn("inline-flex", "hidden md:inline-flex")).toBe("hidden md:inline-flex");
  });
  it("keeps font size and token colour together", () => {
    expect(cn("text-[15px] text-on-primary")).toBe("text-[15px] text-on-primary");
  });
  it("lets a later token radius win", () => {
    expect(cn("rounded-control", "rounded-card")).toBe("rounded-card");
  });
});
