"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { listings, orderEvents, orderItems, orders, referrals } from "@/db/schema";
import { requireAdmin } from "@/lib/admin/auth";
import { parseCedis } from "@/lib/admin/listing-form";
import { blockedByFee, nextStatus } from "@/lib/order-flow";
import { warrantyEndsOn } from "@/lib/orders";
import { routes } from "@/lib/site";

type Result = { ok: true } | { ok: false; message: string };

const isId = (id: unknown): id is string => typeof id === "string" && /^[0-9a-f-]{36}$/i.test(id);

function refresh(id: string) {
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  revalidatePath("/");
  revalidatePath(routes.shop);
}

/** Moves the order one step on: confirmed, on the way, then delivered or ready. */
export async function advanceOrder(id: string, expected: string): Promise<Result> {
  await requireAdmin();
  if (!isId(id)) return { ok: false, message: "This order no longer exists." };
  return db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, id)).for("update");
    if (!order) return { ok: false, message: "This order no longer exists." };
    // Two tabs, or a double tap: only move from the status the admin was looking at.
    if (order.status !== expected) return { ok: false, message: "This order changed in the meantime. The page now shows its current status." };
    const next = nextStatus(order);
    if (!next) return { ok: false, message: "This order has no next step." };
    if (blockedByFee(order)) return { ok: false, message: "Agree and enter the delivery fee before it leaves." };

    const now = new Date();
    const stamp =
      next === "confirmed" ? { confirmedAt: now } : next === "in_transit" ? { inTransitAt: now } : { arrivedAt: now, warrantyEndsOn: warrantyEndsOn(now) };
    await tx.update(orders).set({ status: next, ...stamp }).where(eq(orders.id, id));
    await tx.insert(orderEvents).values({ orderId: id, status: next });

    if (next === "arrived") {
      // Delivered or collected: the devices are sold and leave the shop.
      const items = await tx.select({ listingId: orderItems.listingId }).from(orderItems).where(and(eq(orderItems.orderId, id), isNotNull(orderItems.listingId)));
      const ids = items.map((i) => i.listingId!);
      if (ids.length > 0) await tx.update(listings).set({ status: "sold", soldAt: now }).where(inArray(listings.id, ids));
      // The referrer can now be thanked (admin scope, Referrals).
      await tx
        .update(referrals)
        .set({ status: "ready_to_thank" })
        .where(and(eq(referrals.orderId, id), eq(referrals.status, "waiting_for_delivery")));
    }
    return { ok: true } as const;
  }).then((result) => {
    if (result.ok) refresh(id);
    return result;
  });
}

/** Cancels an order that hasn't arrived: its devices go back in stock, and a referrer's number is erased. */
export async function cancelOrder(id: string): Promise<Result> {
  await requireAdmin();
  if (!isId(id)) return { ok: false, message: "This order no longer exists." };
  const result = await db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, id)).for("update");
    if (!order) return { ok: false, message: "This order no longer exists." } as const;
    if (order.status === "arrived") return { ok: false, message: "A delivered order can't be cancelled." } as const;
    if (order.status === "cancelled") return { ok: true } as const;
    await tx.update(orders).set({ status: "cancelled", cancelledAt: new Date() }).where(eq(orders.id, id));
    await tx.insert(orderEvents).values({ orderId: id, status: "cancelled" });
    const items = await tx.select({ listingId: orderItems.listingId }).from(orderItems).where(and(eq(orderItems.orderId, id), isNotNull(orderItems.listingId)));
    const ids = items.map((i) => i.listingId!);
    // Only devices still held for this order go back; one sold another way stays sold.
    if (ids.length > 0) await tx.update(listings).set({ status: "in_stock" }).where(and(inArray(listings.id, ids), eq(listings.status, "reserved")));
    // Privacy: no delivery, so no thank-you; the number goes now, only the count stays.
    await tx
      .update(referrals)
      .set({ status: "deleted", referrerPhone: null, resolvedAt: new Date() })
      .where(eq(referrals.orderId, id));
    return { ok: true } as const;
  });
  if (result.ok) refresh(id);
  return result;
}

/** Sets the delivery fee agreed on WhatsApp for a region without a rate. */
export async function setDeliveryFee(id: string, form: FormData): Promise<Result> {
  await requireAdmin();
  if (!isId(id)) return { ok: false, message: "This order no longer exists." };
  const raw = String(form.get("fee") ?? "").trim();
  const fee = raw === "0" ? 0 : parseCedis(raw);
  if (fee === null) return { ok: false, message: "Enter the fee in cedis, e.g. 60." };
  const [order] = await db.select({ subtotal: orders.subtotalPesewas, status: orders.status }).from(orders).where(eq(orders.id, id));
  if (!order) return { ok: false, message: "This order no longer exists." };
  if (order.status === "cancelled") return { ok: false, message: "This order is cancelled." };
  await db
    .update(orders)
    .set({ deliveryFeePesewas: fee, totalPesewas: order.subtotal + fee, deliveryFeePending: false })
    .where(eq(orders.id, id));
  refresh(id);
  return { ok: true };
}

/** Cash on delivery or at pickup: records the money as collected. */
export async function markPaid(id: string): Promise<Result> {
  await requireAdmin();
  if (!isId(id)) return { ok: false, message: "This order no longer exists." };
  await db.update(orders).set({ paymentStatus: "paid" }).where(eq(orders.id, id));
  refresh(id);
  return { ok: true };
}
