import "server-only";
import { asc, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { products, waitlistSignups } from "@/db/schema";

/** Every product for the admin, in display order, with its waitlist size. */
export async function adminProducts() {
  const [rows, signups] = await Promise.all([
    db.select().from(products).orderBy(asc(products.displayOrder), asc(products.name)),
    db.select({ productId: waitlistSignups.productId, n: count() }).from(waitlistSignups).groupBy(waitlistSignups.productId),
  ]);
  const byProduct = new Map(signups.map((s) => [s.productId, s.n]));
  return rows.map((product) => ({ product, signups: byProduct.get(product.id) ?? 0 }));
}

export async function adminProduct(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!product) return null;
  const [{ n }] = await db.select({ n: count() }).from(waitlistSignups).where(eq(waitlistSignups.productId, id));
  return { product, signups: n };
}
