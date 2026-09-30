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
 * Country codes for the phone field on forms that take clients anywhere.
 * Ghana first (most clients), then neighbours and places clients often are;
 * anything else is typed with its own +code.
 */
export const dialCodes = [
  { code: "233", label: "+233 Ghana" },
  { code: "234", label: "+234 Nigeria" },
  { code: "225", label: "+225 Côte d'Ivoire" },
  { code: "228", label: "+228 Togo" },
  { code: "226", label: "+226 Burkina Faso" },
  { code: "229", label: "+229 Benin" },
  { code: "221", label: "+221 Senegal" },
  { code: "254", label: "+254 Kenya" },
  { code: "27", label: "+27 South Africa" },
  { code: "44", label: "+44 United Kingdom" },
  { code: "1", label: "+1 United States or Canada" },
  { code: "49", label: "+49 Germany" },
  { code: "31", label: "+31 Netherlands" },
  { code: "33", label: "+33 France" },
  { code: "971", label: "+971 United Arab Emirates" },
  { code: "86", label: "+86 China" },
  { code: "91", label: "+91 India" },
] as const;

/**
 * Joins the country code and number from the form's phone field into E.164.
 * A number typed with its own + or 00 code wins over the chosen country; a
 * leading 0 (trunk prefix) is dropped, as it's never dialled from abroad.
 */
export function phoneFromParts(code: string, number: string): string | null {
  const typed = number.trim();
  if (/^(\+|00)/.test(typed.replace(/[\s\-().]/g, ""))) return normalisePhone(typed);
  if (code === "233" || code === "") return normaliseGhanaPhone(typed);
  if (!dialCodes.some((d) => d.code === code)) return null;
  const national = typed.replace(/[\s\-().]/g, "").replace(/^0/, "");
  if (!/^\d{4,14}$/.test(national)) return null;
  return normalisePhone(`+${code}${national}`);
}
