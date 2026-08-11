# SheroTech — Developer & Operations Handbook

> **Purpose**: Practical operational guide for developers, QA engineers, and system administrators working on the SheroTech showcase platform.

---

## 1. Local Development Setup

### Prerequisites
* **Node.js**: `v20.x` or higher
* **Package Manager**: Yarn 4 (`yarn@4.12.0`)
* **Database**: PostgreSQL (Supabase instance or local Postgres)
* **Redis**: Upstash Redis (or local Redis instance)

### Environment Variables Setup
Create a `.env.local` file in the root directory based on the following template:

```env
# Node Environment
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres

# Session & Security Secrets
SESSION_SECRET=your_32_byte_random_session_secret_key
CRON_SECRET=your_cron_job_secret_key

# Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# External Integrations (Payments & WhatsApp)
HUBTEL_CLIENT_ID=your_hubtel_client_id
HUBTEL_CLIENT_SECRET=your_hubtel_client_secret
HUBTEL_MERCHANT_ACCOUNT_NUMBER=your_merchant_account

WHATSAPP_TOKEN=your_whatsapp_api_token
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
```

### Installation & Launch Commands
```bash
# 1. Install dependencies with Yarn 4
yarn install

# 2. Run database migrations
yarn db:migrate

# 3. Start Next.js development server
yarn dev
```
The application will be accessible at `http://localhost:3000`.

---

## 2. Code Quality & Architectural Rules

All pull requests and code modifications MUST adhere to the non-negotiable project rules:

1. **Maximum 300 Lines Per Component File**: Components exceeding 300 lines must be decomposed into focused sub-components.
2. **No Raw SQL**: All database operations must utilize Drizzle ORM (`db.select()`, `db.insert()`, etc.). Raw `query()` calls are prohibited.
3. **No Hardcoded Hex Colors in UI**: Always reference CSS variable tokens from `src/index.css` (`bg-card`, `text-foreground`, `border-border`).
4. **Universal API Responses**: All API route handlers must use `apiResponse.success()` and `apiResponse.error()`.
5. **Strict Input Validation**: Validate all incoming bodies with Zod schemas in `src/lib/validations/`.
6. **No Explicit `any` Types**: Use TypeScript interfaces or `unknown` with narrowing.
7. **Absolute Path Aliases**: Import project modules using `@/` path prefixes (e.g., `import { db } from "@/lib/db"`).

---

## 3. Testing Playbook

SheroTech maintains dual test layers for unit logic and end-to-end integration flows.

### Running Unit Tests (Vitest)
Unit tests validate pure utility logic, calculation helpers, and security sanitization routines:
```bash
# Run unit test suite
yarn test
```

### Running End-to-End Tests (Playwright)
Playwright tests simulate complete browser flows across public pages, checkout, and admin features:
```bash
# Run headless E2E tests
yarn test:e2e

# Run Playwright in interactive UI mode
yarn test:e2e:ui
```

### Automated Code Quality Checks
Run these commands prior to committing changes:
```bash
# ESLint check with auto-fix
yarn lint

# TypeScript static type check
npx tsc --noEmit
```

---

## 4. Database Schema & Migration Workflow

Database schemas are defined in `src/lib/drizzle/schema.ts`.

### Modifying Schema Entities
1. Open `src/lib/drizzle/schema.ts` and add or modify the table definitions.
2. Generate migration SQL files using Drizzle Kit:
   ```bash
   npx drizzle-kit generate
   ```
3. Push changes directly to the development database:
   ```bash
   npx drizzle-kit push
   ```
4. Or apply migrations via the repository migration script:
   ```bash
   yarn db:migrate
   ```
5. Inspect the database schema visually using Drizzle Studio:
   ```bash
   npx drizzle-kit studio
   ```

---

## 5. Continuous Integration & Production Deployment

### CI Pipeline (`.github/workflows/ci.yml`)
On every pull request to `main`, GitHub Actions automatically executes:
1. `yarn install --immutable`
2. `yarn lint`
3. `npx tsc --noEmit`
4. `yarn test`
5. `yarn build`

### Pre-Deployment Checklist
Before triggering a production deployment:
- [ ] Run `npx tsc --noEmit` locally and ensure zero type errors.
- [ ] Run `yarn test` to confirm all unit tests pass.
- [ ] Verify security headers in `next.config.ts`.
- [ ] Confirm production environment variables are properly set in Vercel or GCP Cloud Run.
