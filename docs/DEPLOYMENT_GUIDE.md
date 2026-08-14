# Deployment Guide: Sherotech Production Environment

This guide provides step-by-step instructions for deploying the Sherotech e-commerce platform to a production environment. Following the migration to a **Next.js Native Architecture**, the deployment process is now unified and streamlined.

## 📋 Prerequisites

- A PostgreSQL database (Recommended: [Supabase](https://supabase.com))
- An email delivery service (Recommended: [Resend](https://resend.com))
- Node.js v20+ and Yarn 4.x

## 🔑 Environment Variables

The following variables must be configured in your production environment settings.

### Database

| Variable       | Description                                                                   |
| :------------- | :---------------------------------------------------------------------------- |
| `DATABASE_URL` | Full PostgreSQL connection string (e.g., `postgres://user:pass@host:port/db`) |

### Storage & External Services

| Variable                       | Description                                                                                                    |
| :----------------------------- | :------------------------------------------------------------------------------------------------------------- |
| `SUPABASE_URL`                 | Your Supabase project URL                                                                                      |
| `SUPABASE_KEY`                 | Your Supabase anon/public key for image optimization                                                           |
| `RESEND_API_KEY`               | API key for automated notifications and newsletters                                                            |
| `RESEND_FROM`                  | Verified sender address for newsletter emails (for example, `SHERO TECHNOLOGIES <newsletter@your-domain.com>`) |
| `TWILIO_ACCOUNT_SID`           | Twilio account SID for SMS campaigns                                                                           |
| `TWILIO_AUTH_TOKEN`            | Twilio auth token for SMS campaigns                                                                            |
| `TWILIO_FROM_NUMBER`           | Twilio phone number used as the SMS sender                                                                     |
| `TWILIO_MESSAGING_SERVICE_SID` | Optional Twilio messaging service SID for SMS campaigns                                                        |
| `WHATSAPP_ACCESS_TOKEN`        | WhatsApp Cloud API access token, required for WhatsApp campaigns                                               |
| `WHATSAPP_PHONE_NUMBER_ID`     | WhatsApp Cloud API phone number ID, required for WhatsApp campaigns                                            |

### Application Config

| Variable               | Description                                                 |
| :--------------------- | :---------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | The primary production domain (e.g., `https://sherohq.com`) |
| `NODE_ENV`             | Set to `production`                                         |

### Payments (Paystack + Hubtel)

| Variable                | Description                                                                 |
| :---------------------- | :-------------------------------------------------------------------------- |
| `PAYSTACK_SECRET`       | Preferred Paystack secret key used for transaction initialization + webhook |
| `PAYSTACK_SECRET_KEY`   | Alternate compatible variable name (optional if `PAYSTACK_SECRET` is set)   |
| `HUBTEL_INITIALIZE_URL` | Optional Hubtel initializer endpoint if Hubtel runs as a separate service   |

---

## 🚀 Recommended Hosting: Vercel

Vercel is the recommended hosting platform for Sherotech as it provides native support for Next.js features, including Turbopack and Middleware.

1. **Connect Repository**: Import the `sherohq` repository into Vercel.
2. **Framework Preset**: Ensure "Next.js" is selected.
3. **Environment Variables**: Add all variables listed above in the "Environment Variables" section of the project settings.
4. **Deploy**: Trigger the initial build. Vercel will automatically run `yarn build`.

> [!NOTE]
> The `vercel.json` file in the root directory is already configured to handle custom rewrites for OG image generation and cron job schedules.

---

## 🛠️ Manual Deployment (Docker/VPS)

If deploying to a VPS (e.g., DigitalOcean, AWS) or a service like Render:

### 1. Build the Application

```bash
corepack enable
yarn install
yarn build
```

### 2. Start the Server

```bash
yarn start
```

By default, Next.js will listen on port `3000`. Ensure your reverse proxy (Nginx/Caddy) is configured to forward traffic to this port.

---

## ⏰ Automated Tasks (Cron Jobs)

The platform includes background tasks for newsletter processing and status updates.

### Vercel Cron

If using Vercel, the cron jobs are automatically configured via `vercel.json`:

- **Path**: `/api/cron/newsletter`
- **Schedule**: Every minute (standard for campaign processing)

### Manual Cron

If not using Vercel, set up a cron job to ping the endpoint periodically:

```bash
* * * * * curl -X GET https://your-domain.com/api/cron/newsletter -H "Authorization: Bearer YOUR_SECRET"
```

---

## 🗄️ Database Setup

Ensure the database schema is up-to-date before deployment.

1. **Initial Schema**: If starting with a fresh DB, run the migration scripts or apply the schema found in `src/lib/db.ts` (the structure is reflected in the SQL queries).
2. **SSL**: Ensure your connection string includes `?sslmode=require` if required by your DB provider.

---

## ✅ Post-Deployment Checklist

- [ ] Verify SSL certificate is active.
- [ ] Test the **MFA Setup** flow in the Admin Dashboard.
- [ ] Send a test email via the contact form to verify Resend integration.
- [ ] Check `sitemap.xml` and `robots.txt` accessibility.
- [ ] Verify image optimization is working (check if images load from `_next/image`).
- [ ] In Paystack Dashboard, set webhook URL to `https://<your-domain>/api/payments/webhook`.
- [ ] Confirm the same secret key in environment is used for both initialize and webhook signature verification.
- [ ] Place a live test order (card payment) and confirm order moves from `pending` to `processing`.

---

## 💳 Paystack Setup Steps

### Configuration

1. Add `PAYSTACK_SECRET` (or `PAYSTACK_SECRET_KEY`) in your hosting environment.
2. Deploy with `NEXT_PUBLIC_SITE_URL` set to your public domain.
3. In Paystack Dashboard, configure **webhook endpoint**:
   - `https://<your-domain>/api/payments/webhook`
   - This is the **server-to-server** notification URL (Paystack → backend).
   - Signature verification enforced; processes `charge.success` events.

### Dual-Callback Strategy

The system uses **two** callback URLs for reliability:

- **Webhook** (`/api/payments/webhook`): Server-side order finalization
  - Receives Paystack events securely
  - Verifies HMAC SHA512 signature
  - Updates `orders.status` → `processing`
  - Logs activity
  - Source of truth for order state

- **User Callback** (`/checkout/complete`): Customer-facing confirmation
  - Redirect URL after payment on Paystack's hosted page
  - Shows success/pending/error status
  - Fetches live order status from server
  - Safe even if user closes browser (webhook still processes)

### Testing

1. Place a test order (card payment via Paystack).
2. User is redirected to `/checkout/complete?reference=...`.
3. Verify page shows correct status:
   - **Success**: Order moved to `processing` via webhook.
   - **Pending**: Webhook still running; refresh to check.
   - **Error**: No webhook event received; contact Paystack support.
4. Check backend:
   - `orders.status` updated to `processing`
   - `activity_logs` contains `order_payment` success entry with provider.

---

## 🆘 Troubleshooting

### 404 on API Routes

Ensure that no legacy `server/` directory exists and that you are not using a legacy proxy in your hosting configuration. The application now uses native Next.js routing exclusively.

### Database Timeouts

If using Supabase, ensure you are using the **Connection Pooling** string (port 6543) for serverless environments to prevent connection exhaustion.
