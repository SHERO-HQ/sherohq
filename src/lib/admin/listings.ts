import "server-only";
import { asc, count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { deviceChecks, listings } from "@/db/schema";
import { checkSummary } from "@/lib/listings";
import type { ListingStatus } from "./listing-form";

/** Every listing for the admin table, newest first, with its device check. */
export async function adminListings(status: ListingStatus | null) {
  const rows = await db
    .select({ listing: listings, check: deviceChecks })
    .from(listings)
    .leftJoin(deviceChecks, eq(deviceChecks.listingId, listings.id))
    .where(status ? eq(listings.status, status) : undefined)
    .orderBy(desc(listings.createdAt));
  return rows;
}

export async function listingCounts() {
  const rows = await db.select({ status: listings.status, n: count() }).from(listings).groupBy(listings.status);
  const counts = { all: 0, draft: 0, in_stock: 0, reserved: 0, sold: 0 };
  for (const row of rows) {
    counts[row.status] = row.n;
    counts.all += row.n;
  }
  return counts;
}

/** Drafts whose device check isn't complete: the Listings to-do count. */
export async function listingsNeedingCheck(minBatteryHealth: number) {
  const drafts = await db
    .select({ check: deviceChecks })
    .from(listings)
    .leftJoin(deviceChecks, eq(deviceChecks.listingId, listings.id))
    .where(eq(listings.status, "draft"))
    .orderBy(asc(listings.createdAt));
  return drafts.filter((row) => checkSummary(row.check, minBatteryHealth).tone !== "done").length;
}

export async function adminListing(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [row] = await db
    .select({ listing: listings, check: deviceChecks })
    .from(listings)
    .leftJoin(deviceChecks, eq(deviceChecks.listingId, listings.id))
    .where(eq(listings.id, id))
    .limit(1);
  return row ?? null;
}
