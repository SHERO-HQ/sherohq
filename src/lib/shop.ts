import "server-only";
import { cache } from "react";
import { and, asc, desc, eq, gte, inArray, lt, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { deliveryRates, deviceChecks, listings, settings } from "@/db/schema";

// Listings the shop shows. Drafts never appear; sold ones leave automatically.
// Reserved devices stay visible (marked) so a link someone shared still works.
const VISIBLE = ["in_stock", "reserved"] as const;

export type ShopListing = Awaited<ReturnType<typeof getShopListings>>["listings"][number];

export type ShopFilters = {
  categories: string[];
  newBattery: boolean;
  price: "under-3000" | "3000-5000" | "over-5000" | null;
  sort: "newest" | "price" | "battery";
  /** How many to show; "Show more" raises it by a page. */
  show: number;
};

export const SHOP_PAGE_SIZE = 24;

const PRICE_BANDS = {
  "under-3000": { min: 0, max: 300_000 },
  "3000-5000": { min: 300_000, max: 500_001 },
  "over-5000": { min: 500_001, max: Number.MAX_SAFE_INTEGER },
} as const;

export function parseShopFilters(params: Record<string, string | string[] | undefined>): ShopFilters {
  const list = (value: string | string[] | undefined) => (Array.isArray(value) ? value : value ? [value] : []);
  const price = list(params.price)[0];
  const sort = list(params.sort)[0];
  const show = Number.parseInt(list(params.show)[0] ?? "", 10);
  return {
    categories: list(params.category).map((c) => c.toLowerCase()),
    newBattery: list(params.battery)[0] === "new",
    price: price === "under-3000" || price === "3000-5000" || price === "over-5000" ? price : null,
    sort: sort === "price" || sort === "battery" ? sort : "newest",
    show: Number.isFinite(show) ? Math.min(Math.max(show, SHOP_PAGE_SIZE), 240) : SHOP_PAGE_SIZE,
  };
}

const listingColumns = {
  id: listings.id,
  slug: listings.slug,
  model: listings.model,
  category: listings.category,
  specs: listings.specs,
  pricePesewas: listings.pricePesewas,
  note: listings.note,
  grade: listings.grade,
  status: listings.status,
  photos: listings.photos,
  hasBattery: deviceChecks.hasBattery,
  batteryHealth: deviceChecks.batteryHealth,
  batteryReplaced: deviceChecks.batteryReplaced,
  batteryType: deviceChecks.batteryType,
};

export async function getShopListings(filters: ShopFilters) {
  const conditions = [inArray(listings.status, [...VISIBLE])];
  if (filters.categories.length > 0) {
    conditions.push(inArray(sql`lower(${listings.category})`, filters.categories));
  }
  if (filters.newBattery) conditions.push(eq(deviceChecks.batteryHealth, 100));
  if (filters.price) {
    const band = PRICE_BANDS[filters.price];
    conditions.push(gte(listings.pricePesewas, band.min), lt(listings.pricePesewas, band.max));
  }

  const order =
    filters.sort === "price"
      ? [asc(listings.pricePesewas)]
      : filters.sort === "battery"
        ? // Devices without a battery (null health) go after those with one.
          [sql`${deviceChecks.batteryHealth} desc nulls last`, asc(listings.pricePesewas)]
        : [desc(listings.createdAt)];

  const rows = await db
    .select(listingColumns)
    .from(listings)
    .leftJoin(deviceChecks, eq(deviceChecks.listingId, listings.id))
    .where(and(...conditions))
    // Reserved devices go after available ones.
    .orderBy(asc(sql`${listings.status} = 'reserved'`), ...order)
    .limit(filters.show);

  const [{ matching }] = await db
    .select({ matching: sql<number>`count(*)::int` })
    .from(listings)
    .leftJoin(deviceChecks, eq(deviceChecks.listingId, listings.id))
    .where(and(...conditions));

  return { listings: rows, matching };
}

/** One visible listing with its device check; deduplicated per request. */
export const getListing = cache(async (slug: string) => {
  const [row] = await db
    .select({ listing: listings, check: deviceChecks })
    .from(listings)
    .leftJoin(deviceChecks, eq(deviceChecks.listingId, listings.id))
    .where(and(eq(listings.slug, slug), inArray(listings.status, [...VISIBLE])))
    .limit(1);
  return row ?? null;
});

/** Up to three other available devices in the same category, closest in price. */
export async function getSimilarListings(listing: { id: string; category: string; pricePesewas: number }) {
  return db
    .select(listingColumns)
    .from(listings)
    .leftJoin(deviceChecks, eq(deviceChecks.listingId, listings.id))
    .where(and(eq(listings.status, "in_stock"), eq(listings.category, listing.category), ne(listings.id, listing.id)))
    .orderBy(sql`abs(${listings.pricePesewas} - ${listing.pricePesewas})`)
    .limit(3);
}

/** The newest in-stock laptops for the Home page. */
/** Current listing state for the given ids (cart and checkout re-check this). */
export async function getListingsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  return db.select(listingColumns).from(listings).leftJoin(deviceChecks, eq(deviceChecks.listingId, listings.id)).where(inArray(listings.id, ids));
}

export async function getShopSettings() {
  const [row] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
  // The settings row is created on first save in the admin; defaults until then.
  return {
    freeDeliveryThresholdPesewas: row?.freeDeliveryThresholdPesewas ?? 200_000,
    minBatteryHealth: row?.minBatteryHealth ?? 90,
    categories: row?.categories ?? ["Laptops", "Phones", "Desktops", "Audio", "Accessories"],
  };
}

/**
 * Shop settings for copy on otherwise static pages (Home, FAQ, Terms): the
 * defaults when the database isn't there, e.g. a build without DATABASE_URL.
 */
export const shopSettingsForCopy = cache(async () => {
  try {
    return await getShopSettings();
  } catch (error) {
    console.error("Loading shop settings failed", error);
    return { freeDeliveryThresholdPesewas: 200_000, minBatteryHealth: 90, categories: [] as string[] };
  }
});

export async function getDeliveryRates(): Promise<Record<string, number | null>> {
  const rows = await db.select({ region: deliveryRates.region, feePesewas: deliveryRates.feePesewas }).from(deliveryRates);
  return Object.fromEntries(rows.map((row) => [row.region, row.feePesewas]));
}

export { onlinePayments } from "@/lib/payments";
