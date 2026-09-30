import { phoneFromParts } from "@/lib/phone";

export const needOptions = [
  { value: "software", label: "Custom software" },
  { value: "hardware", label: "Laptops or hardware for my team" },
  { value: "managed-it", label: "IT setup or support" },
  { value: "integrations", label: "Connecting systems or payments" },
  { value: "unsure", label: "I'm not sure yet" },
] as const;

export const contactOptions = [
  { value: "call", label: "Phone call" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
] as const;

export type Need = (typeof needOptions)[number]["value"];
export type ContactMethod = (typeof contactOptions)[number]["value"];

export type ConsultationRequest = {
  name: string;
  phone: string;
  email: string | null;
  business: string | null;
  need: Need;
  message: string | null;
  contact: ContactMethod;
};

export type FieldErrors = Partial<Record<keyof ConsultationRequest, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const text = (value: FormDataEntryValue | null) => (typeof value === "string" ? value.trim() : "");

/** Validates the form on both client and server; the server's word is final. */
export function parseConsultation(form: FormData):
  | { ok: true; data: ConsultationRequest }
  | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};

  const name = text(form.get("name"));
  if (!name) errors.name = "Tell us your name.";
  else if (name.length > 100) errors.name = "Keep your name under 100 characters.";

  // Clients can be anywhere (software and IT): any number with its country code.
  const phone = phoneFromParts(text(form.get("phoneCountry")), text(form.get("phone")));
  if (!phone) errors.phone = "Check the number and its country code.";

  const email = text(form.get("email"));
  if (email && !EMAIL.test(email)) errors.email = "Check the email address, or leave it empty.";

  const need = text(form.get("need"));
  if (!needOptions.some((o) => o.value === need)) errors.need = "Choose what you need help with.";

  const contact = text(form.get("contact"));
  if (!contactOptions.some((o) => o.value === contact)) errors.contact = "Choose how we should reach you.";
  else if (contact === "email" && !email) errors.email = "Add your email so we can reply there.";

  const message = text(form.get("message"));
  if (message.length > 2000) errors.message = "Keep it under 2,000 characters.";

  const business = text(form.get("business"));

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    data: {
      name,
      phone: phone!,
      email: email || null,
      business: business ? business.slice(0, 120) : null,
      need: need as Need,
      message: message || null,
      contact: contact as ContactMethod,
    },
  };
}
