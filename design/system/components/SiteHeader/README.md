# SiteHeader

Top bar with the logo and four navigation links; the current page is marked with aria-current.

- Logo: `shero-full.svg` on light themes, `shero-light.svg` on dark (see Logos). Height 28px desktop, 24px mobile.
- Links in `label` style, `ink-secondary`; the current page in `primary` with `aria-current="page"`.
- One primary button, small size. On mobile the nav collapses into a menu button; the sheet uses `shadow-float`.
- Consumer provides: the four routes and which one is current.
