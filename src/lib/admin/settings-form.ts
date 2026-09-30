// The admin's shop settings: parsed and checked here (pure, tested); the save
// actions also check the database (listings below a new battery minimum,
// categories still in use).
import { parseCedis } from "./listing-form";

export type ShopSettingsValues = {
  freeDeliveryThresholdPesewas: number;
  minBatteryHealth: number;
  categories: string[];
};

export type SettingsErrors = Partial<Record<string, string>>;

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

export function parseShopSettings(
  form: FormData,
): { ok: true; values: ShopSettingsValues } | { ok: false; errors: SettingsErrors } {
  const errors: SettingsErrors = {};

  const threshold = parseCedis(text(form, "threshold"));
  if (threshold === null) errors.threshold = "Enter an amount in cedis, e.g. 2,000.";

  const battery = Number(text(form, "minBattery"));
  if (!Number.isInteger(battery) || battery < 50 || battery > 100)
    errors.minBattery = "Enter a whole number from 50 to 100.";

  // One category per line; blank lines and repeats are dropped.
  const categories = [
    ...new Set(
      text(form, "categories")
        .split("\n")
        .map((c) => c.trim().replace(/\s+/g, " "))
        .filter(Boolean),
    ),
  ];
  if (categories.length === 0) errors.categories = "Keep at least one category.";
  else if (categories.some((c) => c.length > 40)) errors.categories = "Keep each category under 40 characters.";
  else if (categories.length > 20) errors.categories = "Up to 20 categories.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, values: { freeDeliveryThresholdPesewas: threshold!, minBatteryHealth: battery, categories } };
}

/** Each region's rate from the form: pesewas, null when left empty (fee agreed per order). */
export function parseDeliveryRates(
  form: FormData,
  regions: readonly string[],
): { ok: true; rates: Record<string, number | null> } | { ok: false; errors: SettingsErrors } {
  const errors: SettingsErrors = {};
  const rates: Record<string, number | null> = {};
  regions.forEach((region, i) => {
    const raw = text(form, `rate-${i}`);
    if (raw === "") rates[region] = null;
    else if (raw === "0") rates[region] = 0;
    else {
      const fee = parseCedis(raw);
      if (fee === null) errors[`rate-${i}`] = "Enter cedis, e.g. 60, or leave it empty.";
      else rates[region] = fee;
    }
  });
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, rates };
}

export type NotificationValues = {
  notifyEmail: string | null;
  notifyOrders: boolean;
  notifyConsultations: boolean;
  notifyWaitlists: boolean;
};

/** Where notifications go (empty: the admin account's email) and which are on. */
export function parseNotifications(
  form: FormData,
): { ok: true; values: NotificationValues } | { ok: false; errors: SettingsErrors } {
  const email = text(form, "notifyEmail").toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, errors: { notifyEmail: "Enter an email address, e.g. info@sherohq.com." } };
  return {
    ok: true,
    values: {
      notifyEmail: email || null,
      notifyOrders: form.get("notifyOrders") === "on",
      notifyConsultations: form.get("notifyConsultations") === "on",
      notifyWaitlists: form.get("notifyWaitlists") === "on",
    },
  };
}
