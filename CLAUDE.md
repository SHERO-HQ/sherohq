# SHERO website and admin rebuild

You're building two things for SHERO, a technology company in Tamale, Ghana:

1. **sherohq.com**, the public website (rebuild of the current site).
2. **admin.sherohq.com**, the admin dashboard (rebuilt alongside the site, trimmed to 10 sections).

Everything was planned and designed before this repo existed. Read this file first, then the docs, then the design for whatever page you're building.

## Where things are

| Path | What it is | Authority |
| --- | --- | --- |
| `docs/prd.md` | Website PRD, including "Decisions since the first draft" | The "Decisions" section overrides anything earlier in the same file |
| `docs/admin-scope.md` | Admin dashboard scope: 10 sections, rules, retention | Source of truth for the admin |
| `design/system/` | Design system: `tokens.json`, `README.md` (brand rules), component previews | Source of truth for colour, type, spacing, radius |
| `design/website/desktop/`, `design/website/mobile/` | Every website page, light and dark | Source of truth for layout **and copy** |
| `design/admin/` | Every admin screen, light and dark | Source of truth for admin layout |

When the docs and the designs disagree on wording, **the designs win**; they were updated last.

**The designs are a strong guide, not a fixed spec** (owner, 29 Sep 2026). Improve on them where it makes SHERO better for visitors — clearer, faster, more useful, more trustworthy — and say what changed and why. Everything under "Rules that must survive into code" still holds; improvements never bend those.

## Reading the design files

The `.dc.html` files are design mockups in a canvas format, not runnable pages. Read them as specs:

- Layout, spacing, colours and type are **inline styles** on each element. Match them, but implement with tokens from `design/system/tokens.json` rather than copying hex values.
- `<x-dc>`, `<helmet>` and the `data-dc-script` block are canvas wrappers; ignore them.
- Text in `[brackets]` is a placeholder for real content (prices, photos, client descriptions). Keep it as a clearly marked placeholder, never invent a value.
- `/_blob/...` image paths are the SHERO logo: the full-colour version on light backgrounds, the light version on dark backgrounds. Use the logo files SHERO already has (`shero-full.svg`, `shero-dark.svg`, `shero-light.svg`, and the mark alone).
- Each page exists in `-light` and `-dark`. Build one page with both themes; the site follows the visitor's system setting.
- Fonts: Red Hat Display (headings), Red Hat Text (body), Red Hat Mono (prices, specs, labels), from Google Fonts.

## Rules that must survive into code

**Honesty.** Every claim must be true on launch day.
- No uptime figures, 24/7 claims, invented ratings, fake reviews or brand-partner logos.
- Unreleased products (Merchander, Pharmasyst) are always labelled "In development", and their dashboard images carry a visible "Preview · in development" tag.
- Testimonials appear only once at least three real, consented ones are published.

**Faceless brand.** No founder or team names or photos anywhere, and no copy that claims a team. Speak as "SHERO" / "we".

**The motto "Redefine Possible"** appears only in the homepage hero, on About and in the footer. The slanted S bars from the logo appear only in the homepage hero, the About hero and the 404.

**Footer legal line**, word for word, required for Meta verification: `SHERO HQ is a brand of SHERO FINTECH`.

