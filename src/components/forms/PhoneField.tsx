"use client";

import { useState } from "react";
import { controlLook } from "@/components/forms/fields";
import { looksInternational, type CountryOption } from "@/lib/phone";
import { cn } from "@/lib/cn";

/**
 * A phone number with its country, for forms that take clients anywhere
 * (consultations, waitlists). The country is chosen by name from every
 * country (Ghana to start; type a letter to jump), so nobody needs to know
 * their dialling code. A number typed with its own + code picks its country.
 * The list comes from the server (countryOptions); the phone library loads in
 * the browser only once someone types a +. Submits `phoneCountry` (ISO code)
 * and `phone`; the server checks them with phoneFromParts.
 */
export function PhoneField({
  id,
  error,
  countries,
  className,
}: {
  id: string;
  error?: string;
  countries: CountryOption[];
  className?: string;
}) {
  const [country, setCountry] = useState("GH");

  async function detect(value: string) {
    if (!looksInternational(value)) return;
    const { countryOfNumber } = await import("@/lib/phone-intl");
    const found = countryOfNumber(value);
    if (found) setCountry(found);
  }

  return (
    // min-w-0: a fieldset otherwise refuses to shrink below its contents and
    // widens the page. @container: country and number sit side by side only
    // when the field itself has room (the waitlist card is narrow even on desktop).
    <fieldset className={cn("@container flex min-w-0 flex-col gap-1.5", className)}>
      <legend className="mb-1.5 text-label text-ink">Phone number</legend>
      <div className="flex flex-col gap-2 @sm:flex-row">
        <label htmlFor={`${id}-country`} className="sr-only">
          Country
        </label>
        <select
          id={`${id}-country`}
          name="phoneCountry"
          value={country}
          onChange={(event) => setCountry(event.target.value)}
          autoComplete="country"
          className={cn(controlLook, "h-10 w-full min-w-0 px-2.5 @sm:w-44 @sm:shrink-0")}
        >
          {countries.map((c) => (
            <option key={c.iso} value={c.iso}>
              {c.name} (+{c.code})
            </option>
          ))}
        </select>
        <label htmlFor={id} className="sr-only">
          Number
        </label>
        <input
          id={id}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={country === "GH" ? "024 412 3456" : "Phone number"}
          onChange={(event) => void detect(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : `${id}-hint`}
          className={cn(controlLook, "h-10 w-full min-w-0 @sm:flex-1")}
        />
      </div>
      {error ? (
        <span id={`${id}-error`} className="text-body-sm text-danger">
          {error}
        </span>
      ) : (
        <span id={`${id}-hint`} className="text-body-sm text-ink-muted">
          Outside Ghana? Choose your country.
        </span>
      )}
    </fieldset>
  );
}
