# Security Assessment Report

## Overview
This report summarizes the initial security findings for the `sherohq` project. Findings were derived from:
- static code review of security-critical routes and middleware
- OWASP/STRIDE-oriented threat analysis
- dependency auditing via `yarn npm audit --json`

The focus is on concrete, verifiable issues in authentication, CSRF/CORS, webhook handling, secrets usage, dependency vulnerabilities, and security headers.

---

## Critical Findings

### 1. Insecure MFA token handling
Files:
- `src/app/api/auth/login/route.ts`
- `src/app/api/admin-auth/login/route.ts`
- `src/app/api/auth/login/mfa/route.ts`

Issue:
- The temporary MFA token is derived via `Buffer.from(user.id).toString("base64")` or `Buffer.from(admin.id).toString("base64")`.
- This value is reversible and not bound to a login attempt, expiration, or one-time use.

Risk:
- Attackers can forge MFA tokens if they know or can guess a valid user/admin ID.
- This allows bypassing second-factor verification and impersonating accounts.

OWASP:
- Broken Authentication
- Insufficient Identity Management

STRIDE:
- Spoofing
- Elevation of privilege

---

### 2. WhatsApp webhook trust issue
File:
- `src/app/api/webhooks/whatsapp/route.ts`

Issue:
- The webhook verification endpoint only validates `hub.verify_token` on GET.
- The POST handler accepts incoming webhook payloads without cryptographic validation.

Risk:
- Any attacker can submit forged webhook payloads to trigger message processing, storage, alerts, or ticket creation.

OWASP:
- Broken Access Control
- Security Misconfiguration

STRIDE:
- Tampering
- Repudiation
- Spoofing

Recommendation:
- Implement signature verification for WhatsApp/Meta webhook POST requests.
- Validate the actual webhook signature header before processing payload data.

---

### 3. Loose origin/CORS validation and CSRF risk
File:
- `src/proxy.ts`

Issue:
- The `isAllowedOrigin()` function allows origins where `originHost.endsWith(serverHost)`.
- This means attacker-controlled subdomains may be accepted when matching `localhost:3000` or a production host suffix.
- Reflected `Access-Control-Allow-Origin` with `Access-Control-Allow-Credentials: true` is dangerous.

Risk:
- Cross-origin requests may be accepted from malicious subdomains.
- Combined with unsafe CORS reflection, CSRF can be bypassed.

OWASP:
- A05:2021 Security Misconfiguration
- A08:2021 Software and Data Integrity Failures

STRIDE:
- Information disclosure
- Tampering

Recommendation:
- Use an explicit allowlist for permitted origins.
- Avoid loose suffix matching for origin validation.
- Reflect only trusted origins in response headers.

---

## Dependency Vulnerabilities
A dependency audit revealed active vulnerabilities in direct client-side libraries.

### `jspdf@4.0.0`
- GHSA-7x6v-j9x4-qf24: PDF Object Injection via FreeText color
- GHSA-wfv2-pwc8-crg5: HTML Injection in New Window paths
- Affected file: `src/utils/exportUtils.ts`

### `xlsx@0.18.5`
- GHSA-4r6h-8v6p-xvw6: Prototype Pollution in SheetJS
- GHSA-5pgg-2g8v-p4x9: Regular Expression Denial of Service (ReDoS)
- Affected file: `src/utils/exportUtils.ts`

### `rolldown-vite`
- Deprecation advisory: package exists to migrate from Vite 7 to Vite 8.

Recommendation:
- Upgrade `jspdf` to a patched version.
- Upgrade `xlsx` to at least `0.19.3` / `0.20.2`.
- Replace `rolldown-vite` with a supported Vite release.

---

## Additional Security Findings

### 4. Missing security headers
File:
- `next.config.ts`

