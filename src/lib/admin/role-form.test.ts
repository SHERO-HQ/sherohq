import { describe, expect, it } from "vitest";
import { parseRoleForm } from "./role-form";

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [k, v] of Object.entries(fields)) data.set(k, v);
  return data;
};

describe("parseRoleForm", () => {
  it("needs a title, what the work is and how to apply", () => {
    const parsed = parseRoleForm(form({ title: " " }));
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) expect(Object.keys(parsed.errors).sort()).toEqual(["description", "howToApply", "title"]);
  });

  it("reads the open switch", () => {
    expect(parseRoleForm(form({ title: "Technician", description: "Fix laptops.", howToApply: "Email us.", open: "on" }))).toEqual({
      ok: true,
      values: { title: "Technician", description: "Fix laptops.", howToApply: "Email us.", open: true },
    });
  });
});
