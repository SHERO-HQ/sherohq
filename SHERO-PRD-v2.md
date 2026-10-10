# SHERO Website Revamp — PRD

Version 2 · 9 October 2026 · Owner: SHERO (sole operator)

This document says **what each page must do, contain and handle**. It deliberately does not say what anything looks like. Look and feel live in `design-guide.md`; copy lives in `copy.md`; admin behaviour lives in `admin-scope.md`. Where this PRD and an older document disagree, this one wins.

---

## 1. Approach: revamp, not rebuild

sherohq.com and admin.sherohq.com already exist as a Next.js project on Vercel. We **revamp them in place**.

1. **Audit first.** Before changing anything, list the existing routes, components, data models, API routes, env vars and third-party integrations (payments, WhatsApp bot, email, analytics). Write the findings to `docs/audit.md`. Do not delete anything until the audit is read.
2. **Keep what works:** orders, products, payments wiring, WhatsApp bot code, auth for admin, the database schema. Change a schema only when a rule in this PRD or `admin-scope.md` needs it, and do it as a migration.
3. **Replace the surface:** theme tokens, typography, layout, page content, header and footer, and every page listed in section 6.
4. **Remove:** customer accounts and login, the Partners page, Consultation as a separate page from Contact where they overlap, fake or empty sections (see section 4).
5. **Ship in slices** so the live site never breaks: tokens and type → header/footer → Home → Shop and checkout → remaining pages → admin sections → redirects → launch checks.

There are no UI mockups. Build the interface from this PRD plus the design guide, using the existing components as a starting point and restyling or replacing them.

## 2. What SHERO is

SHERO is a Tamale, Ghana technology company. It builds its own products and builds for people, businesses, organizations and communities.

Sells today:
- **Hardware:** refurbished laptops and accessories through the online shop.
- **Custom software:** built to order.
- **Managed IT:** setup and support.
- **Integrations:** systems and APIs.

Own products, all **unreleased**: Merchander (in development), Pharmasyst (in development, v2 rebuild), Healins (in validation; **no page on the site yet**).

Motto: **Redefine Possible**. Brand line in footer, word for word: **"SHERO HQ is a brand of SHERO FINTECH"** (Meta requirement; never reword).

SHERO is **faceless**: one operator, no founder or team photos, no copy that implies a team ("our experts", "we are a team of…"). Use "we" for the company only where natural.

## 3. Goals and non-goals

Goals
1. A visitor understands in 10 seconds what SHERO sells today and what it is building.
2. Every claim on the site is true on launch day.
3. The live offers convert: shop orders, consultation requests, WhatsApp chats.
4. Unreleased products collect waitlist interest and never look finished.
5. The structure can grow into more divisions later without a rebuild.

Non-goals
- No full landing pages for Merchander, Pharmasyst or Healins (one page each, Healins later).
- No pages for inactive divisions.
- No customer accounts, no login, no loyalty system.
- No WhatsApp Cloud API bot or inbox in this phase (see 5.4).
- No testimonials section until at least 3 real, consented ones exist.

## 4. Honesty rules (apply to every page and every admin-driven listing)

- Every number and promise is true on launch day. Support hours are **Mon–Fri, 8:00–18:00**. Never write 24/7, uptime percentages, certifications, awards or integrations that are not live.
- Devices are **refurbished**, **Grade A++** (neat, clean, lightly used, typically UK-used), **90%+ cosmetic condition**, **one-week warranty**. Never "authentic", "genuine", "authorised supplier" or "official". SHERO is not an authorised reseller, so there is **no brand-logo strip**; brand names appear only as the device's own brand on a listing.
- Battery: every listing shows battery health. A device cannot be marked **In stock** without a completed device check and battery health ≥ 90%. Batteries are usually replaced with original batteries at 100%, and the listing says so when true.
- Unreleased products are labelled **In development** or **In validation**. Any dashboard/screen image of them is labelled **Preview**. Never show them as live systems or with client names.
- Work shown on the site: **TrustCircle** (for Samakose), **Tastea**, **Dajrim** — all completed, in production, permission granted. **Business Doctor is not shown.** Text for each must come from the owner; do not invent results or metrics.
- No empty sections waiting for content. If a block has nothing real to show, it does not render.
- Delivery: free nationwide over **GHS 2,000**. Within Tamale: same day, opening to closing. Outside Tamale / Northern region: orders placed before 5pm leave that day by bus or station; orders after 5pm leave the next day; arrival is typically **12–72 hours** depending on destination.
- Referral thank-you: the site promises "a thank-you once your order is delivered" and **never** a specific reward.

