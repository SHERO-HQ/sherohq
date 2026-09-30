import "server-only";
import { asc, count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products, waitlistSignups } from "@/db/schema";

export { isWaitlistStatus, waitlistStepOptions as waitlistSteps, type WaitlistStatus } from "./waitlist-steps";

/** Every product that has, or had, a waitlist, with its signup count. */
export async function waitlistProducts() {
  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      status: products.status,
      launchedAt: products.launchedAt,
      detailLabel: products.detailLabel,
      businessLabel: products.businessLabel,
      signups: count(waitlistSignups.id),
    })
    .from(products)
    .leftJoin(waitlistSignups, eq(waitlistSignups.productId, products.id))
    .groupBy(products.id)
    .orderBy(asc(products.displayOrder), asc(products.name));
  // A launched product with nobody left on its list has nothing to show.
  return rows.filter((p) => p.status === "in_development" || p.signups > 0);
}

export async function waitlistFor(productId: string) {
  return db
    .select()
    .from(waitlistSignups)
    .where(eq(waitlistSignups.productId, productId))
    .orderBy(desc(waitlistSignups.createdAt));
}

export async function newSignups() {
  const [{ n }] = await db.select({ n: count() }).from(waitlistSignups).where(eq(waitlistSignups.status, "new"));
  return n;
}
