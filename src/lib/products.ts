import "server-only";
import { cache } from "react";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import type { WaitlistConfig } from "@/lib/forms/waitlist";

export type Product = typeof products.$inferSelect;

/**
 * SHERO's own products shown on the site (Home, menu, footer, sitemap), in the
 * admin's order. Without a database (a build with no DATABASE_URL) the site
 * still renders, just without them.
 */
export const getPublishedProducts = cache(async (): Promise<Product[]> => {
  try {
    return await db
      .select()
      .from(products)
      .where(eq(products.published, true))
      .orderBy(asc(products.displayOrder), asc(products.name));
  } catch (error) {
    console.error("Loading products failed", error);
    return [];
  }
});

export const getPublishedProduct = cache(async (slug: string): Promise<Product | null> => {
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) return null;
  const [row] = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.published, true)))
    .limit(1);
  return row ?? null;
});

export function productPath(slug: string) {
  return `/${slug}`;
}

/** The Products entries in the phone menu. */
export function productMenuLinks(products: Product[]) {
  return products.map((p) => ({ label: p.name, href: productPath(p.slug), inDevelopment: p.status === "in_development" }));
}

/** What the waitlist form (a client component) needs to know. */
export function waitlistConfig(product: Product): WaitlistConfig {
  return {
    slug: product.slug,
    name: product.name,
    namePlaceholder: product.namePlaceholder,
    businessLabel: product.businessLabel,
    businessPlaceholder: product.businessPlaceholder,
    detailLabel: product.detailLabel,
    detailPlaceholder: product.detailPlaceholder,
    detailNumeric: product.detailNumeric,
  };
}
