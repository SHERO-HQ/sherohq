// SHERO database schema. Source: docs/admin-scope.md (the 10 admin sections)
// and the shop rules in CLAUDE.md. Money is stored in pesewas (GHS × 100) as
// integers so amounts never round. Phones are E.164 (+233XXXXXXXXX).

import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const id = () => uuid("id").primaryKey().defaultRandom();
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

// ── Settings (section 10) ────────────────────────────────────────────────────
// A single row (id = 1). Business details, shop rules and hours live here so
// the owner can change them without a deploy.
export const settings = pgTable(
  "settings",
  {
    id: smallint("id").primaryKey().default(1),
    displayName: text("display_name").notNull().default("SHERO"),
    contactEmail: text("contact_email").notNull().default("hello@sherohq.com"),
    phone: text("phone").notNull().default("+233548711582"),
    whatsappNumber: text("whatsapp_number").notNull().default("233548711582"),
    address: text("address").notNull().default("Tamale, Ghana"),
    openingHours: text("opening_hours").notNull().default("Mon–Fri, 8:00 AM – 6:00 PM"),
    freeDeliveryThresholdPesewas: integer("free_delivery_threshold_pesewas").notNull().default(200_000),
    deliveryWording: text("delivery_wording")
      .notNull()
      .default("Free nationwide delivery on orders over GHS 2,000. Orders placed before 5:00 PM go to the bus station the same day."),
    paymentMethods: jsonb("payment_methods")
      .$type<PaymentMethod[]>()
      .notNull()
      .default(["momo", "card", "cash_on_delivery", "pay_at_pickup"]),
    categories: jsonb("categories")
      .$type<string[]>()
      .notNull()
      .default(["Laptops", "Phones", "Desktops", "Audio", "Accessories"]),
    minBatteryHealth: smallint("min_battery_health").notNull().default(90),
    /** Where new-order, consultation and waitlist emails go; the admin account's email when empty. */
    notifyEmail: text("notify_email"),
    notifyOrders: boolean("notify_orders").notNull().default(true),
    notifyConsultations: boolean("notify_consultations").notNull().default(true),
    notifyWaitlists: boolean("notify_waitlists").notNull().default(true),
    updatedAt: updatedAt(),
  },
  (t) => [check("settings_single_row", sql`${t.id} = 1`)],
);

/**
 * Delivery fee per region for orders under the free-delivery threshold, set by
 * the owner in Settings. One row per region plus "Tamale (local delivery)".
 * A null fee means "not set yet": checkout then says the fee will be confirmed.
 */
export const deliveryRates = pgTable(
  "delivery_rates",
  {
    region: text("region").primaryKey(),
    feePesewas: integer("fee_pesewas"),
    updatedAt: updatedAt(),
  },
  (t) => [check("delivery_rates_fee_not_negative", sql`${t.feePesewas} >= 0`)],
);

// ── Listings (section 3) ─────────────────────────────────────────────────────
export const listingStatus = pgEnum("listing_status", ["draft", "in_stock", "reserved", "sold"]);

export type ListingSpecs = {
  processor?: string;
  ram?: string;
  storage?: string;
  screen?: string;
  graphics?: string;
  /** Operating system, e.g. "Windows 11". */
  system?: string;
  other?: string;
};

export const listings = pgTable(
  "listings",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    model: text("model").notNull(),
    category: text("category").notNull(),
    specs: jsonb("specs").$type<ListingSpecs>().notNull().default({}),
    pricePesewas: integer("price_pesewas").notNull(),
    /** Optional free text, e.g. "light enough for school". */
    note: text("note"),
    grade: text("grade").notNull().default("A++"),
    status: listingStatus("status").notNull().default("draft"),
    /** Photos of the actual device, in display order. */
    photos: jsonb("photos").$type<string[]>().notNull().default([]),
    soldAt: timestamp("sold_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    check("listings_price_positive", sql`${t.pricePesewas} > 0`),
    index("listings_status_idx").on(t.status),
  ],
);

/**
 * The device check behind every listing. Test results are null until tested,
 * then true (pass) or false (fail). A listing can't go In stock until this is
 * complete and battery health meets settings.min_battery_health
 * (enforced in src/lib/listings.ts). Devices without a battery (desktops,
 * bags) set has_battery false and skip the battery check (owner, 30 Sep 2026).
 */
