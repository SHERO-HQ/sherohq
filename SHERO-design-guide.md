# SHERO Design Guide

For revamping sherohq.com and admin.sherohq.com. There are **no mockups**. This guide, `tokens.json` and the PRD are the whole visual brief. When something is not specified, choose the quieter, plainer, more structured option.

---

## 1. The feel

SHERO should feel like a **well-made instrument**, not a marketing page: precise, calm, a little technical, and warm in its words. Think of the confidence of a good spec sheet, a printed invoice, a clean terminal. The company is one person in Tamale doing real work, so the interface proves seriousness through **clarity, restraint and truth**, not through decoration, photography or effects.

Six words: **precise, plain, quiet, warm, honest, local.**

What carries the design (in this order):
1. **Type.** Red Hat in three cuts. Hierarchy is made with size, weight and space.
2. **Space and alignment.** A strict 4px grid, generous section padding, one clear left edge.
3. **Hairlines.** 1px borders separate things; no shadows on cards.
4. **Facts in mono.** Prices, specs, statuses, battery %, order numbers and eyebrows are set in Red Hat Mono. This is SHERO's signature.
5. **Colour used rarely.** Navy is the ink. Emerald marks something true or live. Everything else is neutral.

Every page has **one data moment** (a stock list, a device check, a status readout, an order timeline). It is a real, honest set of facts shown as a table or readout, never a decorative "stats strip". The rest of the page is words.

## 2. Anti-patterns (the "AI slop" list — do not do any of this)

