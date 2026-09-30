import "server-only";
import { asc, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { orderEvents, orderItems, orders, referrals } from "@/db/schema";
import { normaliseOrderNumber, type OrderStatus } from "@/lib/orders";
import { normalisePhone } from "@/lib/phone";

export const orderTabs = [
  { value: null, label: "All" },
  { value: "placed", label: "To confirm" },
  { value: "confirmed", label: "Packed" },
  { value: "in_transit", label: "On the way" },
  { value: "arrived", label: "Delivered or ready" },
  { value: "cancelled", label: "Cancelled" },
] as const satisfies ReadonlyArray<{ value: OrderStatus | null; label: string }>;

/**
 * Orders for the admin table, newest first. `q` finds an order by its
 * number, the customer's phone (any format) or part of their name.
 */
export async function adminOrders(status: OrderStatus | null, q: string) {
  const search = q.trim();
  const number = normaliseOrderNumber(search);
  const phone = normalisePhone(search);
  const where = search
    ? or(
        number ? eq(orders.number, number) : undefined,
        phone ? eq(orders.phone, phone) : undefined,
        search.length >= 2 ? ilike(orders.customerName, `%${search.replace(/[%_\\]/g, "")}%`) : undefined,
      )
    : status
      ? eq(orders.status, status)
      : undefined;

  const rows = await db.select().from(orders).where(where).orderBy(desc(orders.placedAt)).limit(200);
  if (rows.length === 0) return [];
  const items = await db
    .select({ orderId: orderItems.orderId, model: orderItems.model })
    .from(orderItems)
    .where(inArray(orderItems.orderId, rows.map((r) => r.id)))
    .orderBy(asc(orderItems.model));
  return rows.map((order) => ({ order, models: items.filter((i) => i.orderId === order.id).map((i) => i.model) }));
}

export async function orderCounts() {
  const rows = await db.select({ status: orders.status, n: count() }).from(orders).groupBy(orders.status);
  const counts: Record<string, number> = { all: 0 };
  for (const row of rows) {
    counts[row.status] = row.n;
    counts.all += row.n;
  }
  return counts;
}

/** Orders waiting on the admin: to confirm, or packed and not yet sent. */
export async function ordersNeedingAction() {
  const [{ n }] = await db
    .select({ n: count() })
    .from(orders)
    .where(inArray(orders.status, ["placed", "confirmed"]));
  return n;
}

export async function adminOrder(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) return null;
  const [items, events, [referral]] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, id)),
    db.select().from(orderEvents).where(eq(orderEvents.orderId, id)).orderBy(asc(orderEvents.createdAt)),
    db.select().from(referrals).where(eq(referrals.orderId, id)).limit(1),
  ]);
  return { order, items, events, referral: referral ?? null };
}
