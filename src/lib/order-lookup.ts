import "server-only";
import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { orderEvents, orderItems, orders } from "@/db/schema";

/**
 * What a customer may see about their own order: no name, address or email,
 * so a lookup never reveals more than the person already knows.
 */
async function load(where: ReturnType<typeof and>) {
  const [order] = await db
    .select({
      id: orders.id,
      number: orders.number,
      status: orders.status,
      deliveryMethod: orders.deliveryMethod,
      town: orders.town,
      pickupStation: orders.pickupStation,
      paymentMethod: orders.paymentMethod,
      paymentStatus: orders.paymentStatus,
      totalPesewas: orders.totalPesewas,
      deliveryFeePending: orders.deliveryFeePending,
      placedAt: orders.placedAt,
    })
    .from(orders)
    .where(and(where, isNull(orders.anonymisedAt)))
    .limit(1);
  if (!order) return null;

  const [items, events] = await Promise.all([
    db.select({ model: orderItems.model, pricePesewas: orderItems.pricePesewas }).from(orderItems).where(eq(orderItems.orderId, order.id)),
    db
      .select({ status: orderEvents.status, at: orderEvents.createdAt })
      .from(orderEvents)
      .where(eq(orderEvents.orderId, order.id))
      .orderBy(asc(orderEvents.createdAt)),
  ]);
  const { id, ...visible } = order;
  void id; // internal; never sent to the browser
  return { ...visible, items, events };
}

export type OrderView = NonNullable<Awaited<ReturnType<typeof load>>>;

/** Track Order: both the number and the phone it was placed with must match. */
export function findOrder(number: string, phone: string) {
  return load(and(eq(orders.number, number), eq(orders.phone, phone)));
}

/** The confirmation page, for the order in this browser's placed-order cookie. */
export function getPlacedOrder(number: string) {
  return load(eq(orders.number, number));
}
