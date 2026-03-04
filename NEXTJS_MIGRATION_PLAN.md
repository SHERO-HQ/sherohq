# Next.js Migration Plan - SheroTech

**Target:** Migrate from Vite + React Router v7 to Next.js 15 (App Router)  
**Estimated Timeline:** 3-4 weeks  
**Strategy:** Incremental migration with minimal downtime

---

## Phase 1: Setup & Infrastructure (Week 1)

### 1.1 Initialize Next.js Project Structure

**Action Items:**

- [ ] Install Next.js alongside existing setup (parallel development)
  ```bash
  npx create-next-app@latest sherotech-next --typescript --tailwind --app --src-dir --import-alias "@/*"
  ```
- [ ] Copy configuration files:
  - `tsconfig.json` settings
  - Tailwind config (already on v4, compatible)
  - ESLint config
  - Environment variables from `.env`

**File Changes:**

- Create `next.config.ts` with:
  - Subdomain middleware support
  - Backend API proxy (rewrites)
  - Image optimization domains
  - Output configuration for Vercel

**Effort:** 1 day

---

### 1.2 Configure Backend API Integration

**Decision Point:** Keep Express backend separate or migrate?

**Recommended: Keep Separate (Phase 1)**

Create `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*", // Dev
      },
      {
        source: "/uploads/:path*",
        destination: "http://localhost:5000/uploads/:path*",
      },
    ];
  },
  env: {
    API_URL: process.env.API_URL || "http://localhost:5000",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.sherohq.com",
      },
    ],
  },
};

export default nextConfig;
```

**Production rewrites:** Use environment variable for production API URL

**Effort:** 1 day

---

### 1.3 Implement Subdomain Middleware

**Current Challenge:** `admin.sherohq.com` vs main site routing