Current headers include:
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`

Missing recommended headers:
- `Strict-Transport-Security`
- `Content-Security-Policy`
- `Cross-Origin-Opener-Policy`
- `Cross-Origin-Embedder-Policy` (if required)

Recommendation:
- Add HSTS and CSP for production.
- Harden header policy for browser security.

---

### 5. Dangerous HTML injection patterns
Files containing `dangerouslySetInnerHTML`:
- `src/components/admin/newsletter/TemplatePreview.tsx`
- `src/components/common/JsonLd.tsx`
- `src/app/layout.tsx`

Issue:
- If any HTML content originates from user input, it must be sanitized before rendering.

Recommendation:
- Audit all uses of `dangerouslySetInnerHTML`.
- Use a sanitizer such as DOMPurify when rendering HTML from untrusted sources.

---

### 6. Password reset token storage
File:
- `src/app/api/auth/reset-password/route.ts`

Issue:
- Reset tokens appear to be stored and compared directly.

Recommendation:
- Store reset tokens as hashes rather than plaintext.
- Compare using a digest to avoid token exposure at rest.

---

### 7. Cron/webhook secret reuse
Files:
- `src/app/api/admin/payment-logs/route.ts`
- `src/app/api/cron/abandoned-carts/route.ts`
- `src/app/api/cron/newsletter/route.ts`
- `src/app/api/admin/whatsapp/whatsapp-retry/routes.ts`

Issue:
- The same secret may be reused for unrelated flows (`JWT_SECRET || CRON_SECRET`).

Recommendation:
- Use dedicated secrets for each webhook or cron endpoint.
- Avoid reusing a general JWT secret for endpoint guards.

---

## Recommended Next Actions
1. Fix MFA token generation and verification with secure temporary tokens.
2. Add cryptographic validation for WhatsApp webhook POSTs.
3. Harden origin/CORS validation in `src/proxy.ts`.
4. Upgrade vulnerable dependencies: `jspdf`, `xlsx`, and Vite tooling.
5. Add HSTS and CSP production headers.
6. Audit and sanitize all `dangerouslySetInnerHTML` uses.
7. Hash password reset tokens at rest.
8. Separate webhook/cron secrets from JWT and admin auth secrets.

---

## Prioritized Follow-up Plan

1. Immediate
   - Confirm webhook secret configuration and enforce `x-hub-signature-256` validation for WhatsApp POST requests.
   - Harden origin allowlist validation in `src/proxy.ts` and verify CSRF token checks on all state-changing POST routes.
   - Add production-only `Strict-Transport-Security` and a minimal `Content-Security-Policy` in `next.config.ts`.

2. High priority
   - Audit all `dangerouslySetInnerHTML` usage and sanitize or remove unsafe HTML rendering.
   - Replace deprecated Vite tooling such as `rolldown-vite` and align the build config with the latest Vite release.
   - Ensure password reset and MFA recovery tokens are stored as hashes instead of plaintext.

3. Medium priority
   - Review webhook/cron endpoint secret reuse and assign dedicated secrets for each integration.
   - Re-run dependency audit after upgrades and address any remaining advisories.
   - Add monitoring or alerting for repeated login/MFA failures and webhook signature failures.

---

## Remediation Status

### Completed & Fully Resolved (2026-08-11)
- **MFA Token Handling**: `src/app/api/auth/login/route.ts`, `src/app/api/admin-auth/login/route.ts`, `src/app/api/auth/login/mfa/route.ts`, and `src/app/api/admin-auth/login/mfa/route.ts` now use HMAC-SHA256 signed, short-lived (5-minute TTL) challenge tokens (`generateMfaChallengeToken` / `verifyMfaChallengeToken`).
- **WhatsApp Webhook Authenticity**: `src/app/api/webhooks/whatsapp/route.ts` now validates `x-hub-signature-256` HMAC signatures using `timingSafeEqual` against `WHATSAPP_APP_SECRET`.
- **CORS/CSRF Origin Validation**: `src/proxy.ts` uses strict domain allowlist checking (`sherohq.com`, `sherotech.com`, exact `.localhost` ports) instead of loose suffix matching.
- **Dependency Vulnerabilities & Hygiene**: Upgraded `jspdf` to `^4.2.1`, `xlsx` to `0.20.3` (SheetJS official CDN distribution), and replaced deprecated `rolldown-vite` alias with standard `vite`.
- **Security Headers**: `next.config.ts` now configures `Strict-Transport-Security`, `Content-Security-Policy`, and `Cross-Origin-Opener-Policy`.
- **HTML Sanitization**: `src/components/admin/newsletter/TemplatePreview.tsx` uses `sanitizeHtml()` from `src/lib/sanitize.ts` to neutralize XSS payload vectors before rendering HTML previews.
- **Password Reset Token Hashing**: `src/app/api/auth/forgot-password/route.ts` and `src/app/api/auth/reset-password/route.ts` hash reset tokens with SHA-256 before saving to the database and looking them up.
- **Cron Secret Separation**: `src/lib/api-utils.ts` provides `validateCronAuth` to enforce strict `CRON_SECRET` validation across cron jobs.

---

## Notes
This report has been updated following full security remediation as of `2026-08-11`. All 8 identified security findings have been resolved and verified with automated test suites.
