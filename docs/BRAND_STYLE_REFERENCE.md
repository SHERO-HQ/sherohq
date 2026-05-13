# SheroTech Brand Style Reference

**Quick lookup for design decisions and code patterns**

---

## Color Palette at a Glance

### Primary

- **Emerald**: `bg-emerald-500` (Light: `oklch(0.5737 0.1385 156.05)` / Dark: `oklch(0.66 0.12 156.05)`)
- **Usage**: CTAs, active states, focus rings, accents

### Neutrals

| Context        | Light                             | Dark                              |
| -------------- | --------------------------------- | --------------------------------- |
| **Background** | `oklch(1 0 0)` white              | `oklch(0.08 0.02 240)` blue-black |
| **Foreground** | `oklch(0.12 0.02 240)` deep slate | `oklch(0.98 0 0)` off-white       |
| **Border**     | `oklch(0.92 0 0)` light gray      | `oklch(0.25 0.02 240)` dark slate |
| **Card**       | `oklch(1 0 0)` white              | `oklch(0.12 0.02 240)` elevated   |

### Semantics

- **Error/Destructive**: Red `#ef4444`
- **Success**: Emerald (primary)
- **Warning**: Amber `#f59e0b`
- **Info**: Blue `#3b82f6`

---

## Typography Essentials

| Level         | Class                   | Size | Weight | When                |
| ------------- | ----------------------- | ---- | ------ | ------------------- |
| Hero Title    | `text-7xl font-black`   | 48px | 900    | Product names       |
| Section Title | `text-4xl font-bold`    | 30px | 700    | Major headings      |
| Sub-Heading   | `text-2xl font-semibold`| 20px | 600    | Component titles    |
| Body          | `text-base font-normal` | 15px | 400    | Main content        |
| Label         | `text-xs font-semibold` | 11px | 600    | Badges, form labels |

**Fonts**: Sora Variable (UI) | JetBrains Mono Variable (code)  
**Base**: 15px

---

## Spacing & Sizing Quick Reference

| Tailwind        | Pixels | Use Case                |
| --------------- | ------ | ----------------------- |
| `gap-2` `p-2`   | 8px    | Default element spacing |
| `gap-4` `p-4`   | 16px   | Component padding       |
| `gap-6` `p-6`   | 24px   | Card padding            |
| `gap-8` `p-8`   | 32px   | Section separation      |
| `gap-12` `p-12` | 48px   | Major layout gaps       |

**Border Radius**: `rounded` = 6px (default), `rounded` = 8px, `rounded` = 16px

**Breakpoints**: `sm` 640px | `md` 768px | `lg` 1024px | `xl` 1280px

---

## Component Patterns

### Primary Button

```jsx
<button className="px-8 py-3 bg-brand-secondary-600 hover:bg-brand-secondary-700 text-white rounded font-semibold transition duration-300 shadow shadow-brand-secondary-500/25 hover:scale-[1.02] active:scale-95">
  Details
</button>
```

### Secondary Button

```jsx
<button className="px-8 py-3 bg-slate-100 dark:bg-slate-900/50 hover:bg-brand-secondary-600 hover:text-white text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded transition duration-300 active:scale-95">
  Learn More
</button>
```

### Card

```jsx
<div className="bg-card border border-border rounded p-6 shadow-sm hover:shadow-md transition-shadow">
  {/* content */}
</div>
```

### Badge

```jsx
<span className="inline-block px-2.5 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">
  In Stock
</span>
```

### Input Field

```jsx
<input
  type="text"
  placeholder="Search products..."
  className="px-4 py-2.5 bg-input border border-input rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground"
/>
```

### Form Group

```jsx
<div className="flex flex-col">
  <label className="text-sm font-medium text-foreground mb-2">
    Email Address
  </label>
  <input
    type="email"
    className="px-4 py-2.5 bg-input border border-input rounded focus:ring-2 focus:ring-emerald-500"
  />
</div>
```

### Modal/Dialog

```jsx
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
  <div className="bg-card rounded shadow p-6 max-w-md mx-4">
    {/* content */}
  </div>
</div>
```

### Navigation Link (Active)

```jsx
<a
  href="/shop"
  className="text-foreground border-b-2 border-emerald-500 pb-1 font-semibold"
>
  Shop
</a>
```

---

## Animation Snippets

### Fade + Scale (Modal/Card Entry)

```jsx
import { motion } from "motion/react";

<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.3, type: "spring", damping: 20 }}
>
  Content
</motion.div>;
```

### Slide Up + Fade (List Item Entry)

```jsx
<motion.div
  initial={{ y: 20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ delay: 0.2, duration: 0.4 }}
>
  Item
</motion.div>
```

### Hover Scale (Interactive Card)

```jsx
<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
  Click me
</motion.div>
```

---

## Dark Mode Usage

Always test components in both light and dark modes:

```jsx
<div className="bg-background text-foreground border border-border rounded p-6">
  {/* Automatically adapts to light/dark */}
</div>
```

**CSS Variables Handle Switching:**

- Light mode: standard colors
- Dark mode: automatic via `.dark` class on `<html>`
- Toggle: `useTheme()` hook updates DOM

