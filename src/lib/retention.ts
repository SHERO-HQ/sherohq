import "server-only";
import { and, desc, eq, inArray, isNotNull, isNull, lt, lte, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { adminSessions, consultations, loginEvents, orders, products, referrals, retentionRuns, waitlistSignups } from "@/db/schema";
import { cutoffs } from "@/lib/retention-rules";

/**
 * Deletes or anonymises what the Privacy page says we don't keep, and records
 * what it did. Runs daily (the vercel.json cron calls /api/cron/retention); safe to
 * run twice.
 */
export async function runRetention(now = new Date()) {
  const c = cutoffs(now);

  const removed = await db.transaction(async (tx) => {
    // Referrer numbers: 30 days after the order arrived, unless they agreed to stay.
    const expiredReferrals = await tx
      .select({ id: referrals.id })
      .from(referrals)
      .innerJoin(orders, eq(orders.id, referrals.orderId))
      .where(
        and(
          inArray(referrals.status, ["ready_to_thank", "thanked", "asked_to_stay"]),
          isNotNull(referrals.referrerPhone),
          lte(orders.arrivedAt, c.referralArrival),
        ),
      );
    if (expiredReferrals.length > 0) {
      await tx
        .update(referrals)
        .set({ referrerPhone: null, status: "deleted", resolvedAt: now })
        .where(inArray(referrals.id, expiredReferrals.map((r) => r.id)));
    }

    // Consultations: 12 months after the last contact, if no work followed.
    const oldRequests = await tx
      .delete(consultations)
      .where(
        and(
          ne(consultations.status, "won"),
          // A raw expression gets no column type, so the date goes as text.
          sql`coalesce(${consultations.lastContactAt}, ${consultations.createdAt}) < ${c.consultations.toISOString()}`,
        ),
      )
      .returning({ id: consultations.id });

    // Waitlists: 6 months after the product launched.
    const launched = await tx
      .select({ id: products.id })
      .from(products)
      .where(and(isNotNull(products.launchedAt), lte(products.launchedAt, c.waitlistLaunch)));
    const oldSignups = launched.length
      ? await tx
          .delete(waitlistSignups)
          .where(inArray(waitlistSignups.productId, launched.map((p) => p.id)))
          .returning({ id: waitlistSignups.id })
      : [];

    // Orders: after the tax-record period, remove who bought; keep what was sold and for how much.
    const oldOrders = await tx
      .update(orders)
      .set({ customerName: null, phone: null, email: null, address: null, pickupStation: null, town: null, anonymisedAt: now })
      .where(and(isNull(orders.anonymisedAt), lt(orders.placedAt, c.orders)))
      .returning({ id: orders.id });

    const oldLogins = await tx.delete(loginEvents).where(lt(loginEvents.createdAt, c.loginEvents)).returning({ id: loginEvents.id });
    await tx.delete(adminSessions).where(lt(adminSessions.expiresAt, now));

    return {
      referrerNumbers: expiredReferrals.length,
      consultations: oldRequests.length,
      waitlistSignups: oldSignups.length,
      ordersAnonymised: oldOrders.length,
      loginEvents: oldLogins.length,
    };
  });

  await db.insert(retentionRuns).values({ ranAt: now, removed });
  return removed;
}

export async function lastRetentionRun() {
  const [row] = await db.select().from(retentionRuns).orderBy(desc(retentionRuns.ranAt)).limit(1);
  return row ?? null;
}
