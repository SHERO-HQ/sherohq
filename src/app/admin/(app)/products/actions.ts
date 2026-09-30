"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { products, waitlistSignups } from "@/db/schema";
import { requireAdmin } from "@/lib/admin/auth";
import { deletePhoto, PhotoError, storePhoto } from "@/lib/admin/photo-store";
import { parseProductForm, type ProductErrors } from "@/lib/admin/product-form";

export type SaveProductState = { errors: ProductErrors; message: string | null };

const isId = (id: unknown): id is string => typeof id === "string" && /^[0-9a-f-]{36}$/i.test(id);

/** Products show on every page (menu, footer, Home), so the whole site refreshes. */
function refreshSite() {
  revalidatePath("/", "layout");
}

export async function saveProduct(id: string | null, _state: SaveProductState, form: FormData): Promise<SaveProductState> {
  await requireAdmin();
  let existingSlug: string | null = null;
  if (id !== null) {
    if (!isId(id)) return { errors: {}, message: "This product no longer exists." };
    const [row] = await db.select({ slug: products.slug }).from(products).where(eq(products.id, id));
    if (!row) return { errors: {}, message: "This product no longer exists." };
    existingSlug = row.slug;
  }

  const parsed = parseProductForm(form, existingSlug);
  if (!parsed.ok) return { errors: parsed.errors, message: "Check the highlighted fields." };

  let savedId = id;
  if (id) {
    // The slug is fixed after creation; everything else updates.
    const values: Partial<typeof parsed.values> = { ...parsed.values };
    delete values.slug;
    await db
      .update(products)
      // The first time it goes Live starts the waitlist's 6-month clock.
      .set({ ...values, ...(values.status === "live" ? { launchedAt: sql`coalesce(${products.launchedAt}, now())` } : {}) })
      .where(eq(products.id, id));
  } else {
    const [taken] = await db.select({ id: products.id }).from(products).where(eq(products.slug, parsed.values.slug));
    if (taken) return { errors: { slug: "Another product already uses this address." }, message: "Check the highlighted fields." };
    const [row] = await db
      .insert(products)
      .values({ ...parsed.values, launchedAt: parsed.values.status === "live" ? new Date() : null })
      .returning({ id: products.id });
    savedId = row.id;
  }

  refreshSite();
  redirect(`/admin/products/${savedId}?saved=1`);
}

/** A product with waitlist signups can't be deleted (unpublish it instead). */
export async function deleteProduct(id: string): Promise<{ message: string } | void> {
  await requireAdmin();
  if (!isId(id)) return;
  const [signup] = await db.select({ id: waitlistSignups.id }).from(waitlistSignups).where(eq(waitlistSignups.productId, id)).limit(1);
  if (signup) return { message: "People are on this product's waitlist. Unpublish it instead of deleting it." };
  const [deleted] = await db.delete(products).where(eq(products.id, id)).returning({ previewUrl: products.previewUrl });
  if (deleted?.previewUrl) await deletePhoto(deleted.previewUrl);
  refreshSite();
  redirect("/admin/products");
}

export type PreviewResult = { ok: true } | { ok: false; message: string };

/** The dashboard preview image; replaces any earlier one. */
export async function setPreview(id: string, form: FormData): Promise<PreviewResult> {
  await requireAdmin();
  if (!isId(id)) return { ok: false, message: "This product no longer exists." };
  const [product] = await db.select({ slug: products.slug, previewUrl: products.previewUrl }).from(products).where(eq(products.id, id));
  if (!product) return { ok: false, message: "This product no longer exists." };
  const file = form.get("photo");
  if (!(file instanceof File)) return { ok: false, message: "Choose an image." };
  let url: string;
  try {
    url = await storePhoto(file, `${product.slug}-preview`);
  } catch (error) {
    return { ok: false, message: error instanceof PhotoError ? error.message : "The image couldn't be saved." };
  }
  await db.update(products).set({ previewUrl: url }).where(eq(products.id, id));
  if (product.previewUrl) await deletePhoto(product.previewUrl);
  refreshSite();
  return { ok: true };
}

export async function removePreview(id: string): Promise<PreviewResult> {
  await requireAdmin();
  if (!isId(id)) return { ok: false, message: "This product no longer exists." };
  const [product] = await db.select({ previewUrl: products.previewUrl }).from(products).where(eq(products.id, id));
  if (product?.previewUrl) {
    await db.update(products).set({ previewUrl: null }).where(eq(products.id, id));
    await deletePhoto(product.previewUrl);
  }
  refreshSite();
  return { ok: true };
}
