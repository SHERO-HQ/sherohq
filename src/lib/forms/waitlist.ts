import { normaliseGhanaPhone } from "@/lib/phone";

export type WaitlistProduct = "merchander" | "pharmasyst";

export type WaitlistSignup = {
  product: WaitlistProduct;
  name: string;
  phone: string;
  business: string;
  /** Merchander: what they sell. Pharmasyst: number of branches. */
  detail: string;
};

export type WaitlistErrors = Partial<Record<"name" | "phone" | "business" | "detail", string>>;

const text = (value: FormDataEntryValue | null) => (typeof value === "string" ? value.trim() : "");

export function parseWaitlist(
  product: WaitlistProduct,
  form: FormData,
): { ok: true; data: WaitlistSignup } | { ok: false; errors: WaitlistErrors } {
  const errors: WaitlistErrors = {};

  const name = text(form.get("name"));
  if (!name) errors.name = "Tell us your name.";
  else if (name.length > 100) errors.name = "Keep your name under 100 characters.";

  const phone = normaliseGhanaPhone(text(form.get("phone")));
  if (!phone) errors.phone = "Enter a Ghana mobile number, like 0244123456.";

  const business = text(form.get("business"));
  if (!business) errors.business = product === "pharmasyst" ? "Tell us the pharmacy's name." : "Tell us your business name.";
  else if (business.length > 120) errors.business = "Keep it under 120 characters.";

  const detail = text(form.get("detail"));
  if (product === "pharmasyst") {
    const branches = Number(detail);
    if (!detail || !Number.isInteger(branches) || branches < 1 || branches > 500)
      errors.detail = "Enter the number of branches, like 3.";
  } else if (!detail) errors.detail = "Tell us what you sell.";
  else if (detail.length > 200) errors.detail = "Keep it under 200 characters.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { product, name, phone: phone!, business, detail } };
}
