# UI Fixes - Implementation TODO

**Priority Order:** 🔴 Critical → 🟡 Important → 🟢 Nice to Have

---

## 🔴 CRITICAL FIXES (Do First)

### 1. Dark Mode Contrast Improvements

**File:** `src/index.css`

**Location:** Lines 130-160 (`.dark` section)

**Replace the entire `.dark` block with:**

```css
.dark {
  /* Premium Dark Mode: Deep Blue-Black Slate - IMPROVED CONTRAST */
  --background: oklch(0.12 0.02 240);
  --foreground: oklch(0.98 0 0);

  /* Cards: Better elevation from background */
  --card: oklch(0.18 0.02 240); /* Changed from 0.15 */
  --card-foreground: oklch(0.98 0 0);

  --popover: oklch(0.18 0.02 240); /* Changed from 0.15 */
  --popover-foreground: oklch(0.98 0 0);

  /* Primary: Good contrast maintained */
  --primary: oklch(0.66 0.12 156.05);
  --primary-foreground: oklch(0.98 0 0);

  --secondary: oklch(0.28 0.02 240); /* Changed from 0.25 */
  --secondary-foreground: oklch(0.98 0 0);

  /* Muted: Better readability */
  --muted: oklch(0.22 0.02 240); /* Changed from 0.20 */
  --muted-foreground: oklch(0.72 0.02 240); /* Changed from 0.70 */

  --accent: oklch(0.28 0.02 240); /* Changed from 0.25 */
  --accent-foreground: oklch(0.98 0 0);

  --destructive: oklch(0.45 0.15 25);
  --destructive-foreground: oklch(0.98 0 0);

  /* Borders: More visible */
  --border: oklch(0.32 0.02 240); /* Changed from 0.28 */
  --input: oklch(0.32 0.02 240); /* Changed from 0.28 */
  --ring: oklch(0.66 0.12 156.05);
}
```

**Impact:** Fixes visibility issues across all dark mode UI elements

---

### 2. Reduced Motion Support

**File:** `src/index.css`

**Location:** Add at the end of the file (after `@layer utilities`)

```css
/* Accessibility: Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Impact:** Critical accessibility improvement for users with motion sensitivity

---

### 3. Create Reduced Motion Hook

**File:** `src/hooks/usePrefersReducedMotion.ts` (NEW FILE)

```typescript
import { useEffect, useState } from 'react';

