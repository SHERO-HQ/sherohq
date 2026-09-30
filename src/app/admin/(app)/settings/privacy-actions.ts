"use server";

import { revalidatePath } from "next/cache";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { consultations, orders, referrals, testimonials, waitlistSignups } from "@/db/schema";
import { requireAdmin } from "@/lib/admin/auth";
import { exportRecords, recordsForPhone } from "@/lib/admin/data-requests";
import { normalisePhone } from "@/lib/phone";
import { runRetention } from "@/lib/retention";

export type Found = {
  phone: string;
  lines: string[];
  total: number;
  /** Orders still on their way can't be anonymised yet. */
  openOrders: string[];
};

type Result<T> = ({ ok: true } & T) | { ok: false; message: string };

function readPhone(form: FormData): string | null {
  return normalisePhone(String(form.get("phone") ?? ""));
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export async function findRecords(form: FormData): Promise<Result<{ found: Found }>> {
  await requireAdmin();
  const phone = readPhone(form);
  if (!phone) return { ok: false, message: "Enter a phone number, e.g. 024 412 3456 or +44 7400 123456." };
  const r = await recordsForPhone(phone);
  const lines = [
    r.orders.length && `${plural(r.orders.length, "order", "orders")}: ${r.orders.map((o) => o.number).join(", ")}`,
    r.consultations.length && plural(r.consultations.length, "consultation request", "consultation requests"),
    r.signups.length && `Waitlist: ${r.signups.map((s) => s.product).join(", ")}`,
    r.referrals.length && `Named as referrer on ${r.referrals.map((x) => x.number).join(", ")}`,
    r.testimonials.length && plural(r.testimonials.length, "testimonial", "testimonials"),
  ].filter(Boolean) as string[];
  const openOrders = r.orders.filter((o) => ["placed", "confirmed", "in_transit"].includes(o.status)).map((o) => o.number);
  const total = r.orders.length + r.consultations.length + r.signups.length + r.referrals.length + r.testimonials.length;
  return { ok: true, found: { phone, lines, total, openOrders } };
}

export async function exportPhoneRecords(form: FormData): Promise<Result<{ json: string }>> {
  await requireAdmin();
  const phone = readPhone(form);
  if (!phone) return { ok: false, message: "Enter a phone number." };
  return { ok: true, json: JSON.stringify(exportRecords(phone, await recordsForPhone(phone)), null, 2) };
}

/**
 * Removes a person's details on request. Requests, waitlist places and
 * testimonials are deleted; a referrer's number is erased; orders are kept for
 * tax records with the name, phone, email and address removed.
 */
export async function erasePhoneRecords(form: FormData): Promise<Result<{ message: string }>> {
  await requireAdmin();
  const phone = readPhone(form);
  if (!phone) return { ok: false, message: "Enter a phone number." };
  const r = await recordsForPhone(phone);
  const open = r.orders.filter((o) => ["placed", "confirmed", "in_transit"].includes(o.status));
  if (open.length > 0) {
    return { ok: false, message: `${open.map((o) => o.number).join(", ")} is still open. Deliver or cancel it first.` };
  }
  const orderIds = r.orders.map((o) => o.id);
  const now = new Date();
  await db.transaction(async (tx) => {
    await tx.delete(consultations).where(eq(consultations.phone, phone));
    await tx.delete(waitlistSignups).where(eq(waitlistSignups.phone, phone));
    await tx.update(referrals).set({ referrerPhone: null, status: "deleted", resolvedAt: now }).where(eq(referrals.referrerPhone, phone));
    if (orderIds.length) {
      await tx.delete(testimonials).where(inArray(testimonials.orderId, orderIds));
      // Referrer numbers given with their orders go too.
      await tx.update(referrals).set({ referrerPhone: null, status: "deleted", resolvedAt: now }).where(inArray(referrals.orderId, orderIds));
      await tx
        .update(orders)
        .set({ customerName: null, phone: null, email: null, address: null, pickupStation: null, town: null, anonymisedAt: now })
        .where(inArray(orders.id, orderIds));
    }
  });
  revalidatePath("/", "layout");
  return { ok: true, message: "Done. Their details are removed; orders keep only what was sold and for how much." };
}

export async function runRetentionNow(): Promise<Result<{ message: string }>> {
  await requireAdmin();
  const removed = await runRetention();
  revalidatePath("/admin", "layout");
  const total = Object.values(removed).reduce((a, b) => a + b, 0);
  return { ok: true, message: total === 0 ? "Nothing was due." : `Removed or anonymised ${total} records.` };
}
