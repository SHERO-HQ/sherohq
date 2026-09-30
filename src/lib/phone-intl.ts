// Phone numbers from any country, using libphonenumber's data (every country,
// its dialling code and its numbering rules). Kept apart from phone.ts so the
// library loads only where it's needed: on the server, and in the browser
// once someone types a number (PhoneField).
import { getCountries, getCountryCallingCode, isSupportedCountry, parsePhoneNumberFromString } from "libphonenumber-js/min";
import { normaliseGhanaPhone, type CountryOption } from "./phone";

/**
 * Joins the country the visitor chose (ISO code, e.g. "GB") and the number
 * into E.164, checked against that country's numbering rules. A number typed
 * with its own + or 00 code wins over the chosen country. Ghana keeps the
 * mobile-only rule above (we reply on WhatsApp).
 */
export function phoneFromParts(country: string, number: string): string | null {
  const typed = number.trim();
  const compact = typed.replace(/[\s\-().]/g, "");
  if (/^(\+|00)/.test(compact)) {
    const parsed = parsePhoneNumberFromString(compact.replace(/^00/, "+"));
    if (parsed?.country === "GH") return normaliseGhanaPhone(compact);
    return parsed?.isValid() ? parsed.number : null;
  }
  if (country === "GH" || country === "") return normaliseGhanaPhone(typed);
  if (!isSupportedCountry(country)) return null;
  const parsed = parsePhoneNumberFromString(typed, country);
  return parsed?.isValid() ? parsed.number : null;
}

/** The country a number typed with its own + code belongs to, if it's clear. */
export function countryOfNumber(number: string): string | null {
  const compact = number.replace(/[\s\-().]/g, "").replace(/^00/, "+");
  if (!compact.startsWith("+")) return null;
  return parsePhoneNumberFromString(compact)?.country ?? null;
}

let countries: CountryOption[] | undefined;
/** Every country with its dialling code, by name ("Ghana (+233)"), from libphonenumber's data. */
export function countryOptions(): CountryOption[] {
  if (!countries) {
    const names = new Intl.DisplayNames(["en"], { type: "region" });
    countries = getCountries()
      .map((iso) => ({ iso, name: names.of(iso) ?? iso, code: getCountryCallingCode(iso) }))
      .sort((a, b) => a.name.localeCompare(b.name, "en"));
  }
  return countries;
}
