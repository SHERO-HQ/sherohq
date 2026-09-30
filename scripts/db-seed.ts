// Fills the LOCAL database with sample listings so the shop can be built and
// tested before real stock is listed in the admin. Every sample says so in its
// model name and note, and nothing here ever runs against a hosted database.
//
//   yarn db:seed
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  adminSessions,
  admins,
  consultations,
  deviceChecks,
  listings,
  orderEvents,
  orderItems,
  orders,
  products,
  referrals,
  roles,
  testimonials,
  waitlistSignups,
  type ListingSpecs,
} from "../src/db/schema";
import { hashPassword } from "../src/lib/admin/password";
import { localAdmin } from "./local-admin";

const url = process.env.DATABASE_URL ?? "postgres://shero:shero@localhost:5432/shero";
const host = new URL(url).hostname;
if (!["localhost", "127.0.0.1", "db"].includes(host)) {
  console.error(`Refusing to seed a non-local database (${host}).`);
  process.exit(1);
}

type Sample = {
  slug: string;
  model: string;
  category: string;
  specs: ListingSpecs;
  cedis: number;
  /** null: the device has no battery (desktops, bags). */
  battery: number | null;
  replaced: boolean;
  note?: string;
  status?: "in_stock" | "reserved" | "draft";
};

const samples: Sample[] = [
  {
    slug: "sample-hp-elitebook-840-g5",
    model: "HP EliteBook 840 G5 (sample)",
    category: "Laptops",
    specs: { processor: "Intel Core i5, 8th gen", ram: "8GB RAM", storage: "256GB SSD", screen: "14-inch, full HD", system: "Windows 11" },
    cedis: 3200,
    battery: 100,
    replaced: true,
  },
  {
    slug: "sample-dell-latitude-7490",
    model: "Dell Latitude 7490 (sample)",
    category: "Laptops",
    specs: { processor: "Intel Core i7, 8th gen", ram: "16GB RAM", storage: "512GB SSD", screen: "14-inch, full HD", system: "Windows 11" },
    cedis: 4100,
    battery: 100,
    replaced: true,
    note: "Sample listing for local testing. Handles spreadsheets and light design work well.",
  },
  {
    slug: "sample-lenovo-thinkpad-t480",
    model: "Lenovo ThinkPad T480 (sample)",
    category: "Laptops",
    specs: { processor: "Intel Core i5, 8th gen", ram: "8GB RAM", storage: "256GB SSD", screen: "14-inch, HD", system: "Windows 10" },
    cedis: 2600,
    battery: 94,
    replaced: false,
  },
  {
    slug: "sample-macbook-pro-13-2019",
    model: "MacBook Pro 13-inch, 2019 (sample)",
    category: "Laptops",
    specs: { processor: "Intel Core i5, quad-core", ram: "8GB RAM", storage: "256GB SSD", screen: "13-inch, Retina", system: "macOS Sonoma" },
    cedis: 6800,
    battery: 100,
    replaced: true,
  },
  {
    slug: "sample-hp-probook-450-g7",
    model: "HP ProBook 450 G7 (sample)",
    category: "Laptops",
    specs: { processor: "Intel Core i5, 10th gen", ram: "8GB RAM", storage: "512GB SSD", screen: "15.6-inch, full HD", system: "Windows 11" },
    cedis: 3900,
    battery: 91,
    replaced: false,
    status: "reserved",
  },
  {
    slug: "sample-dell-optiplex-7060",
    model: "Dell OptiPlex 7060 (sample)",
    category: "Desktops",
    specs: { processor: "Intel Core i5, 8th gen", ram: "8GB RAM", storage: "256GB SSD", system: "Windows 11" },
    cedis: 1900,
    battery: null,
    replaced: false,
  },
  {
    slug: "sample-laptop-bag",
    model: "Laptop bag, 15-inch (sample)",
    category: "Accessories",
    specs: {},
    cedis: 250,
    battery: null,
    replaced: false,
  },
  {
    slug: "sample-draft-not-shown",
    model: "Draft listing (sample, never shown)",
    category: "Laptops",
    specs: { processor: "Intel Core i3", ram: "4GB RAM", storage: "128GB SSD" },
    cedis: 1500,
    battery: 82,
    replaced: false,
    status: "draft",
  },
];

const client = postgres(url, { max: 1 });
const db = drizzle(client);

// Re-running replaces the samples and leaves anything else alone.
await client`delete from listings where slug like 'sample-%'`;

for (const [i, sample] of samples.entries()) {
  const [row] = await db
    .insert(listings)
    .values({
      slug: sample.slug,
      model: sample.model,
      category: sample.category,
      specs: sample.specs,
      pricePesewas: sample.cedis * 100,
      note: sample.note ?? "Sample listing for local testing.",
      status: sample.status ?? "in_stock",
      // Stagger creation so "Newest" has a stable order.
      createdAt: new Date(Date.now() - i * 60 * 60 * 1000),
    })
    .returning({ id: listings.id });

  const passed = sample.status !== "draft";
  await db.insert(deviceChecks).values({
    listingId: row.id,
    screen: passed,
    keyboard: passed,
    trackpad: passed,
    ports: passed,
    speakers: passed,
    camera: passed,
    wifi: passed,
    charging: passed,
    hasBattery: sample.battery !== null,
    batteryHealth: sample.battery,
    batteryReplaced: sample.battery === null ? null : sample.replaced,
    batteryType: sample.battery !== null && sample.replaced ? "Original" : null,
    cosmeticCondition: 92,
    cleanedAndReset: passed,
    serialLast4: (i + 1).toString(16).padStart(4, "a"),
    checkedAt: new Date(),
  });
}

