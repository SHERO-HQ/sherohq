// Parses the admin's listing form (details, specs, device check, status) into
// database values, with an error per field. The In stock rule itself lives in
// src/lib/listings.ts; the save action applies it with the Settings minimum.
import type { ListingSpecs } from "@/db/schema";
import { deviceTests } from "@/lib/listings";

export const listingStatuses = [
  { value: "draft", label: "Draft" },
  { value: "in_stock", label: "In stock" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
] as const;
export type ListingStatus = (typeof listingStatuses)[number]["value"];

export const specFields: Array<{ key: keyof ListingSpecs; label: string; placeholder: string }> = [
  { key: "processor", label: "Processor", placeholder: "Intel Core i5, 8th gen" },
  { key: "ram", label: "Memory", placeholder: "8GB RAM" },
  { key: "storage", label: "Storage", placeholder: "256GB SSD" },
  { key: "screen", label: "Screen", placeholder: "14-inch, full HD" },
  { key: "graphics", label: "Graphics", placeholder: "Intel UHD 620" },
  { key: "system", label: "System", placeholder: "Windows 11" },
  { key: "other", label: "Also", placeholder: "Backlit keyboard" },
];

export type TestResult = "untested" | "pass" | "fail";

export type ListingValues = {
  model: string;
  category: string;
  pricePesewas: number;
  note: string | null;
  specs: ListingSpecs;
  status: ListingStatus;
  check: {
    screen: boolean | null;
    keyboard: boolean | null;
    trackpad: boolean | null;
    ports: boolean | null;
    speakers: boolean | null;
    camera: boolean | null;
    wifi: boolean | null;
    charging: boolean | null;
    hasBattery: boolean;
    batteryHealth: number | null;
    batteryReplaced: boolean | null;
    batteryType: string | null;
    cosmeticCondition: number | null;
    cleanedAndReset: boolean;
    serialLast4: string | null;
  };
};

export type ListingErrors = Partial<Record<string, string>>;

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

/** "4,200" or "4200.50" (cedis) to pesewas; null if it isn't a positive amount. */
export function parseCedis(raw: string): number | null {
  const clean = raw.replace(/[,\s]/g, "").replace(/^GHS/i, "");
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null;
  const pesewas = Math.round(Number(clean) * 100);
  return pesewas > 0 && pesewas <= 100_000_000 ? pesewas : null;
}

/** A whole percentage 0–100, null when left empty, or "invalid". */
function percent(raw: string): number | null | "invalid" {
  if (raw === "") return null;
  if (!/^\d{1,3}$/.test(raw)) return "invalid";
  const value = Number(raw);
  return value <= 100 ? value : "invalid";
}

function testResult(raw: string): boolean | null {
  return raw === "pass" ? true : raw === "fail" ? false : null;
}

export function parseListingForm(
  form: FormData,
  categories: string[],
): { ok: true; values: ListingValues } | { ok: false; errors: ListingErrors } {
  const errors: ListingErrors = {};

  const model = text(form, "model");
  if (!model) errors.model = "Enter the model.";
  else if (model.length > 120) errors.model = "Keep the model under 120 characters.";

  const category = text(form, "category");
  if (!categories.includes(category)) errors.category = "Choose a category.";

  const pricePesewas = parseCedis(text(form, "price"));
  if (pricePesewas === null) errors.price = "Enter the price in cedis, e.g. 4,200.";

  const note = text(form, "note");
  if (note.length > 200) errors.note = "Keep the note under 200 characters.";

  const specs: ListingSpecs = {};
  for (const field of specFields) {
    const value = text(form, `spec-${field.key}`);
    if (value.length > 80) errors[`spec-${field.key}`] = "Keep this under 80 characters.";
    else if (value) specs[field.key] = value;
  }

  const status = text(form, "status") as ListingStatus;
  if (!listingStatuses.some((s) => s.value === status)) errors.status = "Choose a status.";

  const hasBattery = form.get("hasBattery") === "on";
  const batteryHealth = hasBattery ? percent(text(form, "batteryHealth")) : null;
  if (batteryHealth === "invalid") errors.batteryHealth = "Enter a whole number from 0 to 100.";
  const replacedRaw = text(form, "batteryReplaced");
  const batteryReplaced = hasBattery ? (replacedRaw === "yes" ? true : replacedRaw === "no" ? false : null) : null;
  const batteryType = hasBattery && batteryReplaced ? text(form, "batteryType") || null : null;

  const cosmeticCondition = percent(text(form, "cosmeticCondition"));
  if (cosmeticCondition === "invalid") errors.cosmeticCondition = "Enter a whole number from 0 to 100.";

  const serial = text(form, "serialLast4");
  if (serial && !/^[A-Za-z0-9]{4}$/.test(serial)) errors.serialLast4 = "Enter the last 4 letters or digits.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const tests = Object.fromEntries(deviceTests.map((t) => [t.key, testResult(text(form, `test-${t.key}`))])) as Record<
    (typeof deviceTests)[number]["key"],
    boolean | null
  >;

  return {
    ok: true,
    values: {
      model,
      category,
      pricePesewas: pricePesewas!,
      note: note || null,
      specs,
      status,
      check: {
        ...tests,
        hasBattery,
        batteryHealth: batteryHealth as number | null,
        batteryReplaced,
        batteryType,
        cosmeticCondition: cosmeticCondition as number | null,
        cleanedAndReset: form.get("cleanedAndReset") === "on",
        serialLast4: serial ? serial.toLowerCase() : null,
      },
    },
  };
}

/** A URL slug from the model plus a short random tail, e.g. "dell-latitude-7490-k3f9". */
export function listingSlug(model: string, tail: string): string {
  const base = model
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
    .replace(/-$/, "");
  return `${base || "device"}-${tail}`;
}