export const deviceChecks = pgTable(
  "device_checks",
  {
    listingId: uuid("listing_id")
      .primaryKey()
      .references(() => listings.id, { onDelete: "cascade" }),
    screen: boolean("screen"),
    keyboard: boolean("keyboard"),
    trackpad: boolean("trackpad"),
    ports: boolean("ports"),
    speakers: boolean("speakers"),
    camera: boolean("camera"),
    wifi: boolean("wifi"),
    charging: boolean("charging"),
    hasBattery: boolean("has_battery").notNull().default(true),
    batteryHealth: smallint("battery_health"),
    batteryReplaced: boolean("battery_replaced"),
    /** e.g. "Original" when replaced. */
    batteryType: text("battery_type"),
    cosmeticCondition: smallint("cosmetic_condition"),
    cleanedAndReset: boolean("cleaned_and_reset"),
    serialLast4: text("serial_last4"),
    checkedAt: timestamp("checked_at", { withTimezone: true }),
    updatedAt: updatedAt(),
  },
  (t) => [
    check("device_checks_battery_range", sql`${t.batteryHealth} between 0 and 100`),
    // No battery, no battery readings.
    check(
      "device_checks_no_battery",
      sql`${t.hasBattery} or (${t.batteryHealth} is null and ${t.batteryReplaced} is null and ${t.batteryType} is null)`,
    ),
    check("device_checks_cosmetic_range", sql`${t.cosmeticCondition} between 0 and 100`),
    check("device_checks_serial_last4", sql`${t.serialLast4} ~ '^[A-Za-z0-9]{4}$'`),
  ],
);

// ── Orders (section 2) ───────────────────────────────────────────────────────
export const deliveryMethod = pgEnum("delivery_method", ["tamale", "bus", "pickup"]);
export const paymentMethod = pgEnum("payment_method", ["momo", "card", "cash_on_delivery", "pay_at_pickup"]);
export type PaymentMethod = (typeof paymentMethod.enumValues)[number];
export const paymentStatus = pgEnum("payment_status", ["pending", "paid", "failed"]);
/**
 * Placed, then Confirmed and packed, then In transit (sent to the station / out for
 * delivery), then Arrived (ready for pickup / delivered). Plus Cancelled. Labels
 * depend on the delivery method; see src/lib/orders.ts.
 */
export const orderStatus = pgEnum("order_status", ["placed", "confirmed", "in_transit", "arrived", "cancelled"]);