- Rows of three equal cards each with an icon in a coloured circle or square.
- Big numbers with captions as a "stats band" (unless they are real and the page's one data moment).
- Gradients (backgrounds, text, borders), glassmorphism, blur, glow, neon, mesh blobs.
- Dot grids, grid-line backgrounds, orbit/ring graphics, floating shapes, particles.
- Pill buttons, pill badges, fully rounded anything (except 8px status dots).
- Coloured left-border cards, drop shadows on cards, hover "lift" animations.
- Stock illustrations, 3D renders, emoji, decorative icons next to every heading.
- Testimonial carousels, logo marquees, "trusted by" strips of brands SHERO has no right to show.
- All-caps shouty section labels with wide tracking (eyebrows are small mono, sentence-case-ish, with `//`).
- Centered everything. Default to left-aligned text with a clear grid; centre only short single-line moments.
- Headlines that are bigger than the type scale below. Do not enlarge headings to "make it pop".
- Team photos, founder photos, headshots, avatars. SHERO is faceless.
- Marketing adjectives in UI copy ("seamless", "cutting-edge", "world-class", "revolutionary").
- More than one primary button per view.

## 3. Colour

All colour is consumed through semantic tokens (CSS variables). Components never use hex values. Theme follows `prefers-color-scheme`; both themes are fully designed and QA'd on every page.

### 3.1 Brand inks (fixed, from the logo)
- Navy `#043284`
- Emerald `#05735A`

### 3.2 Semantic tokens

| Token | Light | Dark | Use |
|---|---|---|---|
| `page` | `#FFFFFF` | `#050B1E` | Page background |
| `surface` | `#F5F7FA` | `#0A1226` | Alternating section bands |
| `surface-raised` (cards) | `#FFFFFF` | `#0D1734` | Cards, panels, inputs |
| `surface-inverse` | `#011333` | `#020614` | The footer band (one per page) |
| `ink` | `#0B1220` | `#F1F4F9` | Body text |
| `ink-secondary` | `#4B5563` | `#B4BDCB` | Supporting text |
| `ink-muted` | `#5F6877` | `#8E99B0` | Metadata, captions |
| `heading` | `#043284` | `#DCE6F8` | h1–h3 |
| `link` | `#043284` | `#9DB8EC` | Inline links (always underlined) |
| `primary` | `#043284` | `#043284` | Primary button fill (**logo blue in both themes**) |
| `primary-hover` | `#16459F` | `#16459F` | One step lighter on hover |
| `primary-border` | `transparent` | `#2F5EBC` | **Dark only**: 1px border so the button reads against the page |
| `on-primary` | `#FFFFFF` | `#FFFFFF` | Text on primary |
| `accent` | `#05735A` | `#62C3A4` | Eyebrows, success, "Live" dot, small highlights. **Never a button, never a large fill, never body text** |
| `accent-subtle` | `#E9F7F2` | `#022A21` | Tinted background for success notes |
| `info-subtle` | `#EEF3FC` | `#0A1534` | Neutral notice background |
| `warning` / `-subtle` | `#8A4B08` / `#FDF3E3` | `#F3C06B` / `#2B1D08` | Cautions |
| `danger` / `-subtle` | `#B42318` / `#FEF0EE` | `#F97066` / `#2D1210` | Errors, destructive |
| `border` | `#DDE2EA` | `#1C2A4F` | Hairlines, dividers |
| `border-strong` | `#7F8898` | `#5A6FA8` | Input and control borders (≥ 3:1) |
| `focus` | `#2F5EBC` | `#86A7E3` | 2px focus ring, 2px offset |

### 3.3 Dark theme: how it is meant to look
The dark theme is **navy-black**, not grey: the page is a very deep navy, cards sit one small step lighter, and the only saturated thing on screen is the logo-blue button. Verified contrasts:
- `ink` on page 17.8:1 · on card 16.0:1
- `ink-secondary` on card 9.3:1 · `ink-muted` on card 6.2:1
- `link` on card 8.8:1 · `accent` on card 8.3:1
- White on `primary` 11.7:1 · on `primary-hover` 8.8:1
- `primary-border` on page 3.2:1 · `border-strong` on card 3.6:1

**Buttons in dark:** logo-blue fill (`#043284`) + white text + 1px `#2F5EBC` border. The fill alone is only 1.67:1 against the page, so the border is required, not optional. Hover moves the fill to `#16459F`. Focus adds the 2px `focus` ring outside the border.
**Logo in dark:** use the light version of the logo. Never recolour.
**Emerald in dark** is the lighter `#62C3A4`, used only for text/dots, never as a fill behind white text.

### 3.4 Colour rules
- One primary button per view. Secondary actions are outline (transparent, 1px `border-strong`, `ink` text) or text links.
- Colour never carries meaning alone: status always has a label (and a dot is decoration).
- Product pages (Merchander, Pharmasyst) may swap `primary`, `heading` and `accent` for the product's own colours; every other token stays SHERO's.
- Charts (admin only) use navy-scale steps plus emerald; no rainbow.

## 4. Typography

Family: **Red Hat Display** (headings), **Red Hat Text** (reading), **Red Hat Mono** (facts). Self-host with `next/font`, `display: swap`, subset Latin.

| Style | Desktop | Mobile | Weight | Use |
|---|---|---|---|---|
| `display` | 56/60, -0.02em | 36/40 | 600 | Home hero headline only |
| `h1` | 40/46, -0.015em | 30/36 | 600 | Page title (one per page) |
| `h2` | 30/36, -0.01em | 24/30 | 600 | Section headings |
| `h3` | 22/28 | 20/26 | 600 | Card and sub-section titles |
| `body-lg` | 18/28 | 17/27 | 400 | Intros |
| `body` | 16/26 | 16/26 | 400 | Default |
| `body-sm` | 14/22 | 14/22 | 400 | Secondary |
| `mono` | 14/20 | 14/20 | 500 | Prices, specs, statuses, order numbers |
| `eyebrow` | 13/16, mono, +0.02em | same | 500 | `// Section label` in `accent` |

Rules: paragraphs max 640px; sentence case everywhere (including buttons and nav); no all-caps except nothing; tabular numbers (`font-variant-numeric: tabular-nums`) for prices and tables; headline sizes are fixed — do not scale up.

## 5. Space, shape, motion

- 4px grid. Tokens: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Section padding: 96 desktop / 48 mobile. Heading→content: 64 desktop / 32 mobile. Card padding: 24 desktop / 16 mobile.
- Max content width 1200px; 12-col grid desktop, 4-col mobile; gutters 24 / 16.
- Radius: **2px** buttons, inputs, badges; **4px** cards, panels; **8px** product photos only; 999px status dots only.
- Borders: 1px `border`. No shadows except `shadow-float` on menus, the mobile nav sheet and toasts.
- Motion: 150–200ms ease-out for colour/opacity on hover, focus and menu open. Nothing loops or auto-plays. Everything respects `prefers-reduced-motion`.
- Icons: Lucide, 20px, 1.5px stroke, `currentColor`, only where needed (menu, close, arrow, external, check, cart, search, heart). Service cards use a mono index (`01`) instead of icons.

## 6. The slanted-S motif

The logo's slanted S bars may be used as a graphic **only in three places**: Home hero, About hero, 404. Large, low-contrast (navy-scale on navy in dark; navy-100 on white in light), sitting behind or beside the headline, never behind body text. Nowhere else — not in cards, dividers, footers, buttons or backgrounds.

## 7. Layout patterns

- **Left-aligned, asymmetric.** Typical section: eyebrow + h2 in the left 5 columns, content in the right 7. On mobile it stacks.
- **Bands.** Alternate `page` and `surface` bands to separate sections. At most one `surface-inverse` band (the footer).
- **Hairline lists over cards.** For lists of services, FAQs, specs, steps: rows separated by 1px hairlines, with a mono index or label on the left. Use bordered cards only for things the user acts on (a product, a plan, a form).
- **Spec table.** Two-column rows: label (`ink-muted`, body-sm) · value (`mono`, `ink`). Used for device check, product specs, order summary.
- **Timelines.** Vertical, 1px line, 8px dots; completed = `accent`, current = `primary`, upcoming = `border-strong`. Each step has a label and optional time in mono.
- **Hero (Home).** Left: motto and one sentence. Right: "What do you need?" as four stacked rows, each a full-width row with a verb phrase and an arrow, separated by hairlines (rows, not cards). The slanted-S motif sits behind the left column.
- **Mobile.** Single column, 16px gutters, sticky bottom action bar on product detail and checkout (primary button), no hover-only affordances.

## 8. Components (behaviour and rules)

**Button.** Heights 44 (default) / 36 (compact, admin only). Padding 0 20px. Text 15px/600, sentence case, verb that names the result. Variants: `primary` (logo blue; see 3.3), `outline`, `text` (underlined on hover), `danger` (admin). States: hover, focus-visible ring, pressed (fill one step darker), disabled (50% opacity, no pointer), loading (label stays, spinner replaces arrow, width fixed). Never icon-only without `aria-label`.

**Link.** Underlined by default in `link` colour; hover thickens underline. External links get an arrow icon.

**Input / select / textarea.** 44px height, 1px `border-strong`, 2px radius, `surface-raised` fill, label above (never placeholder-as-label), helper text below in `ink-muted`, error text in `danger` with an icon and `aria-describedby`. Phone fields show `+233` prefix and accept `0XX XXX XXXX`.

**Status badge.** Mono 13px, 2px radius, 1px border, 8px dot + label. Variants: *In stock / Live / Delivered* (accent), *In development / In validation / Preview* (info), *Low stock / Pending* (warning), *Sold out / Cancelled / Failed* (danger), *Draft* (neutral). Always text + dot.

**Product (listing) card.** Photo (4:3, 8px radius) · name · mono price (`GHS 4,200`) · one line: `Battery 100% · Grade A++` · stock badge · add-to-cart (outline) . Whole card is a link to detail. No hover lift; hover underlines the name.

**Device-check readout.** Spec-table component with a header "Device check · tested on 12 Oct 2026". Battery row first and emphasised (value in `accent` when ≥ 90%). Rows that were not tested are omitted, never shown as "N/A".

**Cart drawer / page.** Line rows with hairlines, quantity stepper (square), subtotal in mono, delivery note, one primary button.

**FAQ.** Hairline accordion; question in `h3`-sized text, chevron right; only one open at a time on mobile; deep-linkable.

**Forms (consultation, waitlist, checkout).** Single column, max 560px, grouped with hairline-separated fieldsets, one primary button at the end, inline validation on blur, success state replaces the form with a short message and the next step.

**Header.** 64px desktop / 56px mobile, `page` background with a bottom hairline (no blur). Logo left, nav centre/left, one primary button right. Mobile: menu button opens a full-screen sheet with large tap rows. Cart badge: mono count in a 2px-radius square.

**Footer.** `surface-inverse` band, 4–5 text-link columns, contact block, copyright and the Meta sentence in small mono print. No newsletter box, no social icon row unless real accounts exist.

**Cookie notice.** Bottom-left box on desktop, bottom sheet on mobile, `surface-raised`, hairline, two equal buttons (Accept / Decline). No dark patterns.

**Toast.** Floating, `shadow-float`, 4s, `role=status`.

**Empty / error states.** One sentence, one action. No illustrations.

## 9. Imagery

- Product photos: real, neutral background, consistent crop; 1–8 per device. No stock photos of laptops.
- Client work: real screenshots, framed with a 1px hairline and 4px radius; blur sensitive data.
- Unreleased products: a **Preview** badge on the image and a caption that says it is a preview.
- No people. No decorative photography. No illustrations.
- Open Graph image: logo on navy with the page title in Red Hat Display.

## 10. Admin dashboard

Same tokens, denser. The admin is a tool: it should feel like a ledger.
- Sidebar with 10 sections (text + 20px icon), 240px, collapsible; top bar with page title and the primary action.
- Compact button height 36px, body 14px, table row 44px with hairlines, sticky header, no zebra stripes.
- Tables: left-aligned text, right-aligned mono numbers, status badges in the first or last column, row click opens a detail panel (right-hand drawer on desktop, full page on mobile).
- Forms in the admin use the same input style at 40px; destructive actions need a confirm dialog that names the thing being deleted.
- **Rules visible in the UI** (see `admin-scope.md`): a listing's "In stock" toggle is disabled with an explanation until the device check is complete and battery ≥ 90%; testimonials show a consent checkbox that must be ticked to publish; referral rows show the keep/delete choice.
- Dashboard home: today's orders to handle, low-stock items, waitlist signups this week — as lists with counts, not chart tiles. One small trend chart at most.

## 11. Accessibility checklist

- Text 4.5:1, UI controls 3:1, tested in both themes.
- Visible `:focus-visible` ring on everything interactive; skip-to-content link.
- Tap targets ≥ 44×44 (admin compact ≥ 36 on desktop only).
- Headings in order, one h1 per page; landmarks (`header`, `nav`, `main`, `footer`).
- Forms: labels, `aria-invalid`, error summary on submit.
- Motion reduced when requested; no content conveyed by animation.
- Images have alt text that describes the device or the screenshot.

## 12. Definition of "done" for any page

A page is done when:
1. It uses only tokens (search the diff for hex values).
2. It contains none of the section 2 anti-patterns.
3. It has exactly one h1, one primary button, one data moment.
4. It works at 360px width and at 1440px, in light and dark.
5. It passes the honesty rules in the PRD (section 4).
6. Its copy matches `content-drafts.md`; no lorem ipsum, no invented numbers.
