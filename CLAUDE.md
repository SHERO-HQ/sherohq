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

**No AI slop.** Every word, element and feature earns its place. No filler copy, decorative noise, generic "modern" flourishes, or features added for their own sake. If it doesn't help a visitor decide or act, cut it.

**Icons are Lucide only** (owner, 29 Sep 2026): 1.5 stroke, `currentColor`. No Unicode arrows, checkmarks, stars, bullets or emoji, even where a design uses a text "→"; `src/lib/icons.test.ts` enforces it. Use `InlineArrow` for arrows inside link text. One exception: the menu icon is the old site's staggered three-line mark (`src/components/ui/MenuIcon.tsx`, owner's request, 29 Sep 2026), at the same 1.5 stroke.

**The designs are a strong guide, not a fixed spec** (owner, 29 Sep 2026). Improve on them where it makes SHERO better for visitors — clearer, faster, more useful, more trustworthy — and say what changed and why. Everything under "Rules that must survive into code" still holds; improvements never bend those.

## Reading the design files

The `.dc.html` files are design mockups in a canvas format, not runnable pages. Read them as specs:

- Layout, spacing, colours and type are **inline styles** on each element. Match them, but implement with tokens from `design/system/tokens.json` rather than copying hex values.
- `<x-dc>`, `<helmet>` and the `data-dc-script` block are canvas wrappers; ignore them.
- Text in `[brackets]` is a placeholder for real content (prices, photos, client descriptions). Keep it as a clearly marked placeholder, never invent a value.
- `/_blob/...` image paths are the SHERO logo: the full-colour version on light backgrounds, the light version on dark backgrounds. Use the logo files SHERO already has (`shero-full.svg`, `shero-dark.svg`, `shero-light.svg`, and the mark alone).
- Each page exists in `-light` and `-dark`. Build one page with both themes. The site follows the visitor's system setting until they use the theme toggle in the header (owner, 29 Sep 2026); the choice is stored and applied as `data-theme` on `<html>`. Every dark-theme CSS rule must cover both routes: `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) ... }` and `:root[data-theme="dark"] ...`. Use `.only-light` / `.only-dark` to swap elements such as the logo; don't use `<picture media>` or Tailwind's `dark:`.
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
- Free nationwide delivery on orders over GHS 2,000. Below that, the fee depends on the region (owner, 29 Sep 2026): the owner sets each region's rate in Settings (`delivery_rates`), and a region without a rate yet shows "fee confirmed before dispatch". Store pickup is free. Orders placed before 5:00 PM go to the bus station the same day.
- A listing can't be set "In stock" until its device check is complete and battery health is at least 90%. Batteries are usually replaced with original batteries at 100%, and listings say so. Devices without a battery (desktops, bags) are marked `has_battery = false` on their device check, skip the battery part and show no battery reading (owner, 30 Sep 2026).
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
- SEO: Tamale first, then Ghana-wide (SHERO delivers nationwide). Never target Accra as home (owner, 29 Sep 2026).
- Reach (owner, 30 Sep 2026): software and IT support serve clients anywhere, not only Ghana. Hardware: the shop delivers within Ghana; bulk orders outside Ghana are quoted on request (WhatsApp). Consultation and waitlist forms have a country-code picker, Ghana first (`PhoneField`, `phoneFromParts`; a number typed with its own + wins); checkout and order tracking stay Ghana-only (`normaliseGhanaPhone`), since delivery and MoMo are in Ghana.
- Nothing carries over from the old site's database, not even the 33 old products (owner, 29 Sep 2026). Stock is listed fresh in the new admin, each with its device check.

## Still open (ask the owner, don't guess)

- Real content: client project descriptions and screenshots (TrustCircle, Tastea, Dajrim), device photos, prices.
- A lawyer's review of the Privacy page, and the accountant's check on the 6-year order retention.
- Hosting moves from Vercel Hobby to a commercial plan before launch or at the first sale.

## Build notes

Decisions made while building, on top of the handoff.

