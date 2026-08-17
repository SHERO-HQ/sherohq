# SheroTech Solutions & Showcase Platform

A modern, responsive platform built for **SHERO HQ Technologies**. This website showcases reliable hardware, custom systems configuration, managed software solutions, and expert consultation services, all backed by a high-performance Next.js Native Architecture.

---

## 📚 System Documentation Suite

For detailed technical guides, architectural specifications, and API references, please consult our documentation suite in `docs/`:

- 🏗️ **[System Architecture & Overview](docs/ARCHITECTURE.md)**: Next.js native architecture, Drizzle ORM data layer, security controls, state management, and design tokens.
- 📡 **[API Reference & Integration Guide](docs/API_DOCUMENTATION.md)**: Endpoint documentation, request/response models, Zod validation schemas, CSRF protection, and rate limiting.
- 🛠️ **[Developer & Operations Handbook](docs/DEVELOPER_GUIDE.md)**: Setup runbook, coding constraints (strict 300-line file limit), testing playbook, Drizzle migrations, and production deployment.
- 🎨 **[Design System Guide](docs/DESIGN_GUIDE.md)**: OKLCH dual-primary color system, typography rules, accessibility standards, and visual guidelines.
- 🔒 **[Security Assessment](docs/SECURITY_ASSESSMENT.md)**: Comprehensive OWASP & STRIDE threat model, session rotation, CSRF double-submit protection, and TOTP MFA controls.

---

## 🚀 Key Features

- **Next.js 16+ Native Architecture**: Unified full-stack codebase utilizing modern App Router API routes.
- **Unified Drizzle ORM Data Layer**: Strongly typed, parameterized PostgreSQL queries across all 24+ API endpoints.
- **Security Hardening**: Session rotation on login, per-account brute-force lockout, double-submit cookie CSRF tokens, and security headers.
- **Enterprise Solutions Showcase**: Immersive displays for managed IT support, server infrastructure, custom software engineering, and procurement services.
- **Direct Lead Generation**: Seamless client engagement with dynamic WhatsApp inquiry workflows and custom quote triggers.
- **Multi-Factor Authentication (MFA)**: Production-grade TOTP-based security for administrative accounts.
- **React Query State Management**: Client-server state decoupling for ultra-fast UI rendering and real-time query invalidation.
- **Admin Command Center**: Comprehensive dashboard with real-time analytics, user audits, and activity logging.

---

## 🛠️ Tech Stack

### Full Stack

- **Framework**: [Next.js 16+](https://nextjs.org/) (App Router, Turbopack)
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5.9](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) via [Drizzle ORM](https://orm.drizzle.team/)
- **State Management**: [TanStack React Query v5](https://tanstack.com/query)
- **Animations**: [Motion](https://motion.dev/)
- **Testing**: [Vitest](https://vitest.dev/) (Unit) & [Playwright](https://playwright.dev/) (E2E)

---

## 🏁 Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- Yarn 4.x package manager (`yarn@4.12.0`)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd sherohq
   ```

2. **Install Dependencies**

   ```bash
   yarn install
   ```

### Environment Setup

Create a `.env.local` file in the root directory (see [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) for full template):

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SESSION_SECRET=your_32_byte_session_secret
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

---

## 🏃‍♂️ Development & Testing

```bash
# Start local dev server
yarn dev

# Run Vitest unit tests
yarn test

# Run Playwright E2E tests
yarn test:e2e

# Run TypeScript type check
npx tsc --noEmit
```

---

## 📄 License

This project is licensed under the MIT License.
