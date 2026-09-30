import type { PhoneReader } from "@/lib/phone";

/** The product-specific parts of a waitlist form (set per product in the admin). */
export type WaitlistConfig = {
  slug: string;
  name: string;
  namePlaceholder: string;
  businessLabel: string;
  businessPlaceholder: string;
  detailLabel: string;
  detailPlaceholder: string;
  /** The question takes a whole number, e.g. number of branches. */
  detailNumeric: boolean;
};

export type WaitlistSignup = {
  name: string;
  phone: string;
  business: string;
  /** The answer to the product's own question. */
  detail: string;
};

export type WaitlistErrors = Partial<Record<"name" | "phone" | "business" | "detail", string>>;

const text = (value: FormDataEntryValue | null) => (typeof value === "string" ? value.trim() : "");
const lower = (label: string) => label.charAt(0).toLowerCase() + label.slice(1).replace(/\?$/, "");

export function parseWaitlist(
  product: Pick<WaitlistConfig, "businessLabel" | "detailLabel" | "detailNumeric">,
  form: FormData,
  readPhone: PhoneReader,
): { ok: true; data: WaitlistSignup } | { ok: false; errors: WaitlistErrors } {
  const errors: WaitlistErrors = {};

  const name = text(form.get("name"));
  if (!name) errors.name = "Tell us your name.";
  else if (name.length > 100) errors.name = "Keep your name under 100 characters.";

  const phone = readPhone(text(form.get("phoneCountry")), text(form.get("phone")));
  if (!phone) errors.phone = "Check the number and the country.";

  const business = text(form.get("business"));
  if (!business) errors.business = `Tell us the ${lower(product.businessLabel)}.`;
  else if (business.length > 120) errors.business = "Keep it under 120 characters.";

  const detail = text(form.get("detail"));
  if (product.detailNumeric) {
    const value = Number(detail);
    if (!detail || !Number.isInteger(value) || value < 1 || value > 10_000)
      errors.detail = "Enter a number, like 3.";
  } else if (!detail) errors.detail = `Tell us: ${lower(product.detailLabel)}.`;
  else if (detail.length > 200) errors.detail = "Keep it under 200 characters.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { name, phone: phone!, business, detail } };
}