**Stack.** Next.js (App Router) + TypeScript + Tailwind CSS v4, Yarn 4. Fonts are self-hosted from `@fontsource-variable` packages through `next/font/local` (`src/app/fonts.ts`), which preloads them and matches fallback metrics so pages don't shift. The old app lives in `main`'s history; the `rebuild` branch started clean.

**Colours** (owner, 29 Sep 2026). Navy is `primary`; emerald is `secondary` (status and success, short section labels, secondary buttons such as WhatsApp).

**Design tokens.** `design/system/tokens.json` is the source of truth. Components use tokens only: the type scale (`text-display`, `text-h1`…`text-h3`, `text-body-lg`, `text-body`, `text-body-sm`, `text-label`, `text-eyebrow`, `text-price`, `text-meta`, which resize for phones on their own), `py-section`, `container-site`, `max-w-measure`, colour tokens, and Tailwind's 4px spacing scale. No one-off values (`text-[30px]`), no Tailwind default text sizes, no hex colours: `src/lib/styles.test.ts` fails the build on them (grid track lists and aspect ratios excepted). Build pages from `Section`/`SectionHeader`/`Eyebrow` (`src/components/ui/Section.tsx`), `Card`/`CardLink`/`CardMedia`/`CardBody` (`src/components/ui/Card.tsx`) and `Button`/`ButtonLink` (`src/components/ui/Button.tsx`). Group related items in cards. Buttons come in two heights: 36px (`md`) and 40px (`lg`); form fields are 40px. Service illustrations (`src/components/illustrations/ServiceArt.tsx`) are drawn with colour tokens and stand in until real photos arrive. The mockups' pixel sizes are a guide to hierarchy, not values to copy. `yarn tokens` generates `src/styles/tokens.css` (CSS variables plus Tailwind theme: `bg-page`, `text-ink`, `text-heading`, `border-border`, `font-display`, `text-h2`, `rounded-sm` and so on). Never edit the generated file; CI fails if it's stale. The few extra colours the page designs use are in `src/app/globals.css`, with notes.

