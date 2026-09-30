/**
 * Normalises a Ghana mobile number to E.164 (+233XXXXXXXXX), or returns null.
 * Accepts 0244123456, 244123456, +233244123456 and 233244123456, with spaces
 * or dashes. Used by every form and by order tracking.
 */
export function normaliseGhanaPhone(input: string): string | null {
  const digits = input.replace(/[\s\-().]/g, "").replace(/^\+/, "");
  let national: string;
  if (/^233\d{9}$/.test(digits)) national = digits.slice(3);
  else if (/^0\d{9}$/.test(digits)) national = digits.slice(1);
  else if (/^\d{9}$/.test(digits)) national = digits;
  else return null;
  // Ghana mobile numbers start with 2 or 5 after the leading 0.
  return /^[25]\d{8}$/.test(national) ? `+233${national}` : null;
}

/**
 * Any phone number, for clients outside Ghana too (consultations, waitlists):
 * a Ghana mobile in its usual forms, or an international number with its
 * country code (+44 7700 900123 or 0044…). Returns E.164, or null. The shop
 * keeps to normaliseGhanaPhone: it delivers and takes MoMo within Ghana.
 */
export function normalisePhone(input: string): string | null {
  const ghana = normaliseGhanaPhone(input);
  if (ghana) return ghana;
  const compact = input.replace(/[\s\-().]/g, "").replace(/^00/, "+");
  if (!/^\+[1-9]\d{6,14}$/.test(compact)) return null;
  // A Ghana number with a country code must be a valid Ghana mobile (above).
  if (compact.startsWith("+233")) return null;
  return compact;
}

/** A number typed with its own + or 00 country code (at least a few digits of it). */
export function looksInternational(value: string): boolean {
  return /^(\+|00)\d{6,}/.test(value.replace(/[\s\-().]/g, ""));
}

/** A country for the phone field: ISO code, English name, dialling code. */
export type CountryOption = { iso: string; name: string; code: string };

/** Reads the phone field's two parts into a checked number, or null. */
export type PhoneReader = (country: string, number: string) => string | null;

/**
 * The browser's first check before sending: just that a number was entered.
 * The server checks it fully (phoneFromParts in phone-intl.ts), so the phone
 * library never has to load for this.
 */
export const phoneEntered: PhoneReader = (_country, number) => (number.trim() ? number.trim() : null);

/** "024 412 3456" for a Ghana number, the E.164 form for others, for reading and dialling. */
export function displayPhone(phone: string | null): string {
  if (!phone) return "–";
  return phone.startsWith("+233") ? `0${phone.slice(4, 6)} ${phone.slice(6, 9)} ${phone.slice(9)}` : phone;
}
