# SHERO Design System & Visual Tokens

This document serves as the single source of truth for SHERO's visual identity, translating our philosophy into concrete design tokens, patterns, and component structures.

## 1. Visual Tokens (Colors)

Our color system is built on Oklch for perceptual uniformity, ensuring accessible contrast ratios across light and dark modes.

### Brand Palette
- **Brand Primary:** Deep Blue-Black Slate (`#043284`) 
- **Brand Secondary:** Emerald/Green (`#05735a`)

### Semantic Tokens (Light Mode)
- **Background:** `oklch(0.99 0.005 240)` - Crisp, near-white
- **Foreground:** `oklch(0.12 0.02 240)` - Deep slate (Darkest text)
- **Card / Popover:** `oklch(1 0 0)` - Pure white surfaces
- **Secondary (Surface):** `oklch(0.98 0.01 165)` - Ultra-light brand mint
- **Muted (Surface):** `oklch(0.96 0.01 240)` - Gentle gray for inactive/subtle areas
- **Destructive:** `oklch(0.577 0.245 27.325)` - Crimson for errors/warnings
- **Border / Input:** `oklch(0.92 0 0)` - Soft structural lines

### Semantic Tokens (Dark Mode)
- **Background:** `oklch(0.14 0.03 240)` - Deep Blue-Black Slate
- **Foreground:** `oklch(0.98 0 0)` - Near pure white
- **Card / Popover:** `oklch(0.18 0.02 240)` - Elevated dark slate
- **Secondary (Surface):** `oklch(0.28 0.02 240)` - Prominent dark slate
- **Muted (Surface):** `oklch(0.22 0.02 240)` - Recessed dark slate
- **Border / Input:** `oklch(0.32 0.02 240)` - Visible structural lines

## 2. Typography

We leverage the Red Hat font family to convey confidence, clarity, and precision.

- **Primary (Headings & UI):** `Red Hat Display`
- **Secondary (Long-form Reading):** `Red Hat Text`
- **Monospace (Code & Numbers):** `Red Hat Mono`
- **Logo/Branding:** Custom/Sora fallback

*Note:* Section headings (`h1` - `h6`) are capped at `font-weight: 600` to maintain a calm, un-heavy reading experience. Base `line-height` is set to `1.6`.

## 3. Component Patterns & Anti-Patterns

### Strict "Instrument-Like" Aesthetic
Components must feel like precision instruments. 

- **Do:** Use solid background fills with our semantic tokens (e.g., `bg-primary`, `bg-secondary`).
- **Do:** Use 1px borders (`border-border`) to define structural boundaries clearly.
- **Do:** Ensure touch targets on mobile devices are at least `44x44px` (e.g., `min-w-[44px] min-h-[44px]`, `w-11 h-11`, or sufficient padding).
- **Don't:** Use CSS gradients, blurs, or "glow" effects. Ambient glows and background gradients are strictly prohibited.
- **Don't:** Use arbitrary or raw Tailwind color classes (e.g., `slate-600`, `emerald-500`) directly in components. Always use semantic CSS variables (`bg-muted`, `text-foreground`, `border-border`).

### Animation & Motion
- **Entry Animations:** Prefer subtle fade-ins, scale-ups, and slight translations (`heroFadeUp`, `heroScaleUp`).
- **Reduced Motion:** Always respect `prefers-reduced-motion` to disable animations for accessibility.

### Accessibility (a11y)
- **Focus Rings:** Enhanced focus indicators using `outline: 2px solid var(--ring)` with a `2px` offset.
- **Contrast:** Dark mode uses elevated contrast for text against backgrounds to ensure WCAG compliance.