## 5. Global behaviour

### 5.1 Header
- Logo (links Home), primary nav, one primary action.
- Nav: Shop · Services · Work · Products · About · Support. (Exact labels per content drafts.)
- **Cart, search and wishlist appear only on Shop and Product-detail pages**, and the cart icon (with count) also appears on any page once the cart is non-empty.
- Mobile: a full-screen menu; the primary action stays reachable.
- Sticky and unobtrusive; never taller than 64px on desktop, 56px on mobile.

### 5.2 Footer
- Columns: Shop, Services, Products, Company (About, Work, Careers), Support (FAQ, Contact, Track order, WhatsApp), Legal (Terms, Privacy, Cookies).
- Contact: hello@sherohq.com · +233 54 871 1582 · Tamale, Ghana · Mon–Fri, 8:00–18:00.
- Legal line, small print, verbatim: **SHERO HQ is a brand of SHERO FINTECH** next to the copyright line.
- The motto appears here once.

### 5.3 Theme
Follows the visitor's system setting (light/dark). Both are first-class. Tokens and rules are in `design-guide.md`. No in-page toggle required (optional, low priority).

### 5.4 WhatsApp (Phase 1, at launch)
- All WhatsApp entry points are **click-to-chat links**: `https://wa.me/233548711582?text=<prefilled, URL-encoded>`.
- Prefilled text names the context: product name + link for "Ask about this laptop"; "I'd like a consultation about…" for services; the order number for order help.
- The team replies from the WhatsApp Business app and sends order confirmation / delivery updates **by hand**. The site must therefore give the team everything needed to do that quickly (admin order view: customer name, phone, address, items, status, one-tap `wa.me` link with a status message template).
- **Do not** remove existing bot code; disable it behind a flag so Phase 2 can reuse it.
- Phase 2 (later, when volume justifies): Cloud API bot + shared inbox in the dashboard. Reason for deferral: from 1 Oct 2026 Meta charges for service and utility messages on the API; the Business app stays free.

### 5.5 Analytics and consent
- Google Analytics with **key events**: `whatsapp_click`, `consultation_submit`, `waitlist_submit`, `add_to_cart`, `begin_checkout`, `purchase`, `track_order`.
- Microsoft Clarity.
- A cookie notice with accept / decline; analytics scripts load only after accept. Cookies page explains this.

### 5.6 Performance, access, SEO
- Mobile first. Target: pages usable under 3 seconds on 4G; images sized and lazy-loaded; no layout shift from fonts (self-host Red Hat via `next/font`).
- Accessible: semantic landmarks, visible focus, 4.5:1 text contrast, tap targets ≥ 44px, `prefers-reduced-motion` respected, all form errors announced.
- SEO: titles and descriptions per page, Tamale/Ghana (never Accra), "refurbished laptops Tamale" kept and plain, `sitemap.xml`, `robots.txt`, Open Graph image, JSON-LD `Organization`, `LocalBusiness`, and `Product` on laptop pages.
- Redirects (301): `/consultation`, `/contact-us` → `/support#contact` or `/consultation` as decided in 6.11; `/products` → `/shop`; `/partners` → `/about`; keep `/careers`; `merchander.sherohq.com` and `pharmasyst.sherohq.com` → their pages here; v1 Pharmasyst stops serving.

### 5.7 Hosting
Vercel Hobby while nothing generates revenue. Move to a commercial plan before launch or at the first sale (Hobby is non-commercial use).

### 5.8 Tone
Playbook voice: clear, human, confident, thoughtful, optimistic. Never corporate, buzzword-heavy or promotional. Lead with people and outcomes, then technology. The belief ("technology exists to expand what's possible") appears once or twice on the whole site. The motto appears in the Home hero, About and Footer only. Approved copy is in `copy.md`; items in [brackets] there still need the owner's input.

---

## 6. Page specifications

Each spec: **Purpose · Audience · Sections in order · Must handle · Content source.** "Sections" are content blocks, not visual components; the builder chooses layout under the design guide.

