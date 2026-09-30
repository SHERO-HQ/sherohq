import { livePages, routes } from "../src/lib/site";

/** A listing from `yarn db:seed`, which CI runs against its own local database. */
export const sampleListing = `${routes.shop}/sample-dell-latitude-7490`;

/** Every page the site serves today, including one case study and one listing. */
export const pages: string[] = [
  ...livePages,
  // A case study from the database (seeded by the work migration).
  `${routes.work}/trustcircle`,
  sampleListing,
  // Product pages come from the database (seeded by the products migration).
  "/merchander",
  "/pharmasyst",
  routes.cart,
  "/this-page-does-not-exist",
  // A 404 from inside the site layout (the product route catches /login).
  "/login",
];

/** The admin session admin.setup.ts saves for the admin checks. */
export const adminState = "e2e/.auth/admin.json";

/** Admin pages checked signed in (the editor is checked from the table). */
export const adminPages: string[] = [
  "/admin/dashboard",
  "/admin/orders",
  "/admin/orders?status=placed",
  "/admin/listings",
  "/admin/settings",
  "/admin/settings?tab=delivery",
  "/admin/settings?tab=notifications",
  "/admin/settings?tab=account",
  "/admin/settings?tab=history",
  "/admin/listings?status=draft",
  "/admin/listings/new",
  "/admin/products",
  "/admin/products/new",
  "/admin/work",
  "/admin/work/new",
  "/admin/consultations",
  "/admin/consultations?tab=won",
  "/admin/waitlists",
  "/admin/referrals",
  "/admin/testimonials",
  "/admin/testimonials/new",
  "/admin/careers",
  "/admin/careers/new",
  "/admin/settings?tab=privacy",
];