**Database** (owner, 29 Sep 2026). A fresh start; nothing is migrated.
- Postgres with Drizzle. Schema in `src/db/schema.ts`, migrations in `src/db/migrations` (`yarn db:generate`, `yarn db:migrate`). Money is integer pesewas; phones are E.164.
- Local first: `docker compose up -d` runs Postgres 16 (Supabase's version); `yarn db:reset` wipes and re-migrates it and refuses non-local hosts.
- Later, a new Supabase project (free plan) for the rebuild, separate from the old site's project. `rebuild` deploys as a Vercel preview with its own `DATABASE_URL`; previews send `X-Robots-Tag: noindex`. `main` and the live site keep the old database until launch, when `rebuild` is merged.
- Business rules live in code with tests: `src/lib/listings.ts` (In stock needs a complete, passing device check and battery ≥ Settings minimum), `src/lib/orders.ts` (order numbers, status wording per delivery method, warranty). The database also refuses a published testimonial without recorded consent.
- `yarn db:seed` fills the **local** database with sample listings (model names end in "(sample)"); it refuses non-local hosts. CI's browser job runs Postgres, migrates and seeds before the accessibility and speed checks.

**Routes.** Chosen for the old-URL redirects in `next.config.ts`; change them there and in `src/lib/site.ts` together.

| Page | Route |
| --- | --- |
| Services | `/services` (sections `#software`, `#hardware`, `#managed-it`, `#integrations`) |
| Shop, laptop detail | `/shop`, `/shop/[slug]` |
| Cart, checkout, track order | `/cart`, `/checkout`, `/track` |
| Products | `/<slug>` from the `products` table (`src/app/(site)/[product]`), e.g. `/merchander`, `/pharmasyst`; waitlist form at `#waitlist`; the "Products" nav item goes to `/#products` |
| Work, case study | `/work`, `/work/[slug]` from the `projects` table |
| About, careers | `/about`, `/about/careers` |
| Support, consultation | `/support` (FAQ at `#faq`), `/support/consultation` |
| Legal | `/legal/terms`, `/legal/privacy`, `/legal/cookies` |

**Placeholders.** Missing content (logos, photos, screenshots, prices) is rendered with the `Placeholder` component, showing the same `[bracketed]` text as the designs. Search for `<Placeholder` and `TODO(owner)` to list what SHERO still needs to supply.

**Improvements on the designs** (approved 29 Sep 2026):
- Home (owner, 29 Sep 2026): each thing said once. Hero (bold headline beside an illustration); clients row, Clerk style, sitting at the bottom edge of the first screen on desktops (`min-h-first-screen` on the hero and row together) (`LogoCycle`: full-width `border-subtle` lines, a line between the text and each name, none before the text; text beside one row on large screens, above a two-column grid on phones; spots swap names one at a time when there are more clients than spots, still with reduced motion; names as type until logos arrive); one "What do you need?" row of four open, illustrated service columns in the visitor's words (Linear style: `border-subtle` lines either side, no cards; phones list all four, no swiping); the newest in-stock devices, any category (`getNewestInStock`), with delivery, payment and warranty under them and a WhatsApp "tell us what it's for" prompt; our own products (the only place Merchander and Pharmasyst appear on Home); closing consultation section, flat like the hero (navy heading, dot grid rising towards the footer, `ConsultArt`; no slanted bars). Footer: logo, motto and live status; company, offer, help and contact columns; legal line with Terms, Privacy and Cookies (no payment logos until online payments are live; the legal line on its own line, apart from the copyright). The device checks live on the shop and laptop pages, not Home.
- Live, Ghana-time "Open now" status in the footer and a same-day dispatch countdown on shop sections (`src/lib/hours.ts`). The office is open on public holidays; dispatch runs every day, including days the office is closed.
- Every form that takes personal details carries `data-clarity-mask="True"`, and `trackEvent` never gets names, phones or emails: the Cookies page promises analytics never sees them.
- `src/lib/claims.test.ts` fails the build if banned claims (24/7, uptime, "authorised", team/founder copy, ratings) appear in code.

**Quality checks** (owner, 29 Sep 2026). Run before showing any page:
- `yarn test:a11y` (after `yarn build`): axe WCAG 2.1 AA on every live page, light and dark, desktop and mobile. Pure decoration may be excluded with `aria-hidden` plus `data-decorative`. Add each new page to `livePages` in `src/lib/site.ts` so it's checked.
- `yarn test:speed`: Lighthouse mobile on throttled 4G. Budgets in `lighthouserc.cjs` (performance 90+, accessibility and SEO 100, LCP 3 s or less). CI runs both.
- `yarn review` rebuilds the owner's review page (every page beside its mockup): `scripts/review-shots.ts` then `scripts/review-page.ts`, output in `review/` (not committed). Add each new page and its "changed on purpose" notes there, then republish the artifact at https://claude.ai/artifact/W5t9GA29D4x7YxWGt9q15m and pick up the owner's comments on it.

**Shop** (built 29 Sep 2026).
- Queries in `src/lib/shop.ts`; checkout rules in `src/lib/forms/checkout.ts`; placing an order in `src/app/(site)/checkout/actions.ts` (locks the devices, re-checks stock, recomputes the fee, reserves the devices, records the referral).
- The cart is a first-party cookie of listing ids (`src/lib/cart.ts`), so cart and checkout render with live prices and status. Each listing is one device: no quantities.
- Online payments stay hidden until Hubtel (MoMo) and Paystack (cards) are wired in: `onlinePayments()` in `src/lib/payments.ts`. Cash on delivery and pay at store pickup work now. Every page that mentions payment (Home, shop, laptop page, FAQ, structured data) uses `paymentSummary()`, so switching a provider on updates the copy everywhere.
- A region without a delivery rate places the order with `delivery_fee_pending`, and the fee is agreed on WhatsApp before dispatch.
- Track Order looks orders up with a server action, so the phone number never appears in a URL (analytics would see it).
- Not built yet: search and wishlist (the header icons are left out until they exist).

**Admin** (started 30 Sep 2026: sign-in and Listings).
- Same Next.js app under `/admin` (`src/app/admin`), its own layout: no site header, footer, cookie notice or analytics; `noindex`. On admin.sherohq.com the bare host opens `/admin`, other paths go to sherohq.com; sherohq.com never serves `/admin` (redirects in `next.config.ts`). Previews and localhost serve `/admin` directly.
- Sign-in (`src/lib/admin/auth.ts`): one account; email, password (scrypt) and a TOTP code on one form, or a one-time recovery code. Sessions in `admin_sessions` (the cookie `__Host-shero-admin` holds a random token, the database its SHA-256), 12 hours. Every attempt goes in `login_events`; 5 failures from one address or 20 in all within 15 minutes lock sign-in. A code works once (`totp_last_step`).
- **Every admin page and server action calls `requireAdmin()` first**; the layout's check alone isn't enough, because actions can be called directly.
- Create or reset the account: `yarn admin:account you@example.com` (prompts for the password, prints the two-factor key and 8 recovery codes, signs out every session). `yarn db:seed` makes a local-only account (`scripts/local-admin.ts`) that the browser tests and `yarn review` sign in with.
- Listings: the table (status tabs, check summary) and the editor (details, specs, photos, device check with Not tested/Pass/Fail, has-battery, status). The In stock rule is checked live in the editor and enforced by `saveListing`, for In stock and Reserved. Slugs are set once, on create, so shared links keep working. Only drafts can be deleted.
- Photos (`src/lib/admin/photo-store.ts`): shrunk in the browser, uploaded one at a time (server actions allow 4 MB), re-encoded by sharp to WebP at most 1600px with metadata stripped, up to 8 per listing, the first is the cover. Stored in Supabase Storage when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set (public bucket `listing-photos`), else in `.data/uploads` against a local database only, served by `/uploads/[name]`.
- Products (owner, 30 Sep 2026: not in the original scope; products are added over time). The `products` table (Merchander and Pharmasyst moved in by migration) drives the product pages, the Home cards, the phone menu's Products, the footer, the sitemap and the FAQ's products answer (`buildFaq`). Status In development (label, waitlist, "Preview · in development" tag) or Live (needs its https address; the page links to it, no waitlist). Colours come from `src/lib/product-themes.ts` (contrast-checked; add a theme there and in `globals.css`). Slugs are fixed after creation and can't take an existing page's name (`reservedSlugs`). Waitlist signups reference the product; a product with signups can only be hidden, not deleted. Each product's waitlist question is set in the admin (`parseWaitlist` takes its labels).
- Work: the `projects` table drives the Work page, case studies and the Home "We've worked with" row (each project's client and name). Empty text fields show as [bracketed] placeholders (`src/lib/work.ts`), and the admin lists what's still empty. Logo and screenshots (the first leads the page, the second shows under What we built) use the shared `ImageManager` and `PhotoManager`.
- Saving a product or project revalidates the whole site (`revalidatePath("/", "layout")`), since menus and footers show them on every page. Product and case-study pages are built ahead and refreshed hourly or on save.
- Orders (the admin opens here): list with status tabs and search by order number, phone (any format) or name (`src/lib/admin/orders.ts`); the order page shows progress, items, customer and delivery, and the Next step. Rules in `src/lib/order-flow.ts` (tested): one step at a time per delivery method (`nextStatus`, `advanceLabel`), dispatch blocked while a delivery fee is pending (`blockedByFee`; the admin enters the agreed fee and the total updates), and the WhatsApp message for the current status (`whatsappMessage`, with Copy and Open WhatsApp to the customer's number). `advanceOrder` only moves from the status the admin saw (no double steps). On arrival: devices sold, warranty = arrival + 7 days, referral ready to thank. `cancelOrder` (not after arrival): devices held for the order go back in stock, a referrer's number is erased. Cash on delivery / at pickup is marked collected by hand. Referrer numbers are masked on the order page.
- `yarn db:seed` adds one sample order, SH-SAMP1 (holds no device), for the admin pages, checks and review shots.
- Not built yet: Dashboard, Consultations, Waitlists, Referrals, Testimonials, Careers, Settings. Add each to the sidebar in `src/app/admin/(app)/layout.tsx` when it lands.

**Open for the owner.** The footer's "Feedback" link has no page in the designs; it points to Support for now.


<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
