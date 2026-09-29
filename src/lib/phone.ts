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
