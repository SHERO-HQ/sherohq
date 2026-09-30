import "server-only";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { consultations, orderItems, orders, products, referrals, testimonials, waitlistSignups } from "@/db/schema";

/**
 * Everything held against one phone number, for "Your rights" requests on the
 * Privacy page: see it, export it, or have it removed.
 */
export async function recordsForPhone(phone: string) {
  const [orderRows, consultationRows, signupRows, referralRows] = await Promise.all([
    db.select().from(orders).where(eq(orders.phone, phone)),
    db.select().from(consultations).where(eq(consultations.phone, phone)),
    db
      .select({ signup: waitlistSignups, product: products.name })
      .from(waitlistSignups)
      .innerJoin(products, eq(products.id, waitlistSignups.productId))
      .where(eq(waitlistSignups.phone, phone)),
    db
      .select({ referral: referrals, number: orders.number })
      .from(referrals)
      .innerJoin(orders, eq(orders.id, referrals.orderId))
      .where(eq(referrals.referrerPhone, phone)),
  ]);
  const orderIds = orderRows.map((o) => o.id);
  const [items, quotes] = orderIds.length
    ? await Promise.all([
        db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds)),
        db.select().from(testimonials).where(inArray(testimonials.orderId, orderIds)),
      ])
    : [[], []];
  return { orders: orderRows, items, consultations: consultationRows, signups: signupRows, referrals: referralRows, testimonials: quotes };
}

export type PhoneRecords = Awaited<ReturnType<typeof recordsForPhone>>;

/** The export: what we hold, in plain field names, without internal ids. */
export function exportRecords(phone: string, r: PhoneRecords) {
  return {
    phone,
    exportedAt: new Date().toISOString(),
    orders: r.orders.map((o) => ({
      number: o.number,
      placed: o.placedAt,
      name: o.customerName,
      phone: o.phone,
      email: o.email,
      delivery: o.deliveryMethod,
      region: o.region,
      town: o.town,
      pickupStation: o.pickupStation,
      address: o.address,
      payment: o.paymentMethod,
      status: o.status,
      totalGHS: o.totalPesewas / 100,
      items: r.items.filter((i) => i.orderId === o.id).map((i) => ({ model: i.model, priceGHS: i.pricePesewas / 100 })),
    })),
    consultationRequests: r.consultations.map((c) => ({
      received: c.createdAt,
      name: c.name,
      phone: c.phone,
      email: c.email,
      business: c.business,
      need: c.need,
      message: c.message,
      contactBy: c.contactMethod,
      status: c.status,
    })),
    waitlists: r.signups.map(({ signup, product }) => ({
      product,
      joined: signup.createdAt,
      name: signup.name,
      phone: signup.phone,
      business: signup.business,
      answer: signup.detail,
    })),
    referralsYouGave: r.referrals.map(({ referral, number }) => ({ order: number, status: referral.status })),
    testimonials: r.testimonials.map((t) => ({ quote: t.quote, signedAs: t.attribution, consentGiven: t.consentGivenAt, published: t.published })),
  };
}