export const orders = pgTable(
  "orders",
  {
    id: id(),
    /** Customer-facing: SH-XXXXX. With the phone, it's how orders are tracked. */
    number: text("number").notNull().unique(),
    customerName: text("customer_name"),
    phone: text("phone"),
    email: text("email"),
    deliveryMethod: deliveryMethod("delivery_method").notNull(),
    region: text("region"),
    town: text("town"),
    pickupStation: text("pickup_station"),
    address: text("address"),
    paymentMethod: paymentMethod("payment_method").notNull(),
    paymentStatus: paymentStatus("payment_status").notNull().default("pending"),
    /** Hubtel or Paystack reference, once a payment is started. */
    paymentReference: text("payment_reference").unique(),
    status: orderStatus("status").notNull().default("placed"),
    subtotalPesewas: integer("subtotal_pesewas").notNull(),
    deliveryFeePesewas: integer("delivery_fee_pesewas").notNull().default(0),
    /** The region had no rate yet; the fee is agreed with the customer before dispatch. */
    deliveryFeePending: boolean("delivery_fee_pending").notNull().default(false),
    totalPesewas: integer("total_pesewas").notNull(),
    /** Kept after the referrer's number is erased, so the count survives. */
    hadReferral: boolean("had_referral").notNull().default(false),
    placedAt: createdAt(),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    inTransitAt: timestamp("in_transit_at", { withTimezone: true }),
    arrivedAt: timestamp("arrived_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    /** Arrival date plus seven days. */
    warrantyEndsOn: date("warranty_ends_on"),
    /** Set when name, phone, email and address are removed after retention. */
    anonymisedAt: timestamp("anonymised_at", { withTimezone: true }),
    updatedAt: updatedAt(),
  },
  (t) => [
    check("orders_total_matches", sql`${t.totalPesewas} = ${t.subtotalPesewas} + ${t.deliveryFeePesewas}`),
    check("orders_number_format", sql`${t.number} ~ '^SH-[A-Z0-9]{5}$'`),
    index("orders_phone_idx").on(t.phone),
    index("orders_status_idx").on(t.status),
  ],
);

export const orderItems = pgTable("order_items", {
  id: id(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  listingId: uuid("listing_id").references(() => listings.id, { onDelete: "set null" }),
  /** Snapshots, so the order reads the same after the listing changes. */
  model: text("model").notNull(),
  specSummary: text("spec_summary"),
  pricePesewas: integer("price_pesewas").notNull(),
  quantity: smallint("quantity").notNull().default(1),
});

/** Every status change, for the Track Order timeline and the admin history. */
export const orderEvents = pgTable(
  "order_events",
  {
    id: id(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    status: orderStatus("status").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("order_events_order_idx").on(t.orderId)],
);

// ── Referrals (section 6) ────────────────────────────────────────────────────
export const referralStatus = pgEnum("referral_status", [
  "waiting_for_delivery",
  "ready_to_thank",
  "thanked",
  "asked_to_stay",
  "kept",
  "deleted",
]);

export const referrals = pgTable("referrals", {
  id: id(),
  orderId: uuid("order_id")
    .notNull()
    .unique()
    .references(() => orders.id, { onDelete: "cascade" }),
  /** Erased (set null) on deletion; only orders.had_referral remains. */
  referrerPhone: text("referrer_phone"),
  status: referralStatus("status").notNull().default("waiting_for_delivery"),
  tokenType: text("token_type"),
  tokenAmountPesewas: integer("token_amount_pesewas"),
  thankedAt: timestamp("thanked_at", { withTimezone: true }),
  askedAt: timestamp("asked_at", { withTimezone: true }),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

// ── Consultations (section 4) ────────────────────────────────────────────────
export const consultationStatus = pgEnum("consultation_status", [
  "new",
  "contacted",
  "call_held",
  "quoted",
  "won",
  "closed",
]);
export const contactMethod = pgEnum("contact_method", ["call", "email", "whatsapp"]);

export const consultations = pgTable(
  "consultations",
  {
    id: id(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    business: text("business"),
    need: text("need").notNull(),
    message: text("message"),
    contactMethod: contactMethod("contact_method").notNull(),
    status: consultationStatus("status").notNull().default("new"),
    /** Private admin notes. */
    notes: text("notes"),
    lastContactAt: timestamp("last_contact_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("consultations_status_idx").on(t.status)],
);

// ── Products (SHERO's own, e.g. Merchander and Pharmasyst) ──────────────────
// Added to the admin on the owner's request (30 Sep 2026) so new products can
// be published without a code change. Each has a page at /<slug>.
export const productStatus = pgEnum("product_status", ["in_development", "live"]);

export type ProductCompareRow = { today: string; with: string };

export const products = pgTable(
  "products",
  {
    id: id(),
    /** The page address, sherohq.com/<slug>. Set once; links keep working. */
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    status: productStatus("status").notNull().default("in_development"),
    /** A colour theme from src/lib/product-themes.ts (contrast-checked). */
    theme: text("theme").notNull().default("shero"),
    /** The page headline. */
    title: text("title").notNull(),
    /** One line for the Home card. */
    summary: text("summary").notNull(),
    problem: text("problem").notNull(),
    audience: text("audience").notNull(),
    compare: jsonb("compare").$type<ProductCompareRow[]>().notNull().default([]),
    /** A dashboard preview image; always shown with "Preview · in development" while in development. */
    previewUrl: text("preview_url"),
    /** Where the product lives once it launches. */
    liveUrl: text("live_url"),
    /** First set Live. Waitlist signups are deleted 6 months after. */
    launchedAt: timestamp("launched_at", { withTimezone: true }),
    // The waitlist form's product-specific fields.
    namePlaceholder: text("name_placeholder").notNull().default("Ama Mensah"),
    businessLabel: text("business_label").notNull().default("Business name"),
    businessPlaceholder: text("business_placeholder").notNull().default(""),
    detailLabel: text("detail_label").notNull(),
    detailPlaceholder: text("detail_placeholder").notNull().default(""),
    detailNumeric: boolean("detail_numeric").notNull().default(false),
    published: boolean("published").notNull().default(false),
    displayOrder: smallint("display_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    check("products_slug_format", sql`${t.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
    check("products_live_has_url", sql`${t.status} <> 'live' or ${t.liveUrl} is not null`),
  ],
);

// ── Waitlists (section 5) ────────────────────────────────────────────────────
export const waitlistStatus = pgEnum("waitlist_status", ["new", "contacted", "invited", "piloting"]);

export const waitlistSignups = pgTable(
  "waitlist_signups",
  {
    id: id(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    business: text("business").notNull(),
    /** The product's own question, e.g. what they sell, or number of branches. */
    detail: text("detail").notNull(),
    status: waitlistStatus("status").notNull().default("new"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("waitlist_product_phone_unique").on(t.productId, t.phone)],
);

// ── Work (section 8) ─────────────────────────────────────────────────────────
export const projects = pgTable("projects", {
  id: id(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  client: text("client"),
  logoUrl: text("logo_url"),
  summary: text("summary"),
  built: text("built"),
  year: text("year"),
  outcome: text("outcome"),
  problem: text("problem"),
  solution: text("solution"),
  result: text("result"),
  screenshots: jsonb("screenshots").$type<string[]>().notNull().default([]),
  url: text("url"),
  published: boolean("published").notNull().default(false),
  displayOrder: smallint("display_order").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

// ── Testimonials (section 7) ─────────────────────────────────────────────────
export const testimonialSource = pgEnum("testimonial_source", ["project", "order"]);

export const testimonials = pgTable(
  "testimonials",
  {
    id: id(),
    quote: text("quote").notNull(),
    /** Name or initials, as the person agreed. */
    attribution: text("attribution").notNull(),
    business: text("business"),
    source: testimonialSource("source").notNull(),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
    consentGivenAt: timestamp("consent_given_at", { withTimezone: true }),
    /** How consent was given, e.g. "WhatsApp message, 3 Oct". */
    consentMethod: text("consent_method"),
    published: boolean("published").notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    // A testimonial can't be published without recorded consent.
    check("testimonials_consent_before_publish", sql`not ${t.published} or ${t.consentGivenAt} is not null`),
  ],
);

// ── Careers (section 9) ──────────────────────────────────────────────────────
export const roles = pgTable("roles", {
  id: id(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  howToApply: text("how_to_apply").notNull(),
  open: boolean("open").notNull().default(true),
  /** When it was last closed, shown as "last open". */
  closedAt: timestamp("closed_at", { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

// ── Admin account (one admin, two-factor login, login history) ──────────────
export const admins = pgTable("admins", {
  id: id(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  totpSecret: text("totp_secret"),
  totpEnabledAt: timestamp("totp_enabled_at", { withTimezone: true }),
  /** The last 30-second step a code was accepted for, so a code can't be used twice. */
  totpLastStep: integer("totp_last_step"),
  /** Hashes of one-time recovery codes. */
  recoveryCodes: jsonb("recovery_codes").$type<string[]>().notNull().default([]),
  /** A new two-factor key being set up; it replaces totpSecret once a code from it is confirmed. */
  pendingTotpSecret: text("pending_totp_secret"),
  passwordChangedAt: timestamp("password_changed_at", { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: id(),
    adminId: uuid("admin_id")
      .notNull()
      .references(() => admins.id, { onDelete: "cascade" }),
    /** SHA-256 of the session token; the token itself only lives in the cookie. */
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("admin_sessions_expires_idx").on(t.expiresAt)],
);

/** Login history (Settings shows it) and the source for login rate limits. */
export const loginEvents = pgTable(
  "login_events",
  {
    id: id(),
    adminId: uuid("admin_id").references(() => admins.id, { onDelete: "cascade" }),
    /** "success", "failed" or "locked". */
    outcome: text("outcome").notNull(),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: createdAt(),
  },
  (t) => [index("login_events_created_idx").on(t.createdAt)],
);

/** Each run of the daily retention job and what it removed, shown in Settings. */
export const retentionRuns = pgTable("retention_runs", {
  id: id(),
  ranAt: timestamp("ran_at", { withTimezone: true }).notNull().defaultNow(),
  removed: jsonb("removed").$type<Record<string, number>>().notNull(),
});