Create `src/middleware.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const subdomain = getSubdomainFromHostname(hostname);

  // Admin subdomain routing
  if (subdomain === "admin") {
    // Rewrite to /admin routes
    const url = request.nextUrl.clone();

    // If not already on /admin path, rewrite it
    if (!url.pathname.startsWith("/admin")) {
      url.pathname = `/admin${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

function getSubdomainFromHostname(hostname: string): string | null {
  if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
    return null;
  }

  const parts = hostname.split(".");
  if (parts.length <= 2) return null;

  const subdomain = parts[0].toLowerCase();
  return subdomain === "www" ? null : subdomain;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**Effort:** 2 days (including testing)

---

## Phase 2: Routing Migration (Week 1-2)

### 2.1 Map Existing Routes to App Router Structure

**Current Routes (from AppRoutes.tsx):**

```
Public Routes:
├── / → Home
├── /about → About
├── /shop → Products
├── /shop/:id → ProductDetail
├── /solutions → Solutions
├── /consultation → Consultation
├── /contact → Contact
├── /checkout → Checkout
├── /checkout/success → CheckoutSuccess
├── /partners → Partners
├── /support → Support
├── /support/guides → SupportGuidesPage
├── /support/guides/:slug → SupportGuideDetail
├── /faq → FAQ
├── /terms → Terms
├── /privacy → Privacy
├── /cookies → Cookies
├── /login → Login
├── /signup → Signup
├── /profile → Profile
├── /verify-email → VerifyEmail

Admin Routes (subdomain or /admin):
├── /admin/login → AdminLogin
├── /admin/dashboard → AdminDashboard
├── /admin/products → AdminProducts
├── /admin/products/new → ProductForm
├── /admin/products/:id/edit → ProductForm
├── /admin/orders → AdminOrders
├── /admin/orders/:id → OrderDetails
├── /admin/support → AdminSupport
├── /admin/users → AdminUsers
├── /admin/user-management → AdminUserManagement
├── /admin/projects → AdminProjects
├── /admin/reports → AdminReports
├── /admin/profile → AdminProfile
├── /admin/categories → AdminCategories
├── /admin/reviews → AdminReviews
├── /admin/team → AdminTeam
├── /admin/testimonials → AdminTestimonials
├── /admin/stats → AdminStats
├── /admin/expenses → AdminExpenses
├── /admin/guides → AdminGuides
├── /admin/guides/:id/edit → AdminGuideEditor
```

**Next.js App Router Structure:**

```
app/
├── layout.tsx              # Root layout with providers
├── page.tsx                # Home (/)
├── about/
│   └── page.tsx
├── shop/
│   ├── page.tsx            # Products list
│   └── [id]/
│       └── page.tsx        # Product detail
├── solutions/
│   └── page.tsx
├── consultation/
│   └── page.tsx
├── contact/
│   └── page.tsx
├── checkout/
│   ├── page.tsx
│   └── success/
│       └── page.tsx
├── partners/
│   └── page.tsx
├── support/
│   ├── page.tsx
│   └── guides/
│       ├── page.tsx
│       └── [slug]/
│           └── page.tsx
├── faq/
│   └── page.tsx
├── terms/
│   └── page.tsx
├── privacy/
│   └── page.tsx
├── cookies/
│   └── page.tsx
├── login/
│   └── page.tsx
├── signup/
│   └── page.tsx
├── profile/
│   └── page.tsx
├── verify-email/
│   └── page.tsx
├── admin/
│   ├── layout.tsx          # Admin-specific layout
│   ├── login/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── products/
│   │   ├── page.tsx
│   │   ├── new/
│   │   │   └── page.tsx
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx
│   ├── orders/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── support/
│   │   └── page.tsx
│   ├── users/
│   │   └── page.tsx
│   ├── user-management/
│   │   └── page.tsx
│   ├── projects/
│   │   └── page.tsx
│   ├── reports/
│   │   └── page.tsx
│   ├── profile/
│   │   └── page.tsx
│   ├── categories/
│   │   └── page.tsx
│   ├── reviews/
│   │   └── page.tsx
│   ├── team/
│   │   └── page.tsx
│   ├── testimonials/
│   │   └── page.tsx
│   ├── stats/
│   │   └── page.tsx
│   ├── expenses/
│   │   └── page.tsx
│   └── guides/
│       ├── page.tsx
│       └── [id]/
│           └── edit/
│               └── page.tsx
└── not-found.tsx           # 404 page
```

**Effort:** 3-4 days (structure setup)

---

### 2.2 Create Root Layout with Providers

Create `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Sora } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: {
    default: "SheroTech - Technology Solutions",
    template: "%s | SheroTech",
  },
  description: "Professional technology solutions and services",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${sora.variable}`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

Create `src/components/providers.tsx` (client component):

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "@/context/Theme";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationProvider";
import { WishlistProvider } from "@/context/WishlistContext";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CartProvider>
          <AuthProvider>
            <NotificationProvider>
              <WishlistProvider>
                {children}
                <ReactQueryDevtools initialIsOpen={false} />
              </WishlistProvider>
            </NotificationProvider>
          </AuthProvider>
        </CartProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

**Effort:** 1 day

---

### 2.3 Migrate Page Components

**Strategy:** Start with static pages, then dynamic

**Priority Order:**

1. Static pages (About, Terms, Privacy, etc.) - **2 days**
2. Dynamic routes (Shop, Support guides) - **2 days**
3. Auth pages (Login, Signup, Profile) - **2 days**
4. Checkout flow - **2 days**
5. Admin pages - **3 days**

**Example Migration - Product Detail Page:**

Before (`src/pages/ProductDetail.tsx`):

```tsx
import { useParams } from "react-router-dom";

export default function ProductDetail() {
  const { id } = useParams();
  // ... component logic
}
```

After (`app/shop/[id]/page.tsx`):

```tsx
import { notFound } from "next/navigation";

export default function ProductDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  // ... component logic (same)
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  // Fetch product for SEO metadata
  return {
    title: `Product ${params.id}`,
    description: "...",
  };
}
```

**Effort:** 8-10 days total

---

## Phase 3: Component Migration (Week 2-3)

### 3.1 Navigation Component Updates

**Changes needed:**

- `<Link>` from `react-router-dom` → `next/link`
- `useNavigate()` → `useRouter()` from `next/navigation`
- `useLocation()` → `usePathname()` from `next/navigation`

**Example - Nav Component:**

Before:

```tsx
import { Link, useLocation } from "react-router-dom";

const Nav = () => {
  const location = useLocation();
  const isActive = location.pathname === "/about";

  return <Link to="/about">About</Link>;
};
```

After:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Nav = () => {
  const pathname = usePathname();
  const isActive = pathname === "/about";

  return <Link href="/about">About</Link>;
};
```

**Components to Update:**

- `src/components/layout/Nav.tsx`
- `src/components/common/ScrollToTop.tsx` (use `useEffect` with `pathname`)
- All breadcrumb components
- All internal links throughout the app

**Automation Opportunity:** Use find-replace with regex for bulk updates

**Effort:** 2-3 days

---

### 3.2 Mark Client Components

**Next.js App Router requirement:** Components using hooks, state, or event handlers need `'use client'` directive

**Components requiring 'use client':**

- All context providers (already marked)
- Forms (Login, Signup, Checkout, etc.)
- Interactive components (Cart, Wishlist, etc.)
- Admin tables with sorting/filtering
- Components using `useState`, `useEffect`, etc.

**Example:**

```tsx
"use client";

import { useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  // ... rest of component
}
```

**Effort:** 2 days (adding directives + testing)

---

### 3.3 Image Optimization

Replace `<img>` tags with Next.js `<Image>` component for automatic optimization

**Before:**

```tsx
<img src="/images/team/john.jpg" alt="John Doe" />
```

**After:**

```tsx
import Image from "next/image";

<Image src="/images/team/john.jpg" alt="John Doe" width={400} height={400} />;
```

**Effort:** 1-2 days

---

## Phase 4: Admin Section Migration (Week 3)

### 4.1 Protected Routes

Replace `ProtectedRoute` component with middleware or layout-based auth

**Option A: Layout-based protection (Recommended)**

Create `app/admin/layout.tsx`:

```tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AdminProvider } from "@/context/AdminContext";
import { BreadcrumbProvider } from "@/context/BreadcrumbContext";

