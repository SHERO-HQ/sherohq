import { describe, expect, it } from "vitest";
import { consultationReply, consultationTabs, isConsultationStatus } from "./consultation-flow";

describe("consultation flow", () => {
  it("puts every step in exactly one tab", () => {
    const all = consultationTabs.flatMap((t) => t.statuses);
    expect(new Set(all).size).toBe(all.length);
    expect(all).toHaveLength(6);
  });

  it("writes a first reply with their first name and what they asked about", () => {
    expect(consultationReply({ name: "Yaw  Boateng", need: "software" })).toBe(
      "Hello Yaw, this is SHERO. Thanks for your consultation request about custom software. When is a good time to talk?",
    );
    expect(consultationReply({ name: "Esi", need: "unsure" })).toContain("what you need");
  });

  it("knows its statuses", () => {
    expect(isConsultationStatus("call_held")).toBe(true);
    expect(isConsultationStatus("lost")).toBe(false);
  });
});