// One sample order, waiting to be confirmed, so the admin's Orders pages have
// something to show. It holds no device (no listing id), so the shop is unchanged.
await client`delete from orders where number = 'SH-SAMP1'`;
const [sampleOrder] = await db
  .insert(orders)
  .values({
    number: "SH-SAMP1",
    customerName: "Sample Customer",
    phone: "+233244000001",
    deliveryMethod: "bus",
    region: "Ashanti",
    town: "Kumasi",
    pickupStation: "VIP station, Kumasi",
    paymentMethod: "cash_on_delivery",
    subtotalPesewas: 410_000,
    totalPesewas: 410_000,
  })
  .returning({ id: orders.id });
await db.insert(orderItems).values({
  orderId: sampleOrder.id,
  model: "Dell Latitude 7490 (sample)",
  specSummary: "Intel Core i7, 8th gen · 16GB RAM · 512GB SSD",
  pricePesewas: 410_000,
});
await db.insert(orderEvents).values({ orderId: sampleOrder.id, status: "placed" });

// A delivered sample order whose buyer named a referrer, for Referrals.
await client`delete from orders where number = 'SH-SAMP2'`;
const arrived = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
const [deliveredOrder] = await db
  .insert(orders)
  .values({
    number: "SH-SAMP2",
    customerName: "Sample Buyer",
    phone: "+233244000002",
    deliveryMethod: "pickup",
    paymentMethod: "pay_at_pickup",
    paymentStatus: "paid",
    status: "arrived",
    subtotalPesewas: 15_000,
    totalPesewas: 15_000,
    hadReferral: true,
    placedAt: new Date(arrived.getTime() - 2 * 24 * 60 * 60 * 1000),
    arrivedAt: arrived,
    warrantyEndsOn: new Date(arrived.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  })
  .returning({ id: orders.id });
await db.insert(orderItems).values({ orderId: deliveredOrder.id, model: "Laptop bag, 15-inch (sample)", pricePesewas: 15_000 });
await db.insert(referrals).values({ orderId: deliveredOrder.id, referrerPhone: "+233204000521", status: "ready_to_thank" });

// Sample leads, each marked (sample): consultation requests and waitlist signups.
await client`delete from consultations where name like '%(sample)'`;
await db.insert(consultations).values([
  {
    name: "Yaw Boateng (sample)",
    phone: "+233551234567",
    business: "Boateng Provisions",
    need: "software",
    message: "We take orders on WhatsApp and keep losing track of who paid. We have two shops and about 40 orders a week.",
    contactMethod: "whatsapp",
  },
  { name: "Esi Ansah (sample)", phone: "+233201112233", need: "managed-it", contactMethod: "call", status: "contacted", lastContactAt: new Date() },
]);
await client`delete from waitlist_signups where name like '%(sample)'`;
const [merchander] = await db.select({ id: products.id }).from(products).where(eq(products.slug, "merchander")).limit(1);
if (merchander) {
  await db.insert(waitlistSignups).values([
    { productId: merchander.id, name: "Ama Mensah (sample)", phone: "+233244123456", business: "Ama's Imports", detail: "Bags and shoes" },
    { productId: merchander.id, name: "Kojo Addo (sample)", phone: "+233273331180", business: "KA Gadgets", detail: "Phones", status: "contacted" },
  ]);
}

// A testimonial waiting for consent (never published) and a closed role.
await client`delete from testimonials where attribution like '%(sample)'`;
await db.insert(testimonials).values({
  quote: "The laptop they recommended for design school has been perfect.",
  attribution: "Abena O. (sample)",
  source: "order",
  orderId: deliveredOrder.id,
});
await client`delete from roles where title like '%(sample)'`;
await db.insert(roles).values({
  title: "Hardware technician (sample)",
  description: "Check, repair and prepare laptops for the shop.",
  howToApply: "Email your CV with the role in the subject.",
  open: false,
  closedAt: new Date(),
});

// The local admin account (see scripts/local-admin.ts), replacing any other.
await db.delete(admins);
const [admin] = await db
  .insert(admins)
  .values({
    email: localAdmin.email,
    passwordHash: await hashPassword(localAdmin.password),
    totpSecret: localAdmin.totpSecret,
    totpEnabledAt: new Date(),
  })
  .returning({ id: admins.id });
await db.delete(adminSessions).where(eq(adminSessions.adminId, admin.id));
console.log(`Local admin: ${localAdmin.email} / "${localAdmin.password}", two-factor key ${localAdmin.totpSecret}.`);

await client.end();
console.log(`Seeded ${samples.length} sample listings (local only).`);
