import "server-only";
import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, referrals } from "@/db/schema";

export async function adminReferrals() {
  return db
    .select({
      referral: referrals,
      orderId: orders.id,
      number: orders.number,
      arrivedAt: orders.arrivedAt,
      orderStatus: orders.status,
    })
    .from(referrals)
    .innerJoin(orders, eq(orders.id, referrals.orderId))
    .orderBy(desc(referrals.createdAt))
    .limit(300);
}

export async function referrersToThank() {
  const [{ n }] = await db.select({ n: count() }).from(referrals).where(eq(referrals.status, "ready_to_thank"));
  return n;
}
