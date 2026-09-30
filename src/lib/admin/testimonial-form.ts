// The testimonial editor's rules. A testimonial can't be published without a
// record of when and how the person agreed (the database refuses it too).
import { normaliseOrderNumber } from "@/lib/orders";

export type TestimonialValues = {
  quote: string;
  attribution: string;
  business: string | null;
  source: "project" | "order";
  projectId: string | null;
  orderNumber: string | null;
  consentGivenAt: Date | null;
  consentMethod: string | null;
  published: boolean;
};

export type TestimonialErrors = Partial<Record<keyof TestimonialValues | "consentDate", string>>;

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

export function parseTestimonialForm(
  form: FormData,
  today: Date = new Date(),
): { ok: true; values: TestimonialValues } | { ok: false; errors: TestimonialErrors } {
  const errors: TestimonialErrors = {};
  // Straight quotes a person typed become the page's own quote marks.
  const quote = text(form, "quote").replace(/^["“”']+|["“”']+$/g, "").trim();
  if (!quote) errors.quote = "Add their words, exactly as they said them.";
  else if (quote.length > 400) errors.quote = "Keep it under 400 characters; a shorter quote reads better.";

  const attribution = text(form, "attribution");
  if (!attribution) errors.attribution = "Their name or initials, as they agreed to be named.";

  const source = text(form, "source") === "order" ? "order" : "project";
  const projectId = source === "project" ? text(form, "projectId") || null : null;
  if (source === "project" && !projectId) errors.projectId = "Choose the project.";
  const rawOrder = text(form, "orderNumber");
  const orderNumber = source === "order" ? normaliseOrderNumber(rawOrder) : null;
  if (source === "order" && !orderNumber) errors.orderNumber = "Enter the order number, e.g. SH-7K2QX.";

  const consent = form.get("consent") === "on";
  const rawDate = text(form, "consentDate");
  const consentMethod = text(form, "consentMethod") || null;
  let consentGivenAt: Date | null = null;
  if (consent) {
    consentGivenAt = rawDate ? new Date(`${rawDate}T12:00:00Z`) : null;
    if (!consentGivenAt || Number.isNaN(consentGivenAt.getTime())) errors.consentDate = "When did they agree?";
    else if (consentGivenAt.getTime() > today.getTime() + 24 * 60 * 60 * 1000) errors.consentDate = "That date is in the future.";
    if (!consentMethod) errors.consentMethod = "How did they agree, e.g. a WhatsApp message?";
  }

  const published = form.get("published") === "on";
  if (published && !consent) errors.published = "Record their consent before publishing.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    values: {
      quote,
      attribution,
      business: text(form, "business") || null,
      source,
      projectId,
      orderNumber,
      consentGivenAt,
      consentMethod: consent ? consentMethod : null,
      published,
    },
  };
}

/** Asking permission on WhatsApp: their exact words, and how they'll be named. */
export function consentRequest(quote: string, attribution: string): string {
  return (
    `Hello, this is SHERO. Thank you for your kind words: "${quote}" May we show them on sherohq.com, ` +
    `signed "${attribution}"? You can say no, or ask us to take them down at any time.`
  );
}
