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
    "Headline says what SHERO does (your approval, 30 Sep): \"Software, IT support and tested laptops, from Tamale.\" The motto moves to a small line above it, with the logo's bars.",
    "A two-path fork right under it: For your business (Services) and For you (the shop), one link each, so each kind of visitor is one click from their page. On phones both fit on the first screen; the illustration shows on large screens only.",
    "No badge above the headline and no glow behind the hero.",
    "In stock now shows three devices (two on phones) with one row of delivery, payment and warranty and the WhatsApp prompt. The dispatch countdown and buying details live on the shop and laptop pages.",
    "The header's Products opens a small menu of the products instead of jumping to a section of Home. The theme switch moved to the footer.",
    "We've worked with, What do you need?, Our own products and the closing section are unchanged.",
],
  menu: [
    "A plain list under the header, like lucide.dev: the header stays and the menu icon turns into a close mark.",
    "Products opens and closes (closed by default, open on a product page) so the menu stays short as products are added; each unreleased one is marked In development.",
    "Track an order is in the list; one Book a free consultation button, then phone and email.",
    "Escape closes it and focus returns to the menu button.",
  ],
  services: [
    "Each service shows its illustration in a card with what's included. No 01–04 numbers.",
    "Plain one-line intros instead of slogans; the duplicate \"Mobile and web apps\" and vague \"Cloud-based products\" offers are replaced with real ones.",
    "Six generic process steps cut to three real ones: talk, a quote before any work starts, build and support.",
    "Hardware links straight to laptops in stock, as well as to a consultation.",
    "Each Talk to us link preselects that service on the consultation form.",
    "Mobile shows all four offers per service; the mobile design trimmed them to three.",
  ],
  about: [
    "Generic values (Purpose, Integrity, Ownership, Reliability) replaced with four promises a visitor can check: a quote before we start, every device checked, only work we may show, plain In development labels.",
    "The story says what SHERO does, in plain words, instead of a manifesto.",
    "The work placeholder links to the Work page."],
  careers: [
    "The CV email link fills in the subject line.",
    "The repeated values section and the decorative screenshot are gone; one column, one clear action.",
  ],
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
    "Devices without a battery (the sample desktop and bag) show no battery reading.",
    "The facts strip under the heading is gone: warranty, delivery and payment are said once, in What Grade A++ means. One device count instead of two that disagreed.",
    "Payment copy lists only what checkout takes today; MoMo and card appear once Hubtel and Paystack are switched on.",
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
  "admin-dashboard": [
    "The admin now opens here. Each to-do links straight to its record; groups show four and link to the rest.",
    "Revenue counts orders delivered or collected this month, so it isn't inflated by orders that may still be cancelled.",
    "Waitlists get their own group (new signups per product); the design folded them into the counts only.",
  ],
  "admin-consultations": [
    "Steps as buttons in one row; moving past New records the contact date, which the 12-month deletion runs from.",
    "A first reply ready for WhatsApp (Copy or Open WhatsApp), plus Call and Email.",
    "Delete request, for when someone asks for their details to be removed.",
  ],
  "admin-waitlists": [
    "A tab per product in development; each person's step saves as soon as it changes. Remove, for when someone asks to leave.",
    "Export CSV opens cleanly in Excel or Sheets, with phone numbers as you'd dial them.",
    "Once a product goes Live, the page says the date its list will be deleted (6 months later).",
  ],
  "admin-referrals": [
    "The thank-you message on WhatsApp also asks to keep their number; it never names the buyer or promises a reward.",
    "Mark thanked records what you gave (MoMo, airtime, amount). Keep or Delete after asking; numbers not kept are erased automatically 30 days after delivery.",
  ],
  "admin-testimonials": [
    "Publish stays off until consent is recorded: when and how they agreed. A ready WhatsApp message asks their permission with their exact words.",
    "The site shows none until 3 are published; then Home shows the newest three and each case study its client's own.",
  ],
  "admin-careers": [
    "Roles open or closed; the Careers page lists open roles above the send-your-CV message, and its search description names them.",
  ],
  "admin-orders": [
    "The admin opens here. Tabs by status, and a search by order number, phone (any format) or name, which is also how to find a customer's records when they ask.",
    "The sidebar count is orders to confirm or to send. \"+ fee to agree\" marks orders for a region without a delivery rate yet.",
  ],
  "admin-order": [
    "One button moves the order on, worded for its delivery method; it refuses if the order changed in another tab.",
    "An order to a region without a rate can't leave until its fee is agreed on WhatsApp and entered here; the total updates.",
    "Each step's WhatsApp message is written from the order (name, station, cash to have ready, warranty date), with Copy and Open WhatsApp to the customer's number.",
    "Delivered or ready: the devices are marked sold, the warranty date is set, and a referrer becomes ready to thank. Cancelling puts the devices back in stock and erases a referrer's number.",
    "The referrer's number is masked here; the full number lives in Referrals only as long as the privacy rules allow.",
  ],
  "admin-login": [
    "One account, as the admin scope says. Two steps (your request): email and password, then the 6-digit code in six boxes that submits itself. The boxes are one field underneath, so pasting and the phone's code autofill work. A recovery code works in place of the code.",
    "Five wrong tries from one address (or twenty in all) lock sign-in for 15 minutes. Every attempt is recorded for the login history.",
  ],
  "admin-listings": [
    "Only built sections are in the sidebar; the others join as they're built. No search box until search exists.",
    "The Listings count is drafts whose device check isn't complete. A battery under the minimum shows red; devices without a battery say so.",
  ],
  "admin-products": [
    "New section (your request): SHERO's own products, so new ones can be added without a code change. Not in the original admin scope, so no mockup.",
    "Merchander and Pharmasyst moved in with their copy. The phone menu, footer, Home cards, sitemap and FAQ all follow what's shown here.",
  ],
  "admin-product": [
    "Status In development keeps the label, the waitlist and the \"Preview · in development\" tag; Live needs its address and links to it.",
    "Colours come from a set of contrast-checked themes rather than a colour picker, so every product page stays readable in light and dark.",
    "Each product sets its own waitlist question (e.g. what do you sell, number of branches). A product with signups can be hidden, not deleted.",
    "The page address is fixed after creation and can't take an existing page's name (shop, work…).",
  ],
  "admin-settings": [
    "One tab per part (your request): Shop, Delivery fees, Account, Login history, Payments, Business. Tabs are links, so each can be bookmarked and stays open after a save.",
    "Moving two-factor to a new phone opens a modal with the QR code and six code boxes; Escape or Cancel keeps the current phone. New recovery codes have a Copy button.",
    "Phones: the sections sit behind the menu button (the same staggered mark as the site), with a dot when orders or listings are waiting.",
    "Notifications tab (your request): an email for each new order, consultation request and waitlist signup, to your sign-in email or another address, each type on or off, with a test button. Sending starts once Resend is set up; until then the tab says so.",
    "Privacy tab: what's deleted automatically and when, the last nightly run, and a tool for requests about someone's details (find by phone, export, remove).",
    "One Save per tab instead of one for the page, so a refused change (a battery minimum above a device in the shop, a category still in use) doesn't lose the others.",
    "Delivery fees per region, which the mockup didn't have: Tamale doorstep plus the 16 regions. An empty region tells the buyer the fee is confirmed before dispatch.",
    "Payments shows what checkout takes today rather than a text field: MoMo and cards read Not connected until Hubtel and Paystack are wired in.",
    "Business details are shown, not edited: they sit in the site's code (every page, search results, the legal line). Say if you want them editable here.",
    "Account: moving two-factor to a new phone (QR code, confirmed with a code before the old phone stops working), password, new recovery codes, signing out other devices, and the login history in full rather than behind View.",
  ],
  "admin-work": [
    "Client projects move from code to the admin: the Work page, case studies and Home's \"We've worked with\" row follow it.",
    "The list shows how much of each case study is still to write; empty fields stay [bracketed] on the site, never invented.",
  ],
  "admin-project": [
    "Logo and screenshots: the first screenshot leads the Work page and case study, the second shows under What we built.",
    "A yellow note lists what's still empty while the project is shown.",
  ],
  "admin-listing": [
    "Each test is Not tested, Pass or Fail (a checkbox can't record a failure).",
    "Photos of the device: add several at once, reorder (the first is the cover), remove. They're shrunk and stripped of location data before they're stored.",
    "The Status card says, as you fill the check, what still stops the device going in stock; the server enforces the same rule on Save.",
    "\"This device has a battery\" off for desktops and bags hides the battery fields.",
  ],
};

const everywhere = [
  "Shorter buttons: 36px, and 40px for main actions; form fields 40px.",
  "The menu icon is the old site's staggered three-line mark.",
  "Sizes follow the design system's own scale (56/40/30/22px headings, 1200px container, one section spacing), not the mockups' one-off pixel sizes, so pages are calmer and shorter.",
  "Navy is the primary colour; green is secondary: status, short labels and WhatsApp buttons.",
  "No dark \"illustration\" readout cards or big faded numbers; the laptop page keeps its real device check as a plain table.",
  "Fonts load without shifting the page (layout shift 0 on every page).",
  "Light/dark toggle in the header; the site still starts from the device setting.",
  "Footer: logo, motto and a live Open now status on the left; company, offer, help and contact columns; one quiet bottom line with the legal wording and Terms, Privacy, Cookies. The card logos are gone: card payments aren't switched on yet.",
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