### 6.1 Home `/`
- **Purpose:** say what SHERO is and route the visitor to the right path.
- **Sections:**
  1. Hero — motto "Redefine Possible", one plain sentence on what SHERO does, and **"What do you need?"** with four paths: *I need a laptop* → `/shop`; *I need software built* → `/services#software`; *I sell on social media* → Merchander waitlist; *I run a pharmacy* → Pharmasyst waitlist. A quiet text link: "Something else? Book a free consultation."
  2. What we do — four services, one line each, linking to Services anchors. (Managed IT is listed here but is **not** a hero path.)
  3. Shop highlights — up to 4 in-stock laptops pulled from the database (name, price, battery health, grade). Hidden if fewer than 2 are in stock.
  4. What we're building — Merchander and Pharmasyst, each with status label, one-line problem, link. This is the page's **one data moment**: a compact status readout.
  5. Client work — logos/names of Samakose, TrustCircle, Tastea, Dajrim linking to Work.
  6. Closing call to action — consultation + WhatsApp.
- **Must handle:** empty shop (hide block), slow images, both themes.
- **Slanted-S motif** may appear here (hero only).

### 6.2 Services `/services`
- **Purpose:** show what SHERO can do for businesses and organizations and how engagement works.
- **Sections:** intro · Software · Hardware (links to Shop) · Managed IT · Integrations (each: who it's for, what's included, how it starts) · The 6-step process · Real support hours · Consultation call to action.
- **Must handle:** anchors `#software #hardware #managed-it #integrations` for deep links.
- **Rule:** no pricing numbers unless the owner supplies them; say "Tell us what you need and we'll quote" instead.

### 6.3 Shop `/shop`
- **Purpose:** let someone find and order a refurbished device.
- **Sections:** page title + plain statement of refurbished/Grade A++/warranty/delivery · a prompt "Tell us what the laptop is for and we'll recommend one" (opens WhatsApp) · filters (category, brand, price, in stock) + sort · product list · pagination or "load more".
- **Listing card must show:** photo, name/model, price in GHS, battery health (%), grade, stock state, add-to-cart.
- **States:** loading skeletons, empty results (offer WhatsApp), out of stock (visible, not purchasable), error with retry.
- **Cart, search and wishlist are visible here.**

