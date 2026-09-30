"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray, lt, notInArray } from "drizzle-orm";
import { db } from "@/db";
import { deliveryRates, deviceChecks, listings, settings } from "@/db/schema";
import { requireAdmin } from "@/lib/admin/auth";
import { parseDeliveryRates, parseNotifications, parseShopSettings, type SettingsErrors } from "@/lib/admin/settings-form";
import { notificationSettings, sendEmail } from "@/lib/notify";
import { deliveryRateRegions } from "@/lib/ghana";

export type SettingsState = { errors: SettingsErrors; message: string | null; saved: boolean };

/** Shop rules show on the shop, laptop pages, Home, FAQ and Terms: refresh the whole site. */
function refreshSite() {
  revalidatePath("/", "layout");
}

export async function saveShopSettings(_state: SettingsState, form: FormData): Promise<SettingsState> {
  await requireAdmin();
  const parsed = parseShopSettings(form);
  if (!parsed.ok) return { errors: parsed.errors, message: "Check the highlighted fields.", saved: false };
  const values = parsed.values;

  // The shop says every device is at the minimum or more; keep that true.
  const below = await db
    .select({ model: listings.model, battery: deviceChecks.batteryHealth })
    .from(listings)
    .innerJoin(deviceChecks, eq(deviceChecks.listingId, listings.id))
    .where(
      and(
        inArray(listings.status, ["in_stock", "reserved"]),
        eq(deviceChecks.hasBattery, true),
        lt(deviceChecks.batteryHealth, values.minBatteryHealth),
      ),
    );
  if (below.length > 0) {
    return {
      errors: { minBattery: `${below.length} in the shop ${below.length === 1 ? "is" : "are"} below ${values.minBatteryHealth}%.` },
      message: `These devices in the shop are below ${values.minBatteryHealth}%: ${below
        .map((b) => `${b.model} (${b.battery}%)`)
        .join(", ")}. Set them to Draft first, or keep a lower minimum.`,
      saved: false,
    };
  }

  // A category still used by a listing can't be removed.
  const inUse = await db
    .selectDistinct({ category: listings.category })
    .from(listings)
    .where(notInArray(listings.category, values.categories));
  if (inUse.length > 0) {
    const names = inUse.map((c) => c.category).join(", ");
    return {
      errors: { categories: `Still used by listings: ${names}.` },
      message: `Listings still use ${names}. Move them to another category first.`,
      saved: false,
    };
  }

  await db
    .insert(settings)
    .values({ id: 1, ...values })
    .onConflictDoUpdate({ target: settings.id, set: values });
  refreshSite();
  return { errors: {}, message: null, saved: true };
}

export async function saveDeliveryRates(_state: SettingsState, form: FormData): Promise<SettingsState> {
  await requireAdmin();
  const parsed = parseDeliveryRates(form, deliveryRateRegions);
  if (!parsed.ok) return { errors: parsed.errors, message: "Check the highlighted rates.", saved: false };
  await db.transaction(async (tx) => {
    for (const [region, feePesewas] of Object.entries(parsed.rates)) {
      await tx
        .insert(deliveryRates)
        .values({ region, feePesewas })
        .onConflictDoUpdate({ target: deliveryRates.region, set: { feePesewas } });
    }
  });
  refreshSite();
  return { errors: {}, message: null, saved: true };
}

export async function saveNotifications(_state: SettingsState, form: FormData): Promise<SettingsState> {
  await requireAdmin();
  const parsed = parseNotifications(form);
  if (!parsed.ok) return { errors: parsed.errors, message: "Check the email address.", saved: false };
  await db
    .insert(settings)
    .values({ id: 1, ...parsed.values })
    .onConflictDoUpdate({ target: settings.id, set: parsed.values });
  revalidatePath("/admin/settings");
  return { errors: {}, message: null, saved: true };
}

/** Sends a sample to the saved address, to check emails arrive (and aren't in spam). */
export async function sendTestEmail(): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  const { to } = await notificationSettings();
  if (!to) return { ok: false, message: "Add an email address first." };
  const result = await sendEmail(to, {
    subject: "Test from the SHERO admin",
    text: "Notifications from sherohq.com reach this inbox. New orders, consultation requests and waitlist signups arrive like this.",
  });
  return result.ok ? { ok: true, message: `Sent to ${to}. If it isn't in the inbox, check spam.` } : result;
}