async function getAdminUser() {
  const cookieStore = cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) return null;

  // Verify token with your backend
  try {
    const response = await fetch(`${process.env.API_URL}/api/admin/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <BreadcrumbProvider>
      <AdminProvider initialUser={user}>
        <div className="admin-layout">
          {/* Admin sidebar, header, etc. */}
          {children}
        </div>
      </AdminProvider>
    </BreadcrumbProvider>
  );
}
```

**Effort:** 2 days

---

### 4.2 Admin Pages Migration

**Lazy loading in Next.js:** Use `dynamic()` instead of `React.lazy()`

```tsx
import dynamic from "next/dynamic";

const AdminDashboard = dynamic(() => import("@/components/admin/Dashboard"), {
  loading: () => <LoadingSpinner />,
});
```

**All admin pages need:**

- `'use client'` directive (they're interactive)
- Updated imports (`Link`, `useRouter`)
- Admin layout structure

**Effort:** 3-4 days

---

## Phase 5: Data Fetching Patterns (Week 3-4)

### 5.1 Migrate TanStack Query Usage

**Current:** All data fetching is client-side with TanStack Query

**Options:**

**A) Keep TanStack Query (Simpler Migration)**

- Works fine in client components
- No changes to existing hooks
- Just wrap in `'use client'` directive

**B) Hybrid Approach (Better Performance)**

- Use Server Components for initial data fetch
- Use TanStack Query for mutations and client-side updates

**Example - Product List (Hybrid):**

```tsx
// app/shop/page.tsx (Server Component)
async function getProducts() {
  const response = await fetch(`${process.env.API_URL}/api/products`, {
    next: { revalidate: 60 }, // Cache for 60 seconds
  });
  return response.json();
}

export default async function ShopPage() {
  const initialProducts = await getProducts();

  return <ProductList initialData={initialProducts} />;
}
```

```tsx
// components/ProductList.tsx (Client Component)
"use client";

import { useQuery } from "@tanstack/react-query";

export function ProductList({ initialData }) {
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    initialData,
  });

  // ... render logic
}
```

**Recommendation:** Start with Option A, optimize to Option B later

**Effort:** 2-3 days

---

### 5.2 Environment Variables

**Next.js convention:** Prefix public variables with `NEXT_PUBLIC_`

**Update `.env.local`:**

```bash
# Server-side only
API_URL=http://localhost:5000
DATABASE_URL=postgresql://...

# Client-side accessible
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_ENDPOINT=/api
```

**Update code:**

```tsx
// Before
const apiUrl = import.meta.env.VITE_API_URL;

// After
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

**Effort:** 1 day

---

## Phase 6: Testing & Optimization (Week 4)

### 6.1 Update Test Suite

**Playwright tests:** Minimal changes needed

- Update URLs if changed
- Same test logic works

**Vitest tests:** May need adjustments

- Next.js components require different mocking
- Update imports

**Effort:** 2-3 days

---

### 6.2 SEO & Metadata

**Leverage Next.js metadata API:**

```tsx
// app/shop/[id]/page.tsx
export async function generateMetadata({ params }) {
  const product = await fetchProduct(params.id);

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.image],
    },
  };
}
```

**Move from `react-helmet-async` to native Next.js metadata**

**Effort:** 2 days

---

### 6.3 Performance Optimization

**Action items:**

- [ ] Enable production builds: `next build`
- [ ] Analyze bundle: `@next/bundle-analyzer`
- [ ] Optimize images (already using `<Image>`)
- [ ] Configure caching strategies
- [ ] Test Core Web Vitals

**Effort:** 2 days

---

## Phase 7: Deployment (Week 4)

### 7.1 Vercel Deployment

**Already configured for Vercel!**

**Changes needed:**

1. Update build command in Vercel dashboard:
   - Build command: `next build`
   - Output directory: `.next`

2. Environment variables (in Vercel dashboard):
   - Copy all `.env` variables
   - Set `API_URL` for production backend

3. Serverless functions:
   - `api/og/[id].ts` → Move to `app/api/og/[id]/route.ts` (optional)

**Effort:** 1 day

---

### 7.2 Backend Deployment Strategy

**Options:**

**A) Keep Separate (Recommended for Phase 1)**

- Deploy backend to separate service (Railway, Render, etc.)
- Update `API_URL` environment variable
- Configure CORS on backend for Next.js domain

**B) Migrate to Next.js API Routes**

- Move `server/src/routes/*` to `app/api/*`
- Bigger effort, but simpler infrastructure

**Recommendation:** Start with A, consider B later

**Effort:** 1-2 days

---

## Migration Checklist

### Pre-Migration

- [ ] Create feature branch: `git checkout -b feature/nextjs-migration`
- [ ] Set up Next.js in parallel directory
- [ ] Document all environment variables
- [ ] Backup production database
- [ ] Notify team/stakeholders

### Week 1

- [ ] Next.js project setup
- [ ] Configure subdomain middleware
- [ ] Backend API proxy configuration
- [ ] Root layout with providers
- [ ] Static pages migration (5-6 pages)

### Week 2

- [ ] Dynamic routes (Shop, Support)
- [ ] Auth pages (Login, Signup, Profile)
- [ ] Checkout flow
- [ ] Navigation component updates
- [ ] Client component directives

### Week 3

- [ ] Admin section layout
- [ ] Admin pages migration
- [ ] Protected route implementation
- [ ] Image optimization
- [ ] Data fetching patterns

### Week 4

- [ ] Environment variables update
- [ ] Test suite updates
- [ ] SEO metadata migration
- [ ] Performance testing
- [ ] Staging deployment
- [ ] Production deployment

### Post-Migration

- [ ] Monitor error logs
- [ ] Performance metrics comparison
- [ ] User feedback collection
- [ ] Gradual rollout (if using feature flags)
- [ ] Remove old Vite build

---

## Risk Mitigation

### High-Risk Areas

1. **Subdomain Routing**
   - **Risk:** Admin subdomain not working correctly
   - **Mitigation:** Test middleware early, have fallback path-based routing

2. **Authentication State**
   - **Risk:** Users logged out during migration
   - **Mitigation:** Test session persistence, maintain cookie compatibility

3. **Third-party Service Integration**
   - **Risk:** Payment, analytics, etc. breaking
   - **Mitigation:** Test in staging with test transactions

4. **SEO Regression**
   - **Risk:** Losing search rankings
   - **Mitigation:** Maintain URL structure, set up redirects, test crawling

### Rollback Plan

If issues arise:

1. Point domain back to old Vite build
2. Keep old deployment running until migration stable
3. Use Vercel's instant rollback feature

---

## Success Metrics

**Before vs After Comparison:**

- [ ] Lighthouse scores (Performance, SEO, Accessibility)
- [ ] Time to First Byte (TTFB)
- [ ] Core Web Vitals (LCP, FID, CLS)
- [ ] Bundle size
- [ ] Build time
- [ ] Error rates (monitor with Sentry/similar)

**Target Improvements:**

- SEO score: 90+ (from current client-side rendering)
- LCP: < 2.5s
- Bundle size: 20-30% reduction (due to code splitting)

---

## Alternative: React Router v7 File-Based Routing

**Lower effort option:** React Router v7 supports file-based routing

If migration seems too heavy, consider:

```bash
# Enable file-based routing in current setup
npx create-react-router@latest --template basic
```

This gives you file-based routing without the full Next.js migration.

**Effort:** 1-2 weeks (vs 3-4 for Next.js)

---

## Questions to Answer Before Starting

1. **What's the primary migration goal?**
   - [ ] Better SEO
   - [ ] Simpler deployment
   - [ ] Performance improvements
   - [ ] Developer experience

2. **Can you afford downtime?**
   - [ ] Yes (direct migration)
   - [ ] No (blue-green deployment needed)

3. **Backend migration scope:**
   - [ ] Keep separate
   - [ ] Migrate to Next.js API routes
   - [ ] Hybrid (some routes migrated)

4. **Team familiarity with Next.js?**
   - [ ] High (faster migration)
   - [ ] Low (add training time)

---

## Resources

**Documentation:**

- [Next.js App Router](https://nextjs.org/docs/app)
- [Migrating from Vite](https://nextjs.org/docs/app/building-your-application/upgrading/from-vite)
- [Subdomain Routing](https://nextjs.org/docs/app/building-your-application/routing/middleware)

**Code Examples:**

- [Next.js Examples](https://github.com/vercel/next.js/tree/canary/examples)
- [App Router Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading)

---

**Next Steps:**

1. Review this plan with your team
2. Decide on migration scope (full/partial)
3. Set up development environment
4. Start Week 1 tasks

Good luck! 🚀
