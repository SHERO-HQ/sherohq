SHERO is the master brand behind SHERO's services (custom software, hardware, managed IT, integration) and its own products (Merchander, Pharmasyst, and those still to come). The system is **engineered but human**: precise type, square edges, a mono voice for facts and numbers, and plain, warm words. Navy is the ink SHERO writes in; emerald is the signal it uses sparingly. Everything here serves one rule from the company playbook: technology should open doors, not add complexity.

## Content fundamentals

- **Clear, human, confident, thoughtful, optimistic.** Never corporate, buzzword-heavy or overly promotional. If a sentence could belong to any company, rewrite it.
- **People first, then technology.** "Tell us what's slowing your business down", not "Leverage cutting-edge solutions".
- **Honest by default.** Every number and promise is true today. Unreleased products carry a StatusBadge. No uptime figures, invented ratings, fake client dashboards, or brand logos SHERO isn't authorised to use.
- **Specific over adjectival.** "Free nationwide delivery on orders over GHS 2,000", "Mon–Fri, 8:00 AM – 6:00 PM", "UK-used, Grade A++".
- **Buttons are verbs that name the result:** "Book a free consultation", "Join the waitlist", "Shop laptops".
- **The belief appears once or twice per site, not in every section.**
- Money is written "GHS 4,200"; phone numbers "+233 54 871 1582"; times "8:00 AM".

## Visual foundations

- **Colour.** Pages sit on `page`, with alternating bands on `surface`; cards on `surface-raised`. Text is `ink`, supporting copy `ink-secondary`, metadata `ink-muted`. Headings use `heading` (the logo navy in light). `primary` is the one main action per view. `accent` (logo emerald) appears only as eyebrows, the live dot, success states and small highlights, never as a large fill or body text. One `surface-inverse` band per page, usually the footer.
- **Type.** Red Hat, one family in three cuts. `display` (Red Hat Display) for headings; `text` (Red Hat Text) for everything people read; `mono` (Red Hat Mono) for eyebrows, prices, specs, statuses and small print. Its geometric shapes echo the SHERO wordmark. Use the `display` style only in the home hero. Mobile steps: display 36/40, h1 30/36, h2 24/30.
- **The mono layer** is SHERO's signature: `// section eyebrows` in `accent`, prices in `price`, specs and statuses in `meta`. It marks facts. Don't set sentences in mono.
- **Edges.** Nearly square: `radius-sm` (2px) for buttons, inputs, badges; `radius-md` for cards; `radius-lg` only for photos. No pill buttons.
- **Structure over decoration.** 1px `border` hairlines separate things. `shadow-float` only for things that float (menus, the mobile nav sheet). No gradients, no glass, no coloured left-border cards, no stock illustration.
- **Space.** 4px grid. Sections `space-9` top and bottom on desktop, `space-7` on mobile. Content max `container-max` (1200px); paragraphs max `measure` (640px).
- **Motion** is quick and quiet: 150–200ms fades and colour changes on hover and focus; nothing loops; everything respects `prefers-reduced-motion`.
- **Accessibility.** Text meets 4.5:1 in both themes (each token's note gives its ratio); control borders 3:1; a 2px `focus` ring with 2px offset on everything interactive. Colour never carries meaning alone.

## Product pages and theming

SHERO pages use only SHERO tokens. A product page (Merchander, Pharmasyst) keeps SHERO's header, footer, type and spacing, and swaps its colour tokens (`primary`, `heading`, `accent` and their pairs) for the product's own from that product's design system, plus the product's logo. Content structure is the same on every product page: status, problem, who it's for, what it will do, waitlist.

## Iconography

Few icons. Service cards use a two-digit mono index ("01") instead. Where an icon is needed (menu, close, arrow, external link, checkmark), use Lucide at 1.5px stroke, 20px, in `currentColor`. Never mix filled and outline icons. Text arrows (→) are fine in links. No emoji.

## Logo

The logo is fixed and never redrawn or recoloured. See the Logos group for which file goes on which background. Minimum height 24px; clear space on every side equal to the height of the "S".