export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}
```

**Impact:** Allows components to conditionally disable animations

---

### 4. Enhanced Dark Mode Patterns

**File:** `src/index.css`

**Location:** In `@layer utilities`, update pattern classes

```css
@layer utilities {
  /* ... existing custom-select ... */

  /* Premium Patterns - IMPROVED DARK MODE VISIBILITY */
  .pattern-grid-white {
    background-image: radial-gradient(circle, #e2e8f0 1px, transparent 1px);
    background-size: 24px 24px;
  }

  .dark .pattern-grid-white {
    background-image: radial-gradient(circle, #475569 1px, transparent 1px);
  }

  .pattern-grid-emerald {
    background-image: radial-gradient(circle, #10b98120 1px, transparent 1px);
    background-size: 24px 24px;
  }

  .dark .pattern-grid-emerald {
    background-image: radial-gradient(circle, #10b98130 1px, transparent 1px);
  }

  .pattern-dots {
    background-image: radial-gradient(#64748b33 1px, transparent 1px);
    background-size: 16px 16px;
  }

  .dark .pattern-dots {
    background-image: radial-gradient(#94a3b844 1px, transparent 1px);
  }

  .pattern-diagonal {
    background-image: repeating-linear-gradient(45deg, #64748b11 0, #64748b11 1px, transparent 0, transparent 50%);
    background-size: 10px 10px;
  }

  .dark .pattern-diagonal {
    background-image: repeating-linear-gradient(45deg, #64748b22 0, #64748b22 1px, transparent 0, transparent 50%);
  }

  .mask-radial-faded {
    mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
  }
}
```

---

## 🟡 IMPORTANT FIXES (Do Next)

### 5. Improved Input Field Styling

**File:** `src/components/ui/input.tsx`

**Location:** Line 6-7 (inputVariants cva)

**Replace the first line of inputVariants with:**

```typescript
const inputVariants = cva(
  "flex w-full rounded border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
  // ... rest stays the same
```

**Changes:**
- `border-slate-200` → `border-slate-300` (more visible in light mode)
- `dark:border-slate-800` → `dark:border-slate-700` (more visible in dark mode)
- `bg-secondary/5` → `bg-white dark:bg-slate-900/50` (better distinction)
- `ring-primary/20` → `ring-primary/30` (more prominent focus)
- Added `placeholder:text-slate-400 dark:placeholder:text-slate-500`

---

### 6. Enhanced Button Variants

**File:** `src/components/ui/buttonVariants.ts`

**Location:** Lines 7-26 (variant definitions)

**Update these variants:**

```typescript
outline:
  "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground dark:border-slate-600 dark:hover:bg-slate-800",

secondary:
  "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 dark:bg-slate-800 dark:hover:bg-slate-700",
```

---

### 7. Product Card Improvements

**File:** `src/components/products/ProductCard.tsx`

**Location:** Line ~104 (main container className)

**Replace:**

```tsx
className="group relative rounded overflow-hidden
  dark:bg-slate-900/60 bg-white
  border border-slate-300 dark:border-white/10 shadow-md
  hover:border-emerald-500/50 dark:hover:border-emerald-400/40
  hover:shadow-2xl hover:shadow-emerald-500/20 dark:hover:shadow-emerald-400/10
  transition-all duration-500 cursor-pointer
  flex flex-col h-full"
```

**Changes:**
- `bg-slate-200/60` → `bg-white` (cleaner light mode)
- `dark:bg-slate-900/40` → `dark:bg-slate-900/60` (more solid)
- `border-white/5` → `border-slate-300 dark:border-white/10`
- Enhanced shadow colors

**Also update hover glow (around line 113):**

```tsx
<div className="absolute inset-0 opacity-0 group-hover:opacity-100 
  bg-gradient-to-b from-emerald-500/15 dark:from-emerald-400/8 to-transparent 
  transition-opacity duration-500 pointer-events-none" />
```

---

### 8. Card Component Enhancement

**File:** `src/components/ui/card.tsx`

**Location:** Line 10-14 (Card component className)

**Update to:**

```tsx
className={cn(
  "rounded border bg-card text-card-foreground shadow-md",
  "dark:shadow-xl dark:shadow-black/20 dark:border-white/10",
  className,
)}
```

**Changes:**
- `shadow` → `shadow-md` (more prominent)
- Added dark mode specific shadow and border

---

### 9. Navigation Border Enhancement

**File:** `src/components/layout/Nav.tsx`

**Location:** Around line 82 (nav className)

**Find this line:**
```tsx
"bg-background/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800"
```

**Replace with:**
```tsx
"bg-background/90 backdrop-blur-lg shadow-lg border-b border-slate-300 dark:border-slate-700"
```

---

### 10. Theme Toggle Button Enhancement

**File:** `src/components/layout/toggle-theme.tsx`

**Location:** Line 18-19 (Button className)

**Replace:**
```tsx
className="cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 
  rounded border border-slate-300 dark:border-slate-700 
  bg-slate-50 dark:bg-slate-800/80"
```

---

### 11. Mobile Touch Target Improvements

**File:** `src/components/products/ProductCard.tsx`

**Location:** Multiple places

**Find and replace these:**

1. **Wishlist button (line ~142):**
```tsx
className="absolute top-2 sm:top-3 right-2 sm:right-3 z-20 
  w-10 h-10 sm:w-11 sm:h-11 rounded
  bg-black/20 backdrop-blur-md border border-white/10
  flex items-center justify-center
  hover:bg-red-500 hover:border-red-400
  transition-all duration-300 group/heart cursor-pointer"
```

2. **Icon sizes:**
```tsx
<Heart className="w-4 h-4 sm:w-5 sm:h-5" />
```

3. **Badge text sizes (find all instances of text-[8px]):**
```tsx
className="px-2 py-1 text-[10px] sm:text-xs"
```

---

### 12. Admin Panel Pattern Opacity

**File:** `src/components/admin/AdminLayout.tsx`

**Location:** Line ~62 (pattern-dots div)

**Replace:**
```tsx
<div className="fixed inset-0 pattern-dots opacity-15 pointer-events-none z-0 print:hidden" />
```

**Also update footer (line ~96):**
```tsx
<footer className="py-6 px-4 md:px-8 border-t border-white/10 text-center text-slate-400 text-xs print:hidden">
```

---

## 🟢 NICE TO HAVE (Polish)

### 13. Global Focus Visible Styles

**File:** `src/index.css`

**Location:** In `@layer base`, after body styles

```css
@layer base {
  body {
    @apply bg-background text-foreground;
  }

  /* Enhanced focus indicators for accessibility */
  *:focus-visible {
    outline: 2px solid oklch(0.66 0.12 156.05);
    outline-offset: 2px;
    border-radius: 4px;
  }

  button:focus-visible,
  [role="button"]:focus-visible {
    outline-offset: 3px;
  }

  button,
  [role="button"] {
    cursor: pointer;
  }
}
```

---

### 14. Skip Link for Accessibility

**File:** `src/App.tsx`

**Location:** Add after `<QueryClientProvider>` and before `<ThemeProvider>`

```tsx
{/* Skip to main content link for accessibility */}
<a 
  href="#main-content" 
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
    focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground 
    focus:rounded focus:shadow-lg"
>
  Skip to main content
</a>
```

**Also add id to main content in AppRoutes or each page:**
```tsx
<main id="main-content">
```

---

### 15. Typography Enhancement Variables

**File:** `src/index.css`

**Location:** In `:root`, after font definitions

```css
:root {
  font-size: 15px;
  
  /* Fonts Registration */
  --font-primary: 'JetBrains Mono Variable', 'JetBrains Mono', 'monospace', 'system-ui';
  --font-inter: 'Inter Variable', 'Inter', 'system-ui', 'sans-serif';
  --font-sora: 'Sora Variable', sans-serif;
  --font-logo: 'AubetteArchiType', sans-serif;

  /* Typography Scale */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
  
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* ... rest of variables ... */
}
```

---

### 16. Shadow System Definition

**File:** `src/index.css`

**Location:** Add to `@theme inline` block

```css
@theme inline {
  /* ... existing radius and color variables ... */

  /* Shadow System */
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 2px 4px 0 rgb(0 0 0 / 0.06);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  
  --shadow-emerald: 0 10px 30px -5px rgb(16 185 129 / 0.2);
  --shadow-emerald-lg: 0 20px 40px -10px rgb(16 185 129 / 0.3);
}
```

---

## Testing Checklist

After implementing fixes, test:

- [ ] Switch between light/dark/system themes
- [ ] Check all pages in both themes
- [ ] Test with DevTools in mobile view (375px, 768px, 1024px)
- [ ] Tab through interactive elements with keyboard
- [ ] Test with browser zoom at 200%
- [ ] Enable "prefers-reduced-motion" in browser and verify
- [ ] Run Lighthouse accessibility audit
- [ ] Test on actual mobile device
- [ ] Verify focus indicators are visible
- [ ] Check color contrast with browser extensions (like Stark or axe)

---

## Automated Tools to Use

1. **Lighthouse** (Chrome DevTools)
   - Run on every page
   - Target: 90+ accessibility score

2. **axe DevTools** (Browser Extension)
   - Scan all pages
   - Fix all "Critical" and "Serious" issues

3. **WAVE** (Browser Extension)
   - Visual accessibility checker
   - Verify contrast ratios

4. **Color Contrast Analyzer**
   - Verify WCAG AA compliance
   - Test on representative components

---

## Implementation Order

**Day 1:** Critical fixes (#1-4)
- Dark mode contrast
- Reduced motion support
- Create hook

**Day 2:** Important fixes (#5-9)
- Input fields
- Buttons
- Product cards
- Cards
- Navigation

**Day 3:** Important fixes (#10-12) + Testing
- Theme toggle
- Touch targets
- Admin panel
- Run accessibility tests

**Day 4:** Nice to have (#13-16) + Final testing
- Focus styles
- Skip link
- Typography
- Shadow system
- Comprehensive testing

---

## Notes

- **Backup first:** Create a git branch before making changes
- **Test incrementally:** Don't change everything at once
- **Document:** Note any issues or edge cases discovered
- **Iterate:** Some values might need fine-tuning based on visual testing

---

## Success Metrics

- ✅ All automated accessibility tests pass (Lighthouse, axe)
- ✅ WCAG AA compliance for color contrast
- ✅ Smooth theme switching with no flashes
- ✅ Keyboard navigation works throughout
- ✅ Mobile touch targets meet 44×44px minimum
- ✅ Reduced motion preference respected
- ✅ No console errors or warnings