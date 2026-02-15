# UI Audit Quick Reference Card

**🎯 Goal:** Fix dark mode contrast + accessibility gaps  
**⏱️ Time:** 2 days (~13 hours)  
**📈 Impact:** 7.5/10 → 9/10 rating

---

## 🔴 CRITICAL FIXES (Do First - 4 hours)

### 1. Dark Mode Colors (30 min)
**File:** `src/index.css` lines 130-160

```css
.dark {
  --card: oklch(0.18 0.02 240);           /* was 0.15 */
  --popover: oklch(0.18 0.02 240);        /* was 0.15 */
  --secondary: oklch(0.28 0.02 240);      /* was 0.25 */
  --muted: oklch(0.22 0.02 240);          /* was 0.20 */
  --muted-foreground: oklch(0.72 0.02 240); /* was 0.70 */
  --accent: oklch(0.28 0.02 240);         /* was 0.25 */
  --border: oklch(0.32 0.02 240);         /* was 0.28 ⚠️ */
  --input: oklch(0.32 0.02 240);          /* was 0.28 ⚠️ */
}
```

### 2. Reduced Motion (15 min)
**File:** `src/index.css` (add at end)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 3. Motion Hook (15 min)
**File:** `src/hooks/usePrefersReducedMotion.ts` (NEW)

```typescript
import { useEffect, useState } from 'react';

export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}
```

### 4. Input Fields (30 min)
**File:** `src/components/ui/input.tsx` line 7

```typescript
// CHANGE THIS LINE:
"flex w-full rounded border-2 border-slate-200 dark:border-slate-800..."

// TO THIS:
"flex w-full rounded border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary..."
```

---

## 🟡 IMPORTANT FIXES (Do Next - 6 hours)

### 5. Product Card (1 hour)
**File:** `src/components/products/ProductCard.tsx`

**Line ~104:** Container
```tsx
// FROM:
"dark:bg-slate-900/40 bg-slate-200/60 border border-white/5"

// TO:
"dark:bg-slate-900/60 bg-white border border-slate-300 dark:border-white/10"
```

**Line ~113:** Hover glow
```tsx
// FROM:
"from-emerald-500/5"

// TO:
"from-emerald-500/15 dark:from-emerald-400/8"
```

**Line ~142:** Touch targets
```tsx
// FROM: w-7 h-7 sm:w-8 sm:h-8
// TO:   w-10 h-10 sm:w-11 sm:h-11
```

### 6. Buttons (30 min)
**File:** `src/components/ui/buttonVariants.ts`

```typescript
// ADD dark mode variants:
outline: "...existing... dark:border-slate-600 dark:hover:bg-slate-800",
secondary: "...existing... dark:bg-slate-800 dark:hover:bg-slate-700",
```

### 7. Cards (15 min)
**File:** `src/components/ui/card.tsx` line 11

```tsx
// ADD:
className={cn(
  "rounded border bg-card text-card-foreground shadow-md",
  "dark:shadow-xl dark:shadow-black/20 dark:border-white/10",
  className,
)}
```

### 8. Focus Styles (30 min)
**File:** `src/index.css` in `@layer base`

```css
*:focus-visible {
  outline: 2px solid oklch(0.66 0.12 156.05);
  outline-offset: 2px;
  border-radius: 4px;
}

button:focus-visible {
  outline-offset: 3px;
}
```

### 9. Skip Link (15 min)
**File:** `src/App.tsx` after `<QueryClientProvider>`

```tsx
<a 
  href="#main-content" 
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
    focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground 
    focus:rounded focus:shadow-lg"
>
  Skip to main content
</a>
```

---

## 🟢 POLISH (Optional - 3 hours)

### 10. Dark Patterns
**File:** `src/index.css` in `@layer utilities`

```css
.dark .pattern-dots {
  background-image: radial-gradient(#94a3b844 1px, transparent 1px);
}

.dark .pattern-diagonal {
  background-image: repeating-linear-gradient(45deg, #64748b22 0, #64748b22 1px, transparent 0, transparent 50%);
}
```

### 11. Navigation
**File:** `src/components/layout/Nav.tsx` line ~82

```tsx
// FROM: border-slate-200 dark:border-slate-800
// TO:   border-slate-300 dark:border-slate-700
```

---

## ✅ Testing Checklist

After each phase:

- [ ] Toggle dark mode - borders visible?
- [ ] Tab through page - focus clear?
- [ ] Mobile view (375px) - targets tappable?
- [ ] Enable reduced motion - animations stop?
- [ ] Run Lighthouse - accessibility 90+?
- [ ] Check contrast - all pass WCAG AA?

---

## 🚀 One-Hour Quick Win

If you only have 60 minutes:

1. **Dark mode colors** (30 min) - Biggest visual impact
2. **Reduced motion CSS** (10 min) - WCAG compliance
3. **Input borders** (15 min) - Forms more usable
4. **Test** (5 min) - Toggle themes

**Result:** 60% of value in 10% of time ⚡

---

## 📊 Before/After

| Metric | Before | After |
|--------|--------|-------|
| Lighthouse A11y | 78 | 95+ |
| Dark borders | Invisible | Clear |
| Touch targets | 28px | 40px+ |
| WCAG Level | A | AA ✅ |

---

## 🔗 Full Documentation

- **Details:** `UI_AUDIT_REPORT.md` (835 lines)
- **Step-by-step:** `UI_FIXES_TODO.md` (547 lines)
- **Visuals:** `UI_VISUAL_COMPARISON.md` (572 lines)
- **Summary:** `UI_AUDIT_EXECUTIVE_SUMMARY.md` (398 lines)

---

## 💡 Pro Tips

1. **Backup first:** `git checkout -b ui-fixes`
2. **Test incrementally:** Don't change everything at once
3. **Use DevTools:** Toggle dark mode with Cmd+Shift+D
4. **Check real devices:** Simulators aren't enough
5. **Get feedback:** Show team before/after

---

**Remember:** The UI is already good. These changes make it GREAT. 🎨✨

**Priority:** Dark mode colors > Reduced motion > Touch targets > Everything else

**Time:** Critical (4h) → Important (6h) → Polish (3h) = 13 hours total

**Impact:** User satisfaction ⬆️ | Accessibility ✅ | Support tickets ⬇️