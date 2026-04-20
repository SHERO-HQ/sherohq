# SheroTech Design & Brand Guide

**Last Updated:** April 18, 2026  
**Version:** 1.0

---

## Table of Contents

1. [Brand Philosophy](#brand-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Motion & Animation](#motion--animation)
7. [Dark Mode](#dark-mode)
8. [Accessibility](#accessibility)
9. [Photography & Imagery](#photography--imagery)
10. [Voice & Tone](#voice--tone)
11. [Best Practices](#best-practices)

---

## Brand Philosophy

### Core Principles

SheroTech represents **premium, modern tech retail** designed for the Ghanaian market. The design philosophy is rooted in:

- **Clarity**: Clean interfaces reduce cognitive load; users find what they need instantly
- **Premium Aesthetics**: Benchmarked against Apple, HP, Dell, and Lenovo—sophisticated without excess
- **Accessibility**: WCAG AA compliant; inclusive by default, not afterthought
- **Performance**: Smooth, responsive interactions; motion enhances, never distracts
- **Proof-Oriented**: Show value through features, pricing, ratings, and social proof
- **Local Relevance**: Tailored for Ghanaian context (local payment methods, currency, language nuances)
- **Signal vs. Noise**: Every UI element must either facilitate a user goal or build brand authority. If a component doesn't provide "Signal," it is considered "Noise" and removed.

### Visual Identity

**Primary Tone**: Confident, trustworthy, aspirational  
**Secondary Tone**: Friendly, helpful, straightforward  
**Design Personality**: Modern professional with accessible warmth

---

## Color System

### Palette Overview

SheroTech uses **oklch color space** for superior perceptual uniformity across light and dark modes. All colors are defined as CSS variables in `src/index.css`.

#### Primary Colors

| Role                   | Light Mode                    | Dark Mode                 | Hex Equivalent |
| ---------------------- | ----------------------------- | ------------------------- | -------------- |
| **Primary (Emerald)**  | `oklch(0.5737 0.1385 156.05)` | `oklch(0.66 0.12 156.05)` | `#10b981`      |
| **Primary Foreground** | `oklch(0.98 0 0)`             | `oklch(0.98 0 0)`         | `#fff`         |

**Usage**: CTAs, active states, highlights, accent elements, focus rings

#### Neutral Colors

**Light Mode:**

- **Background**: `oklch(1 0 0)` — Pure white (`#ffffff`)
- **Foreground**: `oklch(0.12 0.02 240)` — Deep slate (`#1e293b`)
- **Card**: `oklch(1 0 0)` — White with shadow elevation
- **Border**: `oklch(0.92 0 0)` — Light gray (`#e2e8f0`)
- **Muted**: `oklch(0.96 0.01 240)` — Cool gray (`#f1f5f9`)
- **Muted Foreground**: `oklch(0.45 0 0)` — Medium gray

**Dark Mode:**

- **Background**: `oklch(0.12 0.02 240)` — Deep blue-black slate (`#1e293b`)
- **Foreground**: `oklch(0.98 0 0)` — Off-white (`#fafafa`)
- **Card**: `oklch(0.18 0.02 240)` — Dark slate elevated (`#334155`)
- **Border**: `oklch(0.32 0.02 240)` — Darker slate (`#475569`)
- **Muted**: `oklch(0.22 0.02 240)` — Muted dark slate

#### Semantic Colors

| Intent          | Light                       | Dark                  | Usage                             |
| --------------- | --------------------------- | --------------------- | --------------------------------- |
| **Destructive** | `oklch(0.577 0.245 27.325)` | `oklch(0.45 0.15 25)` | Delete, dangerous actions, errors |
| **Success**     | Emerald primary             | Emerald primary       | Confirmations, completed states   |
| **Warning**     | Amber (`#f59e0b`)           | Amber (`#fbbf24`)     | Warnings, caution messages        |
| **Info**        | Blue (`#3b82f6`)            | Blue (`#60a5fa`)      | Informational messages            |

#### Accessibility Contrast

- **Primary on Background**: 4.6:1+ (WCAG AA, large text) / 7:1+ (WCAG AAA)
- **Text on Light Background**: 9.5:1 (WCAG AAA)
- **Text on Dark Background**: 10:1+ (WCAG AAA)
- **Focus Ring**: Always emerald, minimum 3px, visible on all interactive elements

### Color Usage Guidelines

**DO:**

- Use emerald for primary actions and focus states
- Ensure sufficient contrast for text (min 4.5:1)
- Test colors in both light and dark modes
- Use semantic colors consistently (destructive = red across the app)

**DON'T:**

- Overlay text directly on images without a scrim/overlay
- Use low-saturation colors for important information
- Mix color systems (don't use hex directly if oklch variables exist)
- Ignore contrast requirements to achieve a design aesthetic

---

## Typography

### Font Stack

| Role          | Font                    | Variable                    | Usage                        |
| ------------- | ----------------------- | --------------------------- | ---------------------------- |
| **Primary**   | Sora Variable           | `font-primary`, `font-sora` | Body, UI, primary content    |
| **Monospace** | JetBrains Mono Variable | `font-mono`                 | Code, prices, SKUs, data     |
| **Logo**      | Sora Variable           | `font-logo`                 | Brand mark (special variant) |

**Loading Strategy**: Fonts loaded via Next.js `next/font` with automatic subsetting, preloading, and self-hosting (zero CLS, optimal performance).

### Scale & Sizing

**Base Font Size**: 15px (`font-size: 15px` on `:root`)

| Level           | Class         | Size | Line Height | Weight         | Usage                            |
| --------------- | ------------- | ---- | ----------- | -------------- | -------------------------------- |
| **Display**     | `text-7xl`    | 48px | 1.05        | 900 (black)    | Hero titles, product names       |
| **Heading 1**   | `text-6xl`    | 42px | 1.1         | 800 (bold)     | Section titles, major headings   |
| **Heading 2**   | `text-4xl`    | 30px | 1.15        | 700 (bold)     | Subsections                      |
| **Heading 3**   | `text-2xl`    | 20px | 1.2         | 600 (semibold) | Feature titles                   |
| **Heading 4**   | `text-xl`     | 18px | 1.3         | 600 (semibold) | Minor headings                   |
| **Body Large**  | `text-lg`     | 17px | 1.6         | 400 (regular)  | Emphasis, secondary content      |
| **Body Normal** | `text-base`   | 15px | 1.6         | 400 (regular)  | Primary content                  |
| **Body Small**  | `text-sm`     | 13px | 1.5         | 400 (regular)  | Metadata, labels, secondary info |
| **Caption**     | `text-xs`     | 11px | 1.4         | 500 (medium)   | Timestamps, icons labels         |
| **Micro**       | `text-[10px]` | 10px | 1.3         | 600 (semibold) | Badges, tags, category labels    |

### Typographic Hierarchy

**Effective Hierarchy** relies on:

1. **Size**: Display > Headings > Body
2. **Weight**: Bolder for emphasis
3. **Color**: Emerald accents, muted secondaries
4. **Spacing**: Generous whitespace separates sections
5. **Letter Spacing**: Uppercase labels use `tracking-widest` (0.1em)

### Font Weight Usage

| Weight  | Usage                            | Tailwind Class   |
| ------- | -------------------------------- | ---------------- |
| **400** | Body copy, regular text          | `font-normal`    |
| **500** | Emphasis, labels                 | `font-medium`    |
| **600** | Secondary headings, UI buttons   | `font-semibold`  |
| **700** | Primary headings, impact text    | `font-bold`      |
| **800** | Major headings                   | `font-extrabold` |
| **900** | Hero titles, display text        | `font-black`     |

### Line Length & Readability

- **Ideal**: 50–75 characters per line
- **Max Width**: 65 characters for body copy
- **Line Height**: 1.6 for body, 1.05–1.2 for headings

---

## Spacing & Layout

### Spacing Scale

SheroTech uses **8px base unit** with derived scale:

| Size    | Value | Tailwind  | Usage                            |
| ------- | ----- | --------- | -------------------------------- |
| **xs**  | 2px   | `gap-0.5` | Micro-spacing, icon-to-text      |
| **sm**  | 4px   | `gap-1`   | Tight grouping, icon buttons     |
| **md**  | 8px   | `gap-2`   | Default spacing between elements |
| **lg**  | 12px  | `gap-3`   | Component internal spacing       |
| **xl**  | 16px  | `gap-4`   | Section padding, moderate gaps   |
| **2xl** | 24px  | `gap-6`   | Component boundaries             |
| **3xl** | 32px  | `gap-8`   | Major section separation         |
| **4xl** | 48px  | `gap-12`  | Page-level separation            |
| **5xl** | 64px  | `gap-16`  | Hero section padding             |
| **6xl** | 80px  | `gap-20`  | Full-page vertical rhythm        |

### Border Radius

| Scale    | Value  | Tailwind       | Usage                           |
| -------- | ------ | -------------- | ------------------------------- |
| **sm**   | 4px    | `rounded-sm`   | Micro-interactions (buttons)    |
| **md**   | 6px    | `rounded`      | Default (cards, inputs, modals) |
| **lg**   | 8px    | `rounded`   | Prominent containers            |
| **xl**   | 12px   | `rounded`   | Large feature blocks            |
| **2xl**  | 16px   | `rounded-2xl`  | Extra prominent, CTAs           |
| **3xl**  | 20px   | `rounded-3xl`  | Hero sections, badges           |
| **full** | 9999px | `rounded-full` | Circles, pills                  |

**Base Radius**: `--radius: 0.5rem` (8px)  
**Derived via**:

```css
--radius-sm: calc(var(--radius) - 4px); /* 4px */
--radius-md: calc(var(--radius) - 2px); /* 6px */
--radius-lg: var(--radius); /* 8px */
--radius-xl: calc(var(--radius) + 4px); /* 12px */
/* ...etc */
```

### Container Sizes

| Breakpoint | Width  | Tailwind | Devices       |
| ---------- | ------ | -------- | ------------- |
| **sm**     | 640px  | —        | Small phones  |
| **md**     | 768px  | —        | Tablets       |
| **lg**     | 1024px | —        | Desktop       |
| **xl**     | 1280px | —        | Large desktop |
| **2xl**    | 1536px | —        | Ultra-wide    |

**Container Padding**:

- Mobile (`xs–sm`): 16px (`px-4`)
- Tablet (`md`): 24px (`px-6`)
- Desktop (`lg+`): 32px (`px-8`)

**Max Content Width**: `max-w-7xl` (80rem, 1280px)

### Layout Patterns

#### Hero Section

```
[Full-width background image/pattern]
├─ Background overlay/scrim
├─ Ambient glow effect (optional)
└─ Content wrapper (max-w-7xl)
   ├─ Text column (lg: w-1/2)
   └─ Image column (lg: w-1/2)
```

#### Card Grid

```
Container (max-w-7xl, mx-auto)
└─ Grid (gap-6, responsive cols: sm:2, md:3, lg:4)
   └─ Card (rounded, border, shadow)
```

#### Navigation & Topbar

- **Fixed positioning** on mobile/tablet, sticky on large screens
- **Dynamic offset**: Measured height via ResizeObserver, consumed via CSS variable
- **Mobile drawer**: Slide-in from left, overlay backdrop
- **Desktop horizontal**: Left-aligned logo, centered nav items, right-aligned cart/profile

---

## The Signal Block Pattern

"Signal Blocks" are high-authority components designed to provide preemptive clarity and reduce user friction.

### 1. The Process Framework

**Goal**: Visualize complex workflows (Partnerships, Consultations) to set expectations.

- **Visuals**: Numbered steps (01, 02, 03) with dashed connectors.
- **Typography**: Light font weights for descriptions, bold for headers.

### 2. Preemptive Clarity (Quick FAQs)

**Goal**: Address technical bottlenecks before they reach the support desk.

- **Visuals**: Clean grid with subtle borders and icon-driven headers.
- **Placement**: Directly below primary contact forms or CTAs.

### 3. Verification & Proof

**Goal**: Build trust through verified status and influence.

- **Visuals**: Badge-style industry tags and looping brand carousels.

---

## Components

### Buttons

#### Primary CTA Button

- **Background**: Emerald (`bg-emerald-500`)
- **Hover**: Emerald-400 (`hover:bg-emerald-400`)
- **Padding**: `px-8 py-3` (medium), `px-6 py-2` (small)
- **Border Radius**: `rounded` (default 6px)
- **Shadow**: `shadow shadow-emerald-500/20`
- **Hover Lift**: `-translate-y-0.5`
- **State**: `active:scale-90`
- **Accessibility**: Focus ring, keyboard navigable

#### Secondary Button

- **Background**: Slate/neutral (`bg-slate-100 dark:bg-slate-900`)
- **Hover**: Emerald background with white text
- **Border**: `border border-slate-200 dark:border-slate-800`
- **Padding**: Same as primary
- **No lift**: Subtle interaction

#### Disabled State

- **Opacity**: 50% (`opacity-50`)
- **Cursor**: `cursor-not-allowed`
- **Pointer Events**: `pointer-events-none`
- **No hover effect**

#### Button Sizes

| Size   | Padding       | Text        | Icon | Usage       |
| ------ | ------------- | ----------- | ---- | ----------- |
| **sm** | `px-3 py-1.5` | `text-xs`   | 16px | Chips, tags |
| **md** | `px-6 py-2`   | `text-sm`   | 20px | Default     |
| **lg** | `px-8 py-3`   | `text-base` | 24px | CTAs, hero  |

### Input Fields

- **Background**: `bg-input` (slate-100 light / slate-900 dark)
- **Border**: `border border-input` with `border-slate-200 dark:border-slate-800`
- **Focus**: Emerald ring (`ring-2 ring-primary`)
- **Padding**: `px-4 py-2.5`
- **Border Radius**: `rounded` (6px)
- **Error State**: Red border + error message below
- **Placeholder**: Muted foreground color

### Cards

- **Background**: Elevated surface (`bg-card`)
- **Border**: Optional, subtle (`border border-border`)
- **Padding**: `p-6` (default)
- **Border Radius**: `rounded` (8px)
- **Shadow**: `shadow-sm` (subtle) to `shadow-lg` (prominent)
- **Hover**: Optional `hover:shadow-md` + subtle scale on interactive cards

### Badges & Tags

- **Background**: Muted (`bg-muted`)
- **Text**: Muted foreground (`text-muted-foreground`)
- **Padding**: `px-2.5 py-1`
- **Border Radius**: `rounded-full` (pill shape)
- **Font Size**: `text-xs`, `font-medium`
- **Variant (Success)**: Green background, white text
- **Variant (Destructive)**: Red background, white text

### Modals & Overlays

- **Backdrop**: `bg-black/50` (semi-transparent)
- **Backdrop Blur**: `backdrop-blur-sm`
- **Modal Background**: `bg-card`
- **Border Radius**: `rounded` (8px)
- **Padding**: `p-6` (content)
- **Shadow**: `shadow-2xl`
- **Animation**: Fade + scale-up on open

### Accordion

- **Header Background**: Hover → muted background
- **Header Padding**: `px-4 py-3`
- **Content Padding**: `px-4 py-3` (inside border-left)
- **Border Left**: `border-l-2 border-primary` (when expanded)
- **Icon Rotation**: 180° on expand
- **Animation**: Smooth height collapse/expand

### Navigation

#### Horizontal Navigation (Desktop)

- **Layout**: Flex, space-between
- **Item Spacing**: `gap-8` between links
- **Active Indicator**: Bottom border, emerald color
- **Hover**: Color transition to emerald

#### Mobile Drawer Navigation

- **Position**: Fixed left, full height
- **Backdrop**: Semi-transparent overlay
- **Animation**: Slide in from left
- **Width**: Typically 280px
- **Padding**: `p-6`
- **Items**: Full-width links, vertical spacing

---

## Motion & Animation

### Animation Principles

- **Purpose**: Guide attention, provide feedback, maintain context
- **Duration**: Fast (200ms) for micro-interactions, medium (400–800ms) for page transitions
- **Easing**: `easeInOut` for natural feel; `spring` for playful feedback
- **Accessibility**: Respect `prefers-reduced-motion` media query

### Common Animation Patterns

#### Fade + Scale (Element Entry)

```javascript
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.3, type: "spring", damping: 20 }}
```

**Usage**: Modal open, card entry, dropdown appear

#### Fade In (Gentle Entry)

```javascript
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 0.6, ease: "easeInOut" }}
```

**Usage**: Hero sections, background elements, staggered content

#### Slide Up (Vertical Entry)

```javascript
initial={{ y: 20, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
transition={{ delay: 0.2, duration: 0.4 }}
```

**Usage**: Form fields, list items, staggered reveals

#### Slide In from Side (Horizontal Entry)

```javascript
initial={{ x: -20, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
transition={{ duration: 0.4, ease: "easeOut" }}
```

**Usage**: Drawer navigation, sidebar, modal slides

#### Rotation & Hover Effects

```javascript
whileHover={{ rotate: -5, scale: 1.05 }}
whileTap={{ scale: 0.95 }}
transition={{ type: "spring", stiffness: 200, damping: 10 }}
```

**Usage**: Interactive cards, hover feedback, CTA buttons

### Motion Curve Definitions

| Curve       | Timing                   | Usage                                     |
| ----------- | ------------------------ | ----------------------------------------- |
| `easeOut`   | Slower start, faster end | Element entry (landing)                   |
| `easeIn`    | Faster start, slower end | Element exit (leaving)                    |
| `easeInOut` | Balanced                 | Page transitions, smooth scrolls          |
| `spring`    | Bouncy, natural          | Playful feedback, delightful interactions |
| `linear`    | Constant                 | Progress bars, loaders, timers            |

### Animation Durations

| Duration   | Milliseconds | Usage                                  |
| ---------- | ------------ | -------------------------------------- |
| **Micro**  | 100–150ms    | Hover feedback, icon rotation          |
| **Short**  | 200–300ms    | Button clicks, small transitions       |
| **Medium** | 400–600ms    | Modal open, slide transitions          |
| **Long**   | 800–1200ms   | Page/section entry, complex animations |
| **XL**     | 1500–3000ms  | Auto-play carousel, storytelling       |

### Reduced Motion Compliance

In `src/index.css`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Testing**: Enable in DevTools → Rendering → Emulate CSS Media Feature Prefers-Reduced-Motion

---

## Dark Mode

### Implementation

Dark mode is **system-aware** and **user-toggleable**:

1. **System Preference**: Respects OS dark mode setting on first visit
2. **Storage**: User preference saved to localStorage
3. **Toggle**: Theme switcher in UI (header/settings)
4. **CSS Class**: `.dark` applied to `<html>` element
5. **CSS Variables**: Automatically switch on `.dark` context

### Dark Mode Colors (oklch)

| Element    | Light                               | Dark                                  | Contrast Ratio |
| ---------- | ----------------------------------- | ------------------------------------- | -------------- |
| Background | `oklch(1 0 0)` (white)              | `oklch(0.12 0.02 240)` (deep slate)   | 20:1           |
| Foreground | `oklch(0.12 0.02 240)` (deep slate) | `oklch(0.98 0 0)` (off-white)         | 20:1           |
| Card       | `oklch(1 0 0)` (white)              | `oklch(0.18 0.02 240)` (dark slate)   | 11:1           |
| Border     | `oklch(0.92 0 0)` (light gray)      | `oklch(0.32 0.02 240)` (darker slate) | —              |
| Primary    | `oklch(0.5737 0.1385 156.05)`       | `oklch(0.66 0.12 156.05)` (brighter)  | 4.6:1 (AA)     |
| Muted      | `oklch(0.96 0.01 240)` (cool gray)  | `oklch(0.22 0.02 240)` (dark)         | —              |

### Dark Mode Patterns

Utility classes in `src/index.css`:

```css
.dark .pattern-dots {
  background-image: radial-gradient(#94a3b844 1px, transparent 1px);
}

.dark .pattern-diagonal {
  background-image: repeating-linear-gradient(45deg, #64748b22 0, ...);
}
```

### Image Handling in Dark Mode

**Approach**: Use `dark:` prefix for Tailwind classes to adjust overlays/filters:

```jsx
<div className="bg-black/20 dark:bg-white/10">
  <Image src={imageUrl} alt="" />
</div>
```

**Considerations**:

- Product images often lose contrast on dark backgrounds; use subtle overlays
- Icons from `lucide-react` inherit text color; they adapt automatically
- Test critical photos in both modes

---

## Accessibility

### WCAG AA Compliance

SheroTech is designed to meet **WCAG 2.1 Level AA** standards:

- ✅ Minimum contrast ratio: 4.5:1 for normal text
- ✅ Large text contrast: 3:1 (18pt+ or 14pt bold+)
- ✅ Focus indicators: Always visible, minimum 3px
- ✅ Keyboard navigation: All interactive elements reachable via Tab
- ✅ Semantic HTML: Proper heading hierarchy, form labels, landmarks
- ✅ Alt text: All images have descriptive alt text
- ✅ Motion: Respects `prefers-reduced-motion` setting

### Focus & Interaction States

#### Focus Visible Ring

```css
*:focus-visible {
  outline: 2px solid oklch(0.66 0.12 156.05); /* Emerald */
  outline-offset: 2px;
  border-radius: 4px;
}

button:focus-visible,
[role="button"]:focus-visible {
  outline-offset: 3px;
}
```

#### Interactive Element Cursor

```css
button,
[role="button"] {
  cursor: pointer;
}
```

### Skip Navigation

**Implementation**: Hidden link at top of layout

```jsx
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

**Target**: `<main id="main-content">` on all pages

### Semantic HTML Structure

**Correct:**

```jsx
<header>
  <nav>
    <ul>
      <li><a href="/shop">Shop</a></li>
      <li><a href="/about">About</a></li>
    </ul>
  </nav>
</header>

<main id="main-content">
  <section>
    <h1>Featured Products</h1>
    {/* content */}
  </section>
</main>

<footer>
  {/* footer content */}
</footer>
```

### Form Accessibility

```jsx
<div className="flex flex-col">
  <label htmlFor="email" className="text-sm font-medium mb-2">
    Email Address
  </label>
  <input
    id="email"
    type="email"
    aria-required="true"
    aria-describedby="email-error"
    className="px-4 py-2 border rounded focus:outline-2 focus:outline-emerald-500"
  />
  <span id="email-error" className="text-xs text-red-600 mt-1">
    Please enter a valid email
  </span>
</div>
```

### Icon Accessibility

```jsx
// Icon with text label (no aria needed)
<button>
  <ShoppingCart size={20} />
  <span>Add to Cart</span>
</button>

// Icon only button (requires aria-label)
<button aria-label="Search">
  <Search size={20} />
</button>

// Decorative icon (aria-hidden)
<span aria-hidden="true">
  <Star size={16} />
</span>
```

### Color as Information

**DON'T**: Use color alone to convey information  
**DO**: Combine color with icons, text, or patterns

```jsx
// ❌ Bad: Color only
<div className="bg-red-500">Error</div>

// ✅ Good: Color + icon + text
<div className="flex items-center gap-2 bg-red-50 text-red-700">
  <AlertCircle size={20} />
  <span>Error: Check your email</span>
</div>
```

---

## Photography & Imagery

### Product Photography

- **Style**: Clean, well-lit, neutral background
- **Angle**: 3/4 view or head-on, lifestyle context optional
- **Format**: Square (1:1) for grids, 16:9 for hero featured images
- **Resolution**: Minimum 1200px on longest edge
- **File Format**: WebP with JPEG fallback for browser support

### Image Optimization

**Using Next.js `Image` Component:**

```jsx
import Image from "next/image";
import { getImageUrl } from "@/services/api";

export default function ProductImage({ src, alt }) {
  return (
    <Image
      src={getImageUrl(src)}
      alt={alt}
      fill
      priority
      className="object-cover object-center"
    />
  );
}
```

**Benefits**:

- Automatic lazy loading
- Responsive sizing
- Format optimization (WebP)
- Zero Cumulative Layout Shift (CLS)

### Hero Section Images

- **Overlay Scrim**: Dark overlay (50–60% opacity) for text readability

```jsx
<div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/60 to-transparent" />
```

- **Ambient Glow**: Colored blur effect behind content

```jsx
<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-75 h-75 bg-emerald-500/10 blur-[120px] rounded-full" />
```

### Pattern Backgrounds

Pre-defined utility classes in `src/index.css`:

| Pattern            | Class                   | Usage                          |
| ------------------ | ----------------------- | ------------------------------ |
| **Grid (White)**   | `.pattern-grid-white`   | Light backgrounds, subtle      |
| **Grid (Emerald)** | `.pattern-grid-emerald` | Branded sections, emerald tint |
| **Dots**           | `.pattern-dots`         | General purpose, modern feel   |
| **Diagonal**       | `.pattern-diagonal`     | Diagonal rhythm, contemporary  |

---

## Voice & Tone

### Brand Voice Attributes

| Attribute          | Description                  | Example                                                                             |
| ------------------ | ---------------------------- | ----------------------------------------------------------------------------------- |
| **Confident**      | Assured, not arrogant        | "Premium tech, affordable." vs. "Our products are OK, maybe."                       |
| **Clear**          | Direct, jargon-minimal       | "Fast shipping to any Ghana address" vs. "Logistics optimization across the nation" |
| **Helpful**        | Supportive, solution-focused | "Need help? Contact our team." vs. "We have a support system."                      |
| **Local**          | Relevant, culturally aware   | "Add 150 Cedis delivery to Accra" vs. "International courier rates apply"           |
| **Proof-Oriented** | Specific, measurable         | "4.8★ from 2,340 verified buyers" vs. "Loved by customers"                          |

### Writing Guidelines

#### Product Descriptions

```
❌ Bad: "iPhone is a smartphone with features"
✅ Good: "iPhone 14 Pro. Stunning 6.1″ display, pro camera system, all-day battery. Free delivery to Accra."
```

#### CTAs

```
❌ Vague: "Click Here"
✅ Specific: "Shop iPhones" / "Add to Cart" / "Continue to Checkout"
```

#### Error Messages

```
❌ Technical: "Form validation failed"
✅ Clear: "Phone number must be 10 digits (e.g., 0246123456)"
```

#### Empty States

```
❌ Sad: "No products found"
✅ Helpful: "No results for 'gaming headphones'. Try searching 'wireless headphones' or browse our full collection."
```

---

## Best Practices

### DO

- ✅ **Test in Light & Dark Modes**: Every color choice, every component
- ✅ **Prioritize Performance**: Images, animations, bundle size
- ✅ **Use CSS Variables**: Centralized theming in `src/index.css`
- ✅ **Respect Accessibility Standards**: Contrast, focus, semantic HTML
- ✅ **Follow Responsive-First Approach**: Mobile first, then enhance for larger screens
- ✅ **Leverage Tailwind Classes**: Consistent, predictable styling
- ✅ **Test Keyboard Navigation**: Tab through every page
- ✅ **Validate Form Inputs**: Client-side + server-side validation
- ✅ **Document Changes**: Update this guide as design evolves

### DON'T

- ❌ **Don't Ignore Accessibility**: WCAG AA is non-negotiable
- ❌ **Don't Use Generic Colors**: Use CSS variable names, not hex codes
- ❌ **Don't Over-Animate**: Motion should enhance, not distract
- ❌ **Don't Skip Image Optimization**: Unoptimized images slow pages drastically
- ❌ **Don't Hardcode Spacing**: Use Tailwind scale (gap-4, p-6, etc.)
- ❌ **Don't Mix Font Families**: Stick to Sora (UI) and JetBrains Mono (code)
- ❌ **Don't Assume Colors Convey Info**: Always pair with icons or text
- ❌ **Don't Forget Mobile**: Design mobile-first, test on real devices

### File Organization

```
src/
├─ index.css          # Global styles, color system, patterns
├─ components/
│  ├─ ui/             # Reusable UI components (Button, Card, Input)
│  ├─ layout/         # Page layout (Header, Footer, Navigation)
│  ├─ products/       # Product-specific (ProductCard, ProductGallery)
│  └─ ...
├─ context/           # Theme context (ThemeContext.tsx)
├─ lib/               # Utilities (format.ts, validations/)
└─ types/             # TypeScript types
```

### Performance Optimization Checklist

- [ ] Images use Next.js `<Image>` component
- [ ] Hero images optimized (WebP, < 500KB)
- [ ] Fonts loaded via `next/font` (self-hosted, subsetted)
- [ ] Motion respects `prefers-reduced-motion`
- [ ] Unused CSS removed (Tailwind purges automatically)
- [ ] Critical paths loaded first (LCP, FID, CLS)
- [ ] Lighthouse score ≥ 90

### Testing Accessibility

1. **Keyboard Navigation**: Tab through entire page, all interactive elements reachable
2. **Screen Reader**: NVDA (Windows) or VoiceOver (Mac/iOS) testing
3. **Contrast Checker**: WebAIM or Chrome DevTools (Lighthouse Accessibility audit)
4. **Color Blindness**: Simulate via DevTools or tools like Coblis
5. **Reduced Motion**: Enable in OS settings, verify animations respect preference
6. **Zoom**: Test at 200% zoom on smaller screens

---

## Resources

### Internal Documentation

- [README.md](../README.md) — Project overview
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first styling
- [Framer Motion](https://www.framer.com/motion/) — Animation library
- [Lucide Icons](https://lucide.dev/) — Icon set

### External References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Content Accessibility Guidelines](https://www.w3.org/WAI/fundamentals/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)
- [Material Design 3](https://m3.material.io/)
- [oklch Color Space](https://oklch.com/)

### Tools

- **Color Contrast**: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- **Accessibility Audit**: Chrome DevTools → Lighthouse → Accessibility
- **Responsive Design**: Chrome DevTools → Device Toolbar
- **Font Pairing**: [Google Fonts](https://fonts.google.com/)
- **Icon Search**: [Lucide React Icons](https://lucide.dev/)

---

## Changelog

| Version | Date           | Changes                       |
| ------- | -------------- | ----------------------------- |
| 1.0     | April 18, 2026 | Initial design guide creation |

---

## Questions or Updates?

For design system questions or to propose updates:

1. Check this guide first
2. Consult the codebase (`src/index.css`, component examples)
3. Open an issue or contact the design team

**Last Reviewed**: April 18, 2026
