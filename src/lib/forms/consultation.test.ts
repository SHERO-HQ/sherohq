import { describe, expect, it } from "vitest";
import { parseConsultation } from "./consultation";

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  Object.entries(fields).forEach(([key, value]) => data.set(key, value));
  return data;
};

const valid = { name: "Ama Mensah", phone: "024 412 3456", need: "software", contact: "call" };

describe("parseConsultation", () => {
  it("accepts a minimal request and normalises the phone", () => {
    const result = parseConsultation(form(valid));
    expect(result).toEqual({
      ok: true,
      data: {
        name: "Ama Mensah",
        phone: "+233244123456",
        email: null,
        business: null,
        need: "software",
        message: null,
        contact: "call",
      },
    });
  });

  it("reports each problem against its field", () => {
    const result = parseConsultation(form({ name: "", phone: "123", need: "x", contact: "call" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(["name", "need", "phone"]);
  });

  it("needs an email when email is the chosen contact method", () => {
    const result = parseConsultation(form({ ...valid, contact: "email" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.email).toBeDefined();
  });

  it("rejects a malformed email", () => {
    const result = parseConsultation(form({ ...valid, email: "ama@" }));
    expect(result.ok).toBe(false);
  });
});
