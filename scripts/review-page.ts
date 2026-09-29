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
