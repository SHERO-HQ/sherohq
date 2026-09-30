import { describe, expect, it } from "vitest";
import { consentRequest, parseTestimonialForm } from "./testimonial-form";

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [k, v] of Object.entries(fields)) data.set(k, v);
  return data;
};
const base = { quote: "“Perfect for school.”", attribution: "Abena O.", source: "order", orderNumber: "sh-7k2qx" };

describe("parseTestimonialForm", () => {
  it("strips typed quote marks and normalises the order number", () => {
    const parsed = parseTestimonialForm(form(base));
    expect(parsed).toMatchObject({ ok: true, values: { quote: "Perfect for school.", orderNumber: "SH-7K2QX", published: false } });
  });

  it("refuses to publish without consent", () => {
    expect(parseTestimonialForm(form({ ...base, published: "on" }))).toMatchObject({
      ok: false,
      errors: { published: "Record their consent before publishing." },
    });
  });

  it("needs when and how consent was given", () => {
    expect(parseTestimonialForm(form({ ...base, consent: "on" }))).toMatchObject({ ok: false });
    const ok = parseTestimonialForm(
      form({ ...base, consent: "on", consentDate: "2026-09-29", consentMethod: "WhatsApp", published: "on" }),
      new Date("2026-09-30T00:00:00Z"),
    );
    expect(ok).toMatchObject({ ok: true, values: { published: true, consentMethod: "WhatsApp" } });
  });

  it("needs a project for a project testimonial", () => {
    expect(parseTestimonialForm(form({ ...base, source: "project" }))).toMatchObject({ ok: false, errors: { projectId: "Choose the project." } });
  });

  it("asks consent with their exact words", () => {
    expect(consentRequest("Great laptop.", "Abena O.")).toContain('"Great laptop." May we show them on sherohq.com, signed "Abena O."');
  });
});
