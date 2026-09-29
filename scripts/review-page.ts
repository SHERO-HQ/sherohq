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
    "Client names are set as type until the real logos arrive.",
    "The empty photo band is replaced by the four device checks, under the laptop list.",
    "The desktop laptop table has a battery column; every listing shows battery health.",
    "A WhatsApp prompt under the list: tell us what it's for and we'll recommend one.",
    "A live countdown to the 5:00 PM same-day dispatch cut-off.",
    "Merchander and Pharmasyst say In development on mobile too (the mobile design said waitlist).",
    "Payment facts include store pickup.",
  ],
  menu: [],
  services: [
    "Hardware links straight to laptops in stock, as well as to a consultation.",
    "Each Talk to us link preselects that service on the consultation form.",
    "Mobile shows all four offers per service; the mobile design trimmed them to three.",
  ],
  about: ["What we value has a heading on desktop too, for page structure.", "The work placeholder links to the Work page."],
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
