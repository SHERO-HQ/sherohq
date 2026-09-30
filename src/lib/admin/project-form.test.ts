import { describe, expect, it } from "vitest";
import { emptyProjectFields, parseProjectForm } from "./project-form";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe("parseProjectForm", () => {
  it("stores empty text as null, so the site shows a placeholder", () => {
    const result = parseProjectForm(form({ name: "Tastea", client: "", summary: "Orders in one place", published: "on" }), null);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.values).toMatchObject({ slug: "tastea", client: null, summary: "Orders in one place", published: true });
  });

  it("keeps the slug when editing and checks the link", () => {
    const result = parseProjectForm(form({ name: "TrustCircle", url: "http://trustcircle.app" }), "trustcircle");
    expect(!result.ok && result.errors.url).toBe("Use an https:// address.");
    const ok = parseProjectForm(form({ name: "TrustCircle", slug: "other", url: "https://trustcircle.app" }), "trustcircle");
    expect(ok.ok && ok.values.slug).toBe("trustcircle");
  });

  it("lists the fields still empty", () => {
    expect(emptyProjectFields({ client: "Samakose", year: "2025" })).toEqual([
      "What we built",
      "One-line summary",
      "Outcome",
      "The problem",
      "What we built, in words",
      "The result",
    ]);
  });
});
