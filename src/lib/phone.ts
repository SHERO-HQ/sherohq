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

/**
 * Joins the country code the visitor typed (e.g. "+44", "44") and the number
 * into E.164. Any country works: codes are 1 to 3 digits. A number typed with
 * its own + or 00 code wins; a leading 0 (trunk prefix) is dropped, as it's
 * never dialled from abroad.
 */
export function phoneFromParts(codeInput: string, number: string): string | null {
  const typed = number.trim();
  if (/^(\+|00)/.test(typed.replace(/[\s\-().]/g, ""))) return normalisePhone(typed);
  const code = codeInput.trim().replace(/^(\+|00)/, "");
  if (code === "233" || code === "") return normaliseGhanaPhone(typed);
  if (!/^[1-9]\d{0,2}$/.test(code)) return null;
  const national = typed.replace(/[\s\-().]/g, "").replace(/^0/, "");
  if (!/^\d{4,14}$/.test(national)) return null;
  return normalisePhone(`+${code}${national}`);
}
