# SheroTech — Comprehensive Project Review

> **Reviewed**: July 21, 2026  
> **Reviewer**: Antigravity  
> **Scope**: Brand Documentation · Codebase · UI

---

## Table of Contents

1. [Brand Documentation](#1-brand-documentation)
2. [Codebase](#2-codebase)
3. [UI](#3-ui)
4. [Overall Grades](#4-overall-grades)
5. [Issues & Priorities](#5-issues--priorities)
6. [Recommendations](#6-recommendations)

---

## 1. Brand Documentation

### ✅ Strengths

The four-doc system is **exceptionally thorough** for a project of this size:

| Document | Purpose | Grade |
|----------|---------|-------|
| [`DESIGN_GUIDE.md`](./DESIGN_GUIDE.md) | Strategic & philosophical reference (898 lines) | A+ |
| [`BRAND_STYLE_REFERENCE.md`](./BRAND_STYLE_REFERENCE.md) | Quick developer lookup (368 lines) | A+ |
| [`COMPONENT_IMPLEMENTATION_GUIDE.md`](./COMPONENT_IMPLEMENTATION_GUIDE.md) | Code-level patterns (21KB) | A |
| [`README.md`](./README.md) | Navigation & overview | A+ |

**Brand Philosophy** is clearly articulated — *"Premium tech retail for the Ghanaian market"*, benchmarked against Apple, HP, Dell, and Lenovo.

The **"Signal vs. Noise"** principle is the strongest design constraint: every UI element must facilitate a user goal or build brand authority. If a component doesn't provide "Signal," it's considered "Noise" and removed.

**Color System** is sophisticated, using the oklch color space:

| Token | Value | Meaning |
|-------|-------|---------|
| `--brand-primary` | `#043284` | Navy Blue (logo) |
| `--brand-secondary` | `#05735A` | Forest Green |
| `--primary` (CSS token) | `var(--brand-primary-700)` | Navy Blue (UI primary) |
| Emerald | `oklch(0.5737 0.1385 156.05)` | Active/success states |

**Typography** is well-documented:
- **Sora Variable** — UI, headings, body
- **JetBrains Mono Variable** — code, prices, SKUs, data
- **AubetteArchiType** — logo wordmark only
- Base font size: **15px** (deliberate premium choice, not browser default 16px)

**Accessibility** targets **WCAG 2.1 Level AA** with specific contrast ratios and focus indicator specs documented.

---

### ⚠️ Brand Doc Issues

> [!IMPORTANT]
> **Color naming mismatch**: The `DESIGN_GUIDE` and `BRAND_STYLE_REFERENCE` refer to Emerald as "the primary color," but in `src/index.css`, the `--primary` CSS token maps to **navy blue** (`--brand-primary-700: #043284`). This semantic gap will trip up developers. The dual-primary system (navy = authority, emerald = growth) works visually — but needs to be explicitly documented.

| Issue | Severity |
|-------|---------|
| Docs version is 1.0, April 18, 2026 — never updated since initial creation | Medium |
| `UI_UX_AUDIT_TASKLIST.md` appears empty (0 bytes shown in listing) | Medium |
| `HUBTEL_UAT_FLOW.md` and `hubtel_uat_deliverables.md` are not linked from `README.md` | Low |
| `README.md` references `ThemeContext.tsx` — may be a stale reference if the hook pattern has changed | Low |

---

## 2. Codebase

### Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 16.2.4 (App Router) | Very current |
| Language | TypeScript 5.9 | Strict mode |
| Styling | TailwindCSS v4 | Cutting-edge (`@import "tailwindcss"`) |
| Animation | Framer Motion (`motion/react`) | Physics-based springs |
| Database | PostgreSQL via `pg` | Raw SQL, no ORM |
| Auth | Custom session-based | Not NextAuth/Clerk |
| Payments | Hubtel | Ghanaian payment gateway |
| Email | Resend + Nodemailer | Dual email providers |
| Notifications | WhatsApp Business API | Facebook Graph API |
| Storage | Supabase | Image/file uploads |
| Caching | Upstash Redis | Rate limiting |
| Testing | Vitest (unit) + Playwright (e2e) | Both present |
| Package Manager | Yarn 4 (Berry) | |

### Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/           # Public page routes
│   ├── admin/              # Admin panel routes
│   └── api/                # 25 REST API routes
│       ├── orders/         # Order management
│       ├── payments/       # Hubtel payment flow
│       ├── products/       # Product catalog
│       ├── auth/           # Auth endpoints
│       ├── webhooks/       # Payment webhooks
│       └── ...
├── components/             # 16 feature directories
│   ├── landing/            # LandingHero, LandingPillars, LandingProducts, etc.
│   ├── layout/             # NavigationBar, Footer, SearchBar, BottomNav
│   ├── checkout/           # CheckoutFlow (multi-step)
│   ├── admin/              # Admin dashboard components
│   ├── auth/               # Login/Register forms
│   ├── ui/                 # shadcn/Radix primitives
│   ├── motion/             # Reusable animation wrappers
│   └── common/             # Shared utilities (AppImage, NavLink, etc.)
├── views/                  # Page-level thin wrappers
├── lib/                    # Core server utilities
│   ├── db.ts               # PostgreSQL client
│   ├── auth.ts             # Session auth
│   ├── hubtel.ts           # Payment gateway
│   ├── notifications.ts    # Multi-channel notification system
│   ├── newsletter-campaigns.ts  # Email campaigns
│   └── whatsapp-*.ts       # WhatsApp automation
├── services/               # Client-side API layer
├── context/                # React contexts (Cart, Auth, Theme)
├── hooks/                  # Custom React hooks
└── types/                  # TypeScript definitions
```

---

### ✅ Codebase Strengths

#### 1. Performance Engineering
- Hero animations are GPU-accelerated (`will-change-transform`)
- `requestAnimationFrame` throttling on mouse-move handlers — zero jank
- `dynamic()` imports for all below-the-fold sections (code splitting)
- `"use client"` boundaries placed precisely — server components where possible
- `next/font` for zero-CLS font loading

#### 2. Accessibility — Genuinely Impressive
- Skip-to-content link in root layout
- Focus trap with Tab key wrapping in mobile drawer nav
- Escape key closes all modal/overlay layers
- `aria-expanded`, `aria-controls`, `role="menu"`, `aria-label` consistently applied
- `useReducedMotion()` hook consumed in every animated component
- Programmatic focus management on menu open/close

#### 3. Complex Interactive UI
- **`LandingHero.tsx`** — macOS-style floating windows, physics spring animations, mouse parallax, dock with hover magnification
- **`NavigationBar.tsx`** — Spring-animated active indicator, scroll-aware glass surface, full keyboard nav, mobile drawer with focus management
- **`CheckoutFlow.tsx`** — Multi-step checkout (cart → delivery → payment) with Hubtel integration
- **`LandingPillars.tsx`** — Live animated mini-widgets: provisioning terminal, POS mockup, SLA monitor

#### 4. Notification System
- WhatsApp automation: `whatsapp-messages.ts` + `whatsapp-retry.ts` + `whatsapp-support.ts`
- Newsletter campaigns: `newsletter-campaigns.ts` (28.8KB — very comprehensive)
- All order/payment events trigger multi-channel alerts (WhatsApp + email)

#### 5. Business Logic
- `ORDER_STATUSES` Set for type-safe status management
- `normalizePaymentMethod()` for payment data consistency
- `hashOrderAccessToken()` for secure order lookup by non-authenticated users
- Rate limiting on sensitive endpoints (Upstash Redis)
- PDF invoice generation
- Activity logging (`logActivity`)

---

### ⚠️ Codebase Issues

#### 🔴 High Priority

**`HatGlasses` icon does not exist in lucide-react**

```tsx
// src/components/feedback/FeedbackForm.tsx — Line 19
import {
  HatGlasses  // ← This icon does not exist. Will error at runtime.
} from "lucide-react";
```

Check if this should be `Glasses`, `GlassesOff`, or a custom icon from `@/assets/icons/icons`.

---

**Admin components use hardcoded dark colors**

```tsx
// src/components/admin/invoice/InvoiceCustomerCard.tsx — Line 35
<Card className="bg-slate-900 border border-white/5 p-6 ...">
  <h3 className="text-lg font-bold text-white">Customer Information</h3>
```

The entire admin section appears to be hardcoded to dark mode rather than using the CSS variable system (`bg-card`, `text-foreground`). This breaks light mode and goes against the design system.

---

#### 🟡 Medium Priority

**Very large files — maintenance risk**

| File | Size | Issue |
|------|------|-------|
| `CheckoutFlow.tsx` | 1169 lines | Needs splitting into `CartStep`, `DeliveryStep`, `PaymentStep` |
| `notifications.ts` | ~32KB | Catch-all — split by notification type |
| `newsletter-campaigns.ts` | ~29KB | Split into campaign modules |
| `LandingHero.tsx` | 741 lines | Extract `HeroWindow`, `HeroDock` components |
| `NavigationBar.tsx` | 757 lines | Extract `MobileDrawer`, `UserMenu` components |

---

**About page has commented-out sections**

```tsx
// src/views/About.tsx
const About = () => {
 return (
 <>
 {/* <AboutHero /> */}      ← commented out
 <AboutStory />
 {/* <LandingStats /> */}   ← commented out
 <AboutValues />
 <AboutTestimonials />
 {/* <AboutTeam /> */}      ← commented out
 </>
 );
};
```

The page is missing its hero section and team section. Either finish them or remove the dead code.

---

**Raw SQL without ORM**

The codebase uses raw `pg` queries across 25 API routes. The orders route does this correctly with parameterized queries, but this approach requires discipline at scale. Consider `Drizzle ORM` or `Kysely` for type-safe queries without the overhead of a heavy ORM.

---

#### 🟢 Low Priority

| Issue | File |
|-------|------|
| Dev server warns about conflicting lockfiles (pnpm at user root vs yarn in project) — add `outputFileTracingRoot` to `next.config.ts` | `next.config.ts` |
| `About.tsx` uses single-space indentation inconsistent with the rest of the codebase | `src/views/About.tsx` |
| `lib/auth.ts` is only 1.4KB — suspiciously thin for a full auth system | `src/lib/auth.ts` |

---

## 3. UI

### Navigation

| Area | Assessment |
|------|-----------|
| Desktop nav | Glassmorphic top bar, spring-animated emerald active indicator, cart/wishlist badge counts. Professional. |
| Mobile nav | Left slide-in drawer (65% width), social links in footer, search bar, full focus management. |
| Bottom nav | `BottomNav.tsx` present for mobile — good PWA pattern. |
| Scroll behavior | Transparent → glass surface transition on scroll. Clean. |

---

### Hero Section

**Headline**: *"Hardware, Software, and Managed IT Support for Your Business."*

```
[Left Column]                    [Right Column]
─────────────────────            ──────────────────────────────
Badge: "Trusted Tech Partner"    ╔══════════════════════════╗
                                 ║ hardware_catalog.dmg     ║ ← floating
H1: Hardware, Software,          ║ HP EliteBook 1040 ★4.9  ║   window 1
    and Managed IT Support       ║ GHS5,500  [-5%]  [+]   ║
    for Your Business.           ╚══════════════════════════╝
                                      ╔════════════════════╗
P: We supply premium hardware,        ║ smartboutique_pos  ║ ← floating
   engineer custom software...        ║ SmartBoutique POS  ║   window 2
                                      ║ v2.1               ║
[Products] [Explore →]                ╚════════════════════╝
                                 ╔════════════════════╗
                                 ║ active_sla_monitor  ║ ← floating
                                 ║ Managed IT SLA ●Live║   window 3
                                 ║ Uptime: 99.99%      ║
                                 ╚════════════════════╝
                                    [💻] [💎] [🖥] ← macOS Dock
```

The macOS desktop metaphor is **clever and purposeful** — it communicates "we do software, hardware, and IT support" visually without extra copy. Each window is interactive: click traffic lights to open/close, hover to bring to front, mouse parallax tracks cursor.

---

### Color Application in Practice

The dual-primary system is consistent and works well:

| Color | Use | Effect |
|-------|-----|--------|
| Navy `#043284` | Primary CTAs, headline gradient start | Authority, trust |
| Emerald `#10b981` | Active indicators, badges, success states | Growth, success |
| Slate neutrals | Backgrounds and body text | Clean, premium |
| Glassmorphism | Nav, hero cards, dock | Modern, layered |

---

### Dark Mode

| Implementation Detail | Status |
|----------------------|--------|
| `localStorage` persistence | ✅ |
| Flash-of-wrong-theme prevention (inline `<head>` script) | ✅ |
| Smooth `.theme-transitioning` class on `<html>` | ✅ |
| CSS variable switching (all public components) | ✅ |
| Admin panel (hardcoded dark, doesn't switch) | ❌ |

---

### Typography in Practice

- **Sora Variable** renders cleanly at all sizes — the `tracking-tighter` on the hero H1 is especially effective
- **JetBrains Mono** used correctly for prices (`GHS5,500`), version numbers, and terminal widgets
- **AubetteArchiType** logo font used in the mobile menu footer — subtle and premium
- Global `h1–h6 { font-weight: 600 !important }` override prevents accidental bold headings — deliberate "gentle" preset

---

### Forms

| Form | Pattern | Notes |
|------|---------|-------|
| `ContactForm` | 3-step (type → details → message), slide transitions | Clean UX |
| `FeedbackForm` | Star rating, anonymous toggle, photo upload | Feature-rich |
| `CheckoutFlow` | Multi-step: Cart, Delivery, Payment | Locally relevant (Momo, Card, COD, Store Pickup) |
| All forms | `react-hook-form` + `zod` | Correct pattern |

---

### Pillars / Features Section

Each pillar has a live animated mini-widget:
- **Hardware**: Provisioning terminal simulation (cycling through device setup steps)
- **Software**: POS dashboard mockup
- **Managed IT**: SLA monitor with live uptime display

This is a premium differentiator — most tech sites just show icons and bullet points.

---

## 4. Overall Grades

| Category | Grade | Notes |
|---------|-------|-------|
| Brand Documentation | **A+** | Comprehensive, well-structured, thorough |
| Architecture | **A** | Clean App Router structure, good separation |
| Accessibility | **A** | ARIA, keyboard nav, motion preferences — all excellent |
| Animation Quality | **A+** | Technically sophisticated, always purposeful |
| Performance Engineering | **A** | RAF throttling, dynamic imports, zero-CLS fonts |
| Local Market Fit | **A+** | Momo, WhatsApp, GHS, Ghanaian context throughout |
| Design Consistency | **B+** | Admin section drifts from design system |
| Code Maintainability | **B** | Several files are too large |

---

## 5. Issues & Priorities

| Priority | Issue | File | Line |
|---------|-------|------|------|
| 🔴 **High** | `HatGlasses` icon doesn't exist in lucide-react — runtime error | `FeedbackForm.tsx` | 19 |
| 🔴 **High** | Admin uses hardcoded dark colors, breaks light mode | `src/components/admin/` | — |
| 🟡 **Medium** | `CheckoutFlow.tsx` at 1169 lines — needs splitting | `checkout/CheckoutFlow.tsx` | — |
| 🟡 **Medium** | About page missing hero and team sections (commented out) | `src/views/About.tsx` | — |
| 🟡 **Medium** | `newsletter-campaigns.ts` at 29KB — split into modules | `src/lib/` | — |
| 🟡 **Medium** | Brand docs not updated since v1.0 (April 2026); Hubtel docs orphaned | `docs/` | — |
| 🟡 **Medium** | `--primary` CSS token is navy blue, but docs call emerald "primary" | `src/index.css` / `docs/` | — |
| 🟢 **Low** | Add `outputFileTracingRoot` to silence dev server lockfile warning | `next.config.ts` | — |
| 🟢 **Low** | `About.tsx` inconsistent single-space indentation | `src/views/About.tsx` | — |
| 🟢 **Low** | Consider Drizzle/Kysely ORM for type-safe SQL across 25 API routes | `src/app/api/` | — |

---

## 6. Recommendations

### Immediate (This Sprint)

1. **Fix `HatGlasses`** — Replace with `Glasses` or a custom icon. This is a runtime error.

2. **Fix admin theme** — Replace all hardcoded `bg-slate-900` / `text-white` / `border-white/5` in admin components with CSS variables (`bg-card`, `text-foreground`, `border-border`).

### Short Term

3. **Clarify color token docs** — Add a section to `DESIGN_GUIDE.md` explaining the dual-primary system: `--primary` = navy (UI buttons, links), emerald = active/success states. Remove the ambiguity.

4. **Resolve About page** — Either complete `<AboutHero />` and `<AboutTeam />` or remove them. The current page (only `<AboutStory />`, `<AboutValues />`, `<AboutTestimonials />`) may feel incomplete to visitors.

5. **Update brand docs** — Link `HUBTEL_UAT_FLOW.md` from the README. Bump version to 1.1 with a changelog entry.

### Medium Term

6. **Split large files**:
   - `CheckoutFlow.tsx` → `CartStep`, `DeliveryStep`, `PaymentStep` sub-components
   - `notifications.ts` → `order-notifications.ts`, `payment-notifications.ts`, etc.
   - `newsletter-campaigns.ts` → `campaign-templates.ts`, `campaign-engine.ts`

7. **Consider Drizzle ORM** — Type-safe queries, migration support, and zero runtime overhead. Replaces raw `pg` with minimal refactor.

---

> **Document Version**: 1.0  
> **Created**: July 21, 2026  
> **Status**: ✅ Active
