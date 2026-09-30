// Fills the LOCAL database with sample listings so the shop can be built and
// tested before real stock is listed in the admin. Every sample says so in its
// model name and note, and nothing here ever runs against a hosted database.
//
//   yarn db:seed
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { deviceChecks, listings, type ListingSpecs } from "../src/db/schema";

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

await client.end();
console.log(`Seeded ${samples.length} sample listings (local only).`);
