// Builds review/index.html from review/manifest.json (see review-shots.ts).
// Published as an artifact so the owner can compare built pages with the
// designs and leave comments.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(readFileSync(resolve(root, "review/manifest.json"), "utf8"));

// What differs from the mockup on purpose. Anything else that differs is a bug.
const notes: Record<string, string[]> = {
  home: [
    "Each thing said once: hero, clients, one What do you need? row, laptops, our own products, closing panel. 18 cards down to 10.",
    "Hero: bold 64px headline on the left, an illustration of SHERO's work on the right, over a faint dot grid.",
    "We've worked with, Clerk style: small centred label over slowly scrolling names (pause on hover; still if motion is off). Narrow so no name shows twice until there are more clients.",
    "What do you need? merges the old paths and services rows: four illustrated cards titled in the visitor's words.",
    "Laptop cards reuse the shop's card; delivery, payment and warranty sit under them; the device checks moved to the shop and laptop pages.",
    "Merchander and Pharmasyst appear once, in Our own products, each with its illustration and In development label.",
    "A live countdown to the 5:00 PM same-day dispatch cut-off.",
  ],
  menu: [
    "A plain list under the header, like lucide.dev: the header stays and the menu icon turns into a close mark.",
    "Products opens and closes (closed by default, open on a product page) so the menu stays short as products are added; each unreleased one is marked In development.",
    "Track an order is in the list; one Book a free consultation button, then phone and email.",
    "Escape closes it and focus returns to the menu button.",
  ],
  services: [
    "Each service shows its illustration in a card with what's included; the steps are cards.",
    "Hardware links straight to laptops in stock, as well as to a consultation.",
    "Each Talk to us link preselects that service on the consultation form.",
    "Mobile shows all four offers per service; the mobile design trimmed them to three.",
  ],
  about: [
    "Values are four cards with an icon each.","What we value has a heading on desktop too, for page structure.", "The work placeholder links to the Work page."],
  careers: ["The CV email link fills in the subject line."],
  work: ["Visit links stay hidden until each project's live link is supplied."],
  "case-study": [
    "The client quote block only appears once the client gives a quote.",
    "The breadcrumb link is underlined, so it doesn't rely on colour alone.",
  ],
  merchander: ["Labelled In development on mobile too.", "The waitlist form saves signups and checks Ghana mobile numbers."],
  pharmasyst: ["Labelled In development on mobile too.", "The waitlist form saves signups and checks Ghana mobile numbers."],
  shop: [
    "Real listings from the database. These screenshots use clearly labelled local samples, not real stock or prices.",
    "Battery filter is \"New battery (100%)\": every listing is already 90% or more, so 80%/90% options would filter nothing.",
    "Price is one choice at a time (Any price plus three bands), not checkboxes.",
    "On phones, filters fold behind a Filters button instead of category chips.",
    "Reserved devices stay visible, marked Reserved, so shared links still work.",
    "Search and Wishlist icons are left out until those features exist.",
    "An honest empty state when nothing matches, with a WhatsApp prompt.",
  ],
  laptop: [
    "The device check shows this device's real results and date, not an illustration.",
    "Delivery line says whether this item ships free, and adds free store pickup.",
    "No wishlist button until the wishlist exists.",
    "Phones get a sticky price and Add to cart bar, as in the mobile design.",
    "Search engines get product data (price, availability, used condition).",
    "Ask about it on WhatsApp is a green secondary button.",
  ],
  cart: [
    "No quantity stepper: each listing is one specific checked device.",
    "A device reserved by someone else since it was added is flagged before checkout.",
    "Delivery shows Free, or says the region's fee comes at checkout.",
  ],
  checkout: [
    "Adds store pickup (free) with pay at the store.",
    "Delivery fee follows the region's rate from Settings; regions without one say it's confirmed before dispatch.",
    "MoMo and card appear once Hubtel and Paystack are connected; until then only cash on delivery and pay at pickup show.",
    "Placing an order reserves the devices so two buyers can't take the same one.",
  ],
  track: [
    "No expected-delivery date until we can promise one.",
    "The phone number is never put in the page address, so analytics can't see it.",
  ],
  support: [
    "The payment answer adds Telecel Cash and store pickup.",
    "The contact card shows whether SHERO is open right now.",
  ],
  consultation: [
    "Adds a Connecting systems or payments option; the design had no choice for integrations.",
    "Adds a WhatsApp link next to the phone number.",
  ],
  privacy: [],
  terms: ["No mockup; uses the Privacy layout. States only agreed facts; the rest is marked for the owner and a lawyer."],
  cookies: ["No mockup; uses the Privacy layout. Lists the real cookies and lets visitors change their analytics choice."],
  "not-found": [],
};

const everywhere = [
  "Shorter buttons: 36px, and 40px for main actions; form fields 40px.",
  "The menu icon is the old site's staggered three-line mark.",
  "Sizes follow the design system's own scale (56/40/30/22px headings, 1200px container, one section spacing), not the mockups' one-off pixel sizes, so pages are calmer and shorter.",
  "Navy is the primary colour; green is secondary: status, short labels and WhatsApp buttons.",
  "No dark \"illustration\" readout cards or big faded numbers; the laptop page keeps its real device check as a plain table.",
  "Fonts load without shifting the page (layout shift 0 on every page).",
  "Light/dark toggle in the header; the site still starts from the device setting.",
  "Live Open now status in the footer.",
  "Arrows and icons are Lucide, not text characters.",
  "Footer email and phone have larger tap targets on phones.",
];

const data = manifest.pages.map((page: { slug: string }) => ({ ...page, notes: notes[page.slug] ?? [] }));
const captured = new Date(manifest.capturedAt).toLocaleString("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Accra",
});

const template = readFileSync(resolve(root, "scripts/review-template.html"), "utf8");
const html = template
  .replace("__CAPTURED__", `${captured} GMT`)
  .replace("__COMMIT__", manifest.commit)
  .replace("__EVERYWHERE__", everywhere.map((n) => `<li>${n}</li>`).join(""))
  .replace("__DATA__", JSON.stringify(data).replace(/</g, "\\u003c"));

writeFileSync(resolve(root, "review/index.html"), html);
console.log("Wrote review/index.html");