---

## Accessibility Checklist

- [ ] Minimum contrast: 4.5:1 for text
- [ ] Focus ring visible on all interactive elements
- [ ] All buttons/links keyboard navigable
- [ ] Form inputs have associated labels
- [ ] Images have descriptive alt text
- [ ] Icons with no text have `aria-label`
- [ ] Decorative icons have `aria-hidden="true"`
- [ ] Test with keyboard only (Tab, Enter, Escape)
- [ ] Verify with screen reader (VoiceOver, NVDA)

---

## Image Optimization

### Next.js Image Component

```jsx
import Image from "next/image";

<Image
  src={imageUrl}
  alt="Product name"
  width={400}
  height={400}
  className="object-cover"
  priority // Only for LCP image
/>;
```

### Product Image Requirements

- Format: WebP (with JPEG fallback)
- Resolution: 1200px minimum on longest edge
- Aspect Ratio: Square (1:1) for grids, 16:9 for hero
- File Size: < 500KB for hero, < 300KB for cards

---

## Responsive Design Approach

**Mobile-First Development:**

1. Design and code for mobile first
2. Add `md:` and `lg:` classes for larger screens
3. Test on real devices, not just breakpoints

### Common Responsive Patterns

```jsx
// Grid: 1 col mobile, 2 cols tablet, 3 cols desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Text size
<h1 className="text-3xl md:text-4xl lg:text-7xl font-black">

// Padding
<div className="p-4 md:p-6 lg:p-8">

// Visibility toggle
<div className="hidden lg:block"> {/* Desktop only */}
<div className="lg:hidden"> {/* Mobile/tablet only */}
```

---

## Common Mistakes to Avoid

| ❌ Don't                        | ✅ Do                                          |
| ------------------------------- | ---------------------------------------------- |
| Use hardcoded hex colors        | Use CSS variables (`var(--primary)`)           |
| Ignore `prefers-reduced-motion` | Respect motion preferences                     |
| Create new color variants       | Use existing palette (emerald, slate, etc.)    |
| Skip alt text on images         | Write descriptive alt text                     |
| Overlay text without scrim      | Always use dark overlay on image backgrounds   |
| Animate everything              | Use motion purposefully for guidance           |
| Forget mobile viewport          | Design mobile-first, test on devices           |
| Ignore focus states             | Visible focus ring on all interactive elements |

---

## File Locations

| Resource          | Path                                     |
| ----------------- | ---------------------------------------- |
| Color System      | `src/index.css`                          |
| Theme Context     | `src/context/ThemeContext.tsx`           |
| UI Components     | `src/components/ui/`                     |
| Layout Components | `src/components/layout/`                 |
| Global Styles     | `src/index.css`                          |
| Tailwind Config   | Embedded in `src/index.css` via `@theme` |

---

## Useful Commands

```bash
# Check Lighthouse score (accessibility, performance)
npm run build && npm run start
# Then: Chrome DevTools → Lighthouse → Audit

# Run tests
yarn test

# Check TypeScript errors
yarn tsc --noEmit

# Format code
yarn format

# Lint styles
yarn lint
```

---

## Quick Decisions

### "What color should I use for..."

| Component          | Color                        | Tailwind                              |
| ------------------ | ---------------------------- | ------------------------------------- |
| Primary CTA        | Emerald                      | `bg-emerald-500 hover:bg-emerald-400` |
| Secondary Button   | Slate                        | `bg-slate-100 dark:bg-slate-900`      |
| Destructive Button | Red                          | `bg-red-500 hover:bg-red-600`         |
| Disabled State     | Gray + 50% opacity           | `opacity-50 cursor-not-allowed`       |
| Success Badge      | Emerald                      | `bg-emerald-100 text-emerald-700`     |
| Error Message      | Red                          | `text-red-600 dark:text-red-400`      |
| Border             | Light Gray                   | `border-border`                       |
| Background         | White (light) / Slate (dark) | `bg-background`                       |

### "What size should this be..."

| Element                    | Size     | Tailwind             |
| -------------------------- | -------- | -------------------- |
| Button Padding (Primary)   | Medium   | `px-8 py-3`          |
| Button Padding (Secondary) | Small    | `px-6 py-2`          |
| Card Padding               | Standard | `p-6`                |
| Component Gap              | Standard | `gap-6`              |
| Section Padding            | Large    | `p-8`                |
| Border Radius              | Default  | `rounded` (6px)      |
| Icon                       | Standard | `size-5` or `size-6` |

### "What animation should I use..."

| Scenario           | Pattern         | Duration     |
| ------------------ | --------------- | ------------ |
| Modal open         | Scale + fade    | 300ms        |
| List item entry    | Slide up + fade | 400ms        |
| Hover feedback     | Scale 1.02x     | 150ms        |
| Page transition    | Fade            | 600ms        |
| Auto-play carousel | Continuous      | 8s per slide |

---

## Resources & Links

- [Full Design Guide](./DESIGN_GUIDE.md)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Lucide Icons](https://lucide.dev/)
- [oklch Color Picker](https://oklch.com/)

---

**Version**: 1.0 | **Updated**: April 18, 2026
