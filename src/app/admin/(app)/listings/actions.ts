"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { deviceChecks, listings } from "@/db/schema";
import { requireAdmin } from "@/lib/admin/auth";
import { deletePhoto, MAX_PHOTOS, PhotoError, storePhoto } from "@/lib/admin/photo-store";
import { listingSlug, parseListingForm, type ListingErrors } from "@/lib/admin/listing-form";
import { inStockBlockers } from "@/lib/listings";
import { getShopSettings } from "@/lib/shop";
import { routes } from "@/lib/site";

const isId = (id: unknown): id is string => typeof id === "string" && /^[0-9a-f-]{36}$/i.test(id);

export type SaveListingState = { errors: ListingErrors; message: string | null; blockers: string[] };

function refreshShop(slug: string) {
  revalidatePath("/");
  revalidatePath(routes.shop);
  revalidatePath(`${routes.shop}/${slug}`);
}

/** Creates (no id) or updates a listing and its device check together. */
export async function saveListing(id: string | null, _state: SaveListingState, form: FormData): Promise<SaveListingState> {
  await requireAdmin();
  if (id !== null && !isId(id)) return { errors: {}, message: "This listing no longer exists.", blockers: [] };
  const settings = await getShopSettings();
  const parsed = parseListingForm(form, settings.categories);
  if (!parsed.ok) return { errors: parsed.errors, message: "Check the highlighted fields.", blockers: [] };
  const { check, status, ...details } = parsed.values;

  // The honesty rule: nothing shows in the shop until its check is complete
  // and passing (Reserved devices still show, marked, so the rule covers them).
  if (status === "in_stock" || status === "reserved") {
    const blockers = inStockBlockers(
      { ...check, listingId: "", checkedAt: null, updatedAt: new Date() },
      settings.minBatteryHealth,
    );
    if (blockers.length > 0) {
      return {
        errors: { status: "Can't go in stock yet." },
        message: "Can't go in stock yet. Finish the device check first:",
        blockers,
      };
    }
  }

  const soldAt = status === "sold" ? new Date() : null;
  const checkValues = { ...check, checkedAt: new Date() };

  let savedId = id;
  let slug: string;
  if (id) {
    const [existing] = await db.select({ slug: listings.slug, soldAt: listings.soldAt }).from(listings).where(eq(listings.id, id));
    if (!existing) return { errors: {}, message: "This listing no longer exists.", blockers: [] };
    slug = existing.slug; // Kept as is, so links people shared keep working.
    await db.transaction(async (tx) => {
      await tx
        .update(listings)
        .set({ ...details, status, soldAt: status === "sold" ? (existing.soldAt ?? soldAt) : null })
        .where(eq(listings.id, id));
      await tx
        .insert(deviceChecks)
        .values({ listingId: id, ...checkValues })
        .onConflictDoUpdate({ target: deviceChecks.listingId, set: checkValues });
    });
  } else {
    slug = listingSlug(details.model, randomBytes(2).toString("hex"));
    savedId = await db.transaction(async (tx) => {
      const [row] = await tx.insert(listings).values({ ...details, slug, status, soldAt }).returning({ id: listings.id });
      await tx.insert(deviceChecks).values({ listingId: row.id, ...checkValues });
      return row.id;
    });
  }

  refreshShop(slug);
  redirect(`/admin/listings/${savedId}?saved=1`);
}

/** Only drafts can be deleted; anything that was in the shop is marked Sold instead. */
export async function deleteDraft(id: string) {
  await requireAdmin();
  if (!isId(id)) return;
  await db.delete(listings).where(and(eq(listings.id, id), eq(listings.status, "draft")));
  redirect("/admin/listings");
}

// ── Photos ──────────────────────────────────────────────────────────────────

export type PhotoResult = { ok: true } | { ok: false; message: string };

async function photoTarget(id: string) {
  if (!isId(id)) return null;
  const [row] = await db.select({ slug: listings.slug, photos: listings.photos }).from(listings).where(eq(listings.id, id));
  return row ?? null;
}

function refreshPhotos(id: string, slug: string) {
  revalidatePath(`/admin/listings/${id}`);
  revalidatePath("/admin/listings");
  refreshShop(slug);
}

/** Adds one photo (the browser sends them one at a time, already shrunk). */
export async function addPhoto(id: string, form: FormData): Promise<PhotoResult> {
  await requireAdmin();
  const listing = await photoTarget(id);
  if (!listing) return { ok: false, message: "This listing no longer exists." };
  if (listing.photos.length >= MAX_PHOTOS) return { ok: false, message: `Up to ${MAX_PHOTOS} photos per listing.` };
  const file = form.get("photo");
  if (!(file instanceof File)) return { ok: false, message: "Choose a photo." };

  let url: string;
  try {
    url = await storePhoto(file, listing.slug);
  } catch (error) {
    return { ok: false, message: error instanceof PhotoError ? error.message : "The photo couldn't be saved." };
  }
  // Appended in the database, so photos added at the same time aren't lost.
  const [updated] = await db
    .update(listings)
    .set({ photos: sql`${listings.photos} || jsonb_build_array(${url}::text)` })
    .where(and(eq(listings.id, id), sql`jsonb_array_length(${listings.photos}) < ${MAX_PHOTOS}`))
    .returning({ id: listings.id });
  if (!updated) {
    await deletePhoto(url);
    return { ok: false, message: `Up to ${MAX_PHOTOS} photos per listing.` };
  }
  refreshPhotos(id, listing.slug);
  return { ok: true };
}

export async function removePhoto(id: string, url: string): Promise<PhotoResult> {
  await requireAdmin();
  const listing = await photoTarget(id);
  if (!listing || !listing.photos.includes(url)) return { ok: false, message: "That photo is already gone." };
  await db
    .update(listings)
    .set({ photos: listing.photos.filter((p) => p !== url) })
    .where(eq(listings.id, id));
  await deletePhoto(url);
  refreshPhotos(id, listing.slug);
  return { ok: true };
}

/** Moves a photo one place earlier or later; the first photo is the cover. */
export async function movePhoto(id: string, url: string, by: -1 | 1): Promise<PhotoResult> {
  await requireAdmin();
  const listing = await photoTarget(id);
  const from = listing?.photos.indexOf(url) ?? -1;
  const to = from + by;
  if (!listing || from === -1 || to < 0 || to >= listing.photos.length) return { ok: true };
  const photos = [...listing.photos];
  [photos[from], photos[to]] = [photos[to], photos[from]];
  await db.update(listings).set({ photos }).where(eq(listings.id, id));
  refreshPhotos(id, listing.slug);
  return { ok: true };
}