**Shop**
- No customer accounts and no login. Checkout is guest-only.
- Orders are tracked with the order number plus the phone number.
- The cart icon shows only on shop and product pages, or once something is in the cart.
- Payments: MoMo (MTN MoMo or Telecel Cash) via Hubtel, cards via Paystack, cash on delivery, or pay at store pickup. Confirmed with the owner on 29 Sep 2026; store pickup was added then (it existed on the old site).
- Free nationwide delivery on orders over GHS 2,000. Orders placed before 5:00 PM go to the bus station the same day.
- A listing can't be set "In stock" until its device check is complete and battery health is at least 90%. Batteries are usually replaced with original batteries at 100%, and listings say so.
- No fixed "Good for" categories. Listings have an optional free-text note, and the shop prompts buyers to ask on WhatsApp for a recommendation.
- Optional referral field at checkout (the referrer's phone number). Promise "a thank-you", never a specific reward.

**WhatsApp, Phase 1 (build this):** no WhatsApp API. Use click-to-chat links (`https://wa.me/233548711582?text=...`). The admin shows a ready-to-send message for each order status, with Copy and Open WhatsApp buttons. Phase 2 (bot and inbox) is out of scope.

**Privacy.** The admin must enforce these rules:
- Referral numbers are deleted within 30 days of delivery unless the referrer agrees to stay in touch; only a count is kept.
- Retention: orders [6] years then anonymised (confirm with an accountant), consultations 12 months, waitlists until 6 months after launch, CVs 12 months, analytics 14 months.

**Analytics:** Google Analytics with key events (consultation booked, order placed, waitlist joined) plus Microsoft Clarity, behind a cookie notice.

## Scope boundaries

- This project is **not** part of the "shero" monorepo (Merchander and Pharmasyst). Keep it separate.
- The admin is not a second Merchander: no bookkeeping, expenses, staff roles or multi-user features.
- Product subdomains (`merchander.sherohq.com`, `pharmasyst.sherohq.com`) redirect to their pages on sherohq.com. Old URLs (`/consultation`, `/contact-us`, `/products`, `/partners`, `/careers`) redirect to their new homes.
- SEO targets Tamale, not Accra.
- The 33 existing products in the old admin are real stock and need migrating; each needs a device check before it's listed. The GHS15.00 order from 31 August was a test and should be cleared.

## Still open (ask the owner, don't guess)

- Real content: client project descriptions and screenshots (TrustCircle, Tastea, Dajrim), device photos, prices.
- A lawyer's review of the Privacy page, and the accountant's check on the 6-year order retention.
- Hosting moves from Vercel Hobby to a commercial plan before launch or at the first sale.

## Build notes

Decisions made while building, on top of the handoff.

**Stack.** Next.js (App Router) + TypeScript + Tailwind CSS v4, Yarn 4. Fonts are self-hosted from `@fontsource-variable` packages rather than loaded from Google Fonts. The old app lives in `main`'s history; the `rebuild` branch started clean.

**Design tokens.** `design/system/tokens.json` is the source of truth. `yarn tokens` generates `src/styles/tokens.css` (CSS variables plus Tailwind theme: `bg-page`, `text-ink`, `text-heading`, `border-border`, `font-display`, `text-h2`, `rounded-sm` and so on). Never edit the generated file; CI fails if it's stale. The few extra colours the page designs use are in `src/app/globals.css`, with notes.

**Database.** New tables in the existing Supabase project, alongside the old ones, so the old site keeps working until launch. The 33 real products are imported as drafts by a one-off script; each still needs its device check.

**Routes.** Chosen for the old-URL redirects in `next.config.ts`; change them there and in `src/lib/site.ts` together.

| Page | Route |
| --- | --- |
| Services | `/services` (sections `#software`, `#hardware`, `#managed-it`, `#integrations`) |
| Shop, laptop detail | `/shop`, `/shop/[slug]` |
| Cart, checkout, track order | `/cart`, `/checkout`, `/track` |
| Products | `/merchander`, `/pharmasyst` (waitlist form at `#waitlist`); the "Products" nav item goes to `/#products` |
| Work, case study | `/work`, `/work/[slug]` |
| About, careers | `/about`, `/about/careers` |
| Support, consultation | `/support` (FAQ at `#faq`), `/support/consultation` |
| Legal | `/legal/terms`, `/legal/privacy`, `/legal/cookies` |

**Placeholders.** Missing content (logos, photos, screenshots, prices) is rendered with the `Placeholder` component, showing the same `[bracketed]` text as the designs. Search for `<Placeholder` and `TODO(owner)` to list what SHERO still needs to supply.

**Open for the owner.** The footer's "Feedback" link has no page in the designs; it points to Support for now.

