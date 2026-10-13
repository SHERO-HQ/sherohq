# sherohq.com

The SHERO website, rebuilt from scratch. SHERO is a technology company in Tamale, Ghana.

## Stack

- Next.js 16 (App Router, static pages), React 19, TypeScript (strict)
- Tailwind CSS 4 with design tokens from the **SHERO — Master Brand** design system
- Vitest + Testing Library for units, Playwright + axe for end-to-end and accessibility

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run check      # lint, typecheck, unit tests
npm run build && npm run test:e2e
```

## How the code is organised

| Folder | Responsibility |
| --- | --- |
| `src/content` | Business facts and copy, typed. Pages never hard-code facts. |
| `src/components/ui` | Small primitives with one job each (Button, Section, StatusBadge…). |
| `src/components/site` | Site chrome: header, footer, theme, navigation. |
| `src/components/home`, `product` | Page sections composed from primitives. |
| `src/app` | Routes only: compose sections and set metadata. |
| `src/styles/globals.css` | The only place colours, radii and fonts are defined. |
| `src/fonts` | Typefaces (swap the brand font here). |

Rules of thumb:

- Components use semantic tokens (`bg-surface`, `text-heading`), never raw hex.
- Content follows PRODUCT.md's truth rules; `src/content/content.test.ts` enforces them.
- Missing owner content is `null` and renders as a visible `[placeholder]`, never invented text.
- Illustrations go where `IllustrationSlot` sits today.

## Themes

Light (white and slate) and dark (the previous site's navy) follow the system setting; the footer toggle saves a choice.
