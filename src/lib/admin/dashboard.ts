import "server-only";
import { and, asc, count, eq, gte, inArray, isNull, ne, sum } from "drizzle-orm";
import { db } from "@/db";
import { consultations, deviceChecks, listings, orders, products, referrals, testimonials, waitlistSignups } from "@/db/schema";
import { needLabel, contactLabel } from "@/lib/admin/consultation-flow";
import { formatGhanaDate, formatGhanaDateTime } from "@/lib/dates";
import { paymentLabel } from "@/lib/forms/checkout";
import { checkSummary } from "@/lib/listings";
import { advanceLabel, maskPhone, nextStatus } from "@/lib/order-flow";
import { formatCedis } from "@/lib/orders";

// The admin's home: what needs doing, oldest first in each group, then this
// month's numbers (docs/admin-scope.md, section 1).

export type TodoItem = { href: string; title: string; detail: string; action: string };
export type TodoGroup = { title: string; href: string; items: TodoItem[]; more: number };

const LIMIT = 4;

function group(title: string, href: string, all: TodoItem[]): TodoGroup {
  return { title, href, items: all.slice(0, LIMIT), more: Math.max(0, all.length - LIMIT) };
}

export async function dashboardTodos(minBatteryHealth: number): Promise<TodoGroup[]> {
  const [openOrders, drafts, fresh, signups, toThank, noConsent] = await Promise.all([
    db
      .select()
      .from(orders)
      .where(inArray(orders.status, ["placed", "confirmed"]))
      .orderBy(asc(orders.placedAt)),
    db
      .select({ listing: listings, check: deviceChecks })
      .from(listings)
      .leftJoin(deviceChecks, eq(deviceChecks.listingId, listings.id))
      .where(eq(listings.status, "draft"))
      .orderBy(asc(listings.createdAt)),
    db.select().from(consultations).where(eq(consultations.status, "new")).orderBy(asc(consultations.createdAt)),
    db
      .select({ product: products.name, slug: products.slug, n: count() })
      .from(waitlistSignups)
      .innerJoin(products, eq(products.id, waitlistSignups.productId))
      .where(eq(waitlistSignups.status, "new"))
      .groupBy(products.name, products.slug),
    db
      .select({ referral: referrals, number: orders.number, arrivedAt: orders.arrivedAt })
      .from(referrals)
      .innerJoin(orders, eq(orders.id, referrals.orderId))
      .where(eq(referrals.status, "ready_to_thank"))
      .orderBy(asc(orders.arrivedAt)),
    db.select().from(testimonials).where(isNull(testimonials.consentGivenAt)).orderBy(asc(testimonials.createdAt)),
  ]);

  const orderItems: TodoItem[] = openOrders.map((o) => {
    const next = nextStatus(o);
    return {
      href: `/admin/orders/${o.id}`,
      title: `${o.number} · ${o.customerName ?? "–"}`,
      detail:
        o.status === "placed"
          ? `placed ${formatGhanaDateTime(o.placedAt)} · ${paymentLabel(o.paymentMethod)} · ${formatCedis(o.totalPesewas)}`
          : `packed · ${o.deliveryMethod === "bus" ? `bus to ${o.town ?? o.region ?? "–"}` : o.deliveryMethod === "tamale" ? "Tamale delivery" : "store pickup"}${o.deliveryFeePending ? " · fee to agree" : ""}`,
      action: o.deliveryFeePending && o.status === "confirmed" ? "Agree fee" : next ? advanceLabel(next, o.deliveryMethod).replace(/^Mark as /, "Mark ") : "Open",
    };
  });

  const listingItems: TodoItem[] = drafts
    .map(({ listing, check }) => {
      const summary = checkSummary(check, minBatteryHealth);
      const noPhotos = listing.photos.length === 0;
      if (summary.tone === "done" && !noPhotos) return null;
      return {
        href: `/admin/listings/${listing.id}`,
        title: listing.model,
        detail: summary.tone !== "done" ? `device check: ${summary.label}` : "no photos yet",
        action: summary.tone !== "done" ? "Finish check" : "Add photos",
      };
    })
    .filter((item): item is TodoItem => item !== null);

  const consultationItems: TodoItem[] = fresh.map((c) => ({
    href: `/admin/consultations?id=${c.id}`,
    title: `${c.name} · ${needLabel(c.need).toLowerCase()}`,
    detail: c.message ? `“${c.message.length > 70 ? `${c.message.slice(0, 70).trim()}…` : c.message}”` : `prefers ${contactLabel(c.contactMethod)}`,
    action: "Reply",
  }));

  const waitlistItems: TodoItem[] = signups.map((s) => ({
    href: `/admin/waitlists?product=${s.slug}`,
    title: `${s.product} waitlist`,
    detail: `${s.n} new ${s.n === 1 ? "signup" : "signups"}`,
    action: "Open",
  }));

  const peopleItems: TodoItem[] = [
    ...toThank.map((r) => ({
      href: "/admin/referrals",
      title: `Referrer ${r.referral.referrerPhone ? maskPhone(r.referral.referrerPhone) : ""}`.trim(),
      detail: `${r.number} delivered ${r.arrivedAt ? formatGhanaDate(r.arrivedAt) : ""}`.trim(),
      action: "Thank",
    })),
    ...noConsent.map((t) => ({
      href: `/admin/testimonials/${t.id}`,
      title: `Testimonial from ${t.attribution}`,
      detail: "waiting for consent to publish",
      action: "Ask",
    })),
  ];

  return [
    group("Orders", "/admin/orders", orderItems),
    group("Listings", "/admin/listings?status=draft", listingItems),
    group("Consultations", "/admin/consultations", consultationItems),
    group("Waitlists", "/admin/waitlists", waitlistItems),
    group("Referrals and testimonials", "/admin/referrals", peopleItems),
  ].filter((g) => g.items.length > 0);
}

/** This calendar month, in Ghana time (GMT). Revenue counts delivered or collected orders. */
export async function monthNumbers(now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const [[placed], [delivered], [requests], [joined]] = await Promise.all([
    db.select({ n: count() }).from(orders).where(and(gte(orders.placedAt, start), ne(orders.status, "cancelled"))),
    db.select({ total: sum(orders.totalPesewas) }).from(orders).where(and(gte(orders.arrivedAt, start), eq(orders.status, "arrived"))),
    db.select({ n: count() }).from(consultations).where(gte(consultations.createdAt, start)),
    db.select({ n: count() }).from(waitlistSignups).where(gte(waitlistSignups.createdAt, start)),
  ]);
  return {
    orders: placed.n,
    revenuePesewas: Number(delivered.total ?? 0),
    consultations: requests.n,
    signups: joined.n,
  };
}