### 6.4 Laptop detail `/shop/[slug]`
- **Purpose:** give enough honest detail to buy with confidence.
- **Sections in order:** photos · name, price, stock state, add-to-cart / "Ask about this laptop" (WhatsApp) · **device check readout** (the page's one data moment: battery health %, battery note, screen, keyboard, ports, storage health, camera/speakers, tested date — all from the admin device check) · specs · what's included · warranty (one week, what it covers and does not) · delivery estimate by location · related devices.
- **Must handle:** device check missing → listing cannot be public (enforced in admin), photo count 1–8, sold items stay reachable by URL as "Sold" with similar devices.

### 6.5 Cart `/cart`
- Line items with quantity, remove, subtotal, delivery note (free over GHS 2,000 else "calculated at checkout"), continue shopping, checkout. Persist in local storage; reconcile with stock on load; show a clear message if an item sold out.

### 6.6 Checkout `/checkout`
- **Guest only.** No account creation, no login.
- **Steps (single page, progressive):** contact (name, phone, optional email) → delivery (Tamale pickup / Tamale delivery / outside Tamale: region, town, nearest station) → optional **referral** (referrer's phone number; helper text: "We'll thank them once your order is delivered. We only keep their number if they agree.") → payment → review and place order.
- **Payment methods:** Mobile Money (MTN MoMo, Telecel Cash) via Hubtel · Card (Visa/Mastercard) via Paystack · Cash on delivery (Tamale only unless owner decides otherwise — **confirm**).
- **Must handle:** field validation with Ghana phone formats (`0XX XXX XXXX` and `+233`), double-submit protection, pending/failed/abandoned payment states, webhook-confirmed payment status, stock re-check at submit, order number generated server-side, confirmation page with order number and a "Message us on WhatsApp" link prefilled with the order number.
- **Emails:** confirmation to the customer if an email was given; notification to the team always.

### 6.7 Track order `/track`
- Inputs: order number + phone number. Both must match. Shows a status timeline matching the admin: Placed → Confirmed and packed → Sent to the station (or Out for delivery in Tamale) → Ready for pickup (or Delivered), plus Cancelled, delivery estimate, items, and a WhatsApp help link. Generic error on mismatch ("We couldn't find an order with those details") — never reveal which field was wrong. Rate-limit lookups.
- Order numbers look like `SH-xxxxx`. Warranty end date = delivery date + 7 days, set automatically.

### 6.8 Merchander `/merchander` and Pharmasyst `/pharmasyst`
- **Shared structure:** name + status label · the problem in plain words · who it's for · what it will do (3–4 points) · a **Preview**-labelled image if one exists · waitlist form · back link to Products overview.
- **Waitlist form:** name, phone (WhatsApp), optional email, business type (select), one optional free-text line. Success message says what happens next; no promised dates.
- **Identity:** each product may carry its own logo and accent colour on top of the same layout (Pharmasyst green #13A56B / indigo #3D3FB8; Merchander uses its logo and tagline "Open Path. More Possibilities."). One layout, swappable theme.
- Subdomains redirect here until launch.

### 6.9 Work `/work` and Case study `/work/[slug]`
- **Work:** list of the three projects (name, client, one line, outcome tag). No filters (there are only three).
- **Case study structure:** client and what they do · the problem · what we built · result (only facts the owner provides) · screenshots (real; blurred where sensitive) · "Want something like this?" call to action.
- **Source:** owner supplies text and screenshots (open item). Until supplied, the page lists the three clients with the one-line description only and no case-study link.

### 6.10 About `/about`
- Sections: story (what SHERO is and why it exists) · four core values · what we're building and where it's heading (one short section; no division pages) · motto · contact call to action.
- Faceless: no people. The slanted-S motif may appear in the hero.

### 6.11 Support `/support`
- Sections: FAQ (grouped: Shop & delivery, Warranty, Payments, Services) with search-free accordions · Contact (WhatsApp, email, phone, hours) · Track order link · **Consultation request form** (merged with contact: name, phone, what you need (select), message, preferred contact method).
- `/consultation` and `/contact-us` redirect here.
- FAQ answers must match section 4 exactly.

### 6.12 Careers `/careers`
- Shows open roles from the admin if any; otherwise a short honest note and an email address. No fake roles. If roles exist: title, type, short description, apply by email link.

### 6.13 Legal `/terms` `/privacy` `/cookies`
- Plain-language pages. Privacy lists what is collected (orders, phone numbers, referral numbers, waitlist, analytics), why, payment processors (Hubtel, Paystack), retention periods (see `admin-scope.md`), and how to ask for deletion. **Needs a lawyer's review before launch.**

### 6.14 404 and error pages
- Friendly and short; links to Shop, Services, Support. The slanted-S motif may appear here (404 only).

---

## 7. Data and admin touchpoints

The website reads/writes through the existing database. The admin (see `admin-scope.md`) has 10 sections that enforce the honesty rules above. The rules that affect the public site:
- A listing cannot be **In stock** without a complete device check and battery ≥ 90%.
- Testimonials need recorded consent, and the testimonials block appears on the site only once ≥ 3 are published (otherwise not rendered at all).
- Referral phone numbers are deleted within 30 days of delivery unless the referrer agrees to stay in touch; only a referral count remains.
- Retention periods are as agreed in `admin-scope.md`; order records are kept for a legally safe period that the owner's accountant must confirm.

## 8. Success measures

| Measure | Target |
|---|---|
| Shop orders / month | Set after baseline (today: 0) |
| Consultation requests / month | Set after baseline |
| Waitlist signups per product | Set after baseline |
| WhatsApp clicks / month | Set after baseline |
| Claims review passed at launch | 100% true |
| Mobile load | < 3s on 4G |

## 9. Launch checklist

- [ ] Audit done, `docs/audit.md` written
- [ ] All copy final, no [brackets] left
- [ ] Claims review against section 4, line by line
- [ ] Work content and screenshots supplied for TrustCircle, Tastea, Dajrim
- [ ] Real photos for every listed device
- [ ] Payments tested end to end: MoMo, card, cash on delivery, failure and abandon paths
- [ ] Redirects tested; sitemap submitted
- [ ] Analytics events fire; cookie notice blocks them until accepted
- [ ] Privacy page reviewed by a lawyer; order retention confirmed with accountant
- [ ] Hosting moved to a commercial plan
- [ ] Lighthouse mobile ≥ 90 performance and accessibility on Home, Shop, Laptop detail, Checkout
- [ ] Both themes checked on every page; keyboard-only pass on checkout

## 10. Open items (owner)

1. Client project text and screenshots (TrustCircle, Tastea, Dajrim).
2. Device photos.
3. Cash-on-delivery scope and the Hubtel vs Paystack split.
4. Old dashboard feature list (to compare against the revamped admin).
5. Accountant check on order retention; lawyer review of Privacy.
6. Commercial hosting plan.

11. Migrate the 33 existing products from the old admin as real stock; each needs a device check before it is listed. The GHS 15.00 order of 31 August was a test and should be cleared.
