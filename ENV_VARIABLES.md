# SheroTech Environment Variables Documentation

**Complete guide to all environment variables used in the application**

---

## 🔴 REQUIRED VARIABLES (Server Won't Start Without These)

These variables are **validated at startup**. The server will exit with an error if any are missing.

### `DATABASE_URL`
**Type:** String (PostgreSQL connection string)  
**Required:** ✅ YES  
**Validated:** Format must start with `postgresql://`

**Description:** PostgreSQL database connection string for Supabase or self-hosted Postgres.

**Format:**
```
postgresql://username:password@host:port/database?sslmode=require
```

**Example:**
```bash
DATABASE_URL="postgresql://postgres:yourpassword@db.example.supabase.co:5432/postgres"
```

**Notes:**
- Special characters in password MUST be URL-encoded
- `@` should be encoded as `%40`
- `#` should be encoded as `%23`
- Use SSL mode for production

---

### `SUPABASE_URL`
**Type:** String (URL)  
**Required:** ✅ YES  
**Validated:** Must contain "supabase.co"

**Description:** Your Supabase project URL for file storage and API access.

**Example:**
```bash
SUPABASE_URL="https://abcdefghijklmnop.supabase.co"
```

**Where to Find:**
1. Go to Supabase Dashboard
2. Settings → API
3. Copy "Project URL"

---

### `SUPABASE_KEY`
**Type:** String (API Key)  
**Required:** ✅ YES  
**Validated:** Presence check only

**Description:** Supabase anonymous/service key for storage operations.

**Example:**
```bash
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Where to Find:**
1. Go to Supabase Dashboard
2. Settings → API
3. Copy "anon public" key (for client-side) or "service_role" key (for server-side)

**⚠️ Security:** Use service_role key for backend, keep it secret!

---

### `PORT`
**Type:** Number  
**Required:** ✅ YES  
**Default:** 5000

**Description:** Port number the server will listen on.

**Example:**
```bash
PORT=5000
```

**Notes:**
- Railway/Render may override this with their own PORT
- Localhost development typically uses 5000 or 3000

---

## 🟡 RECOMMENDED VARIABLES (Highly Recommended for Production)

### `NODE_ENV`
**Type:** String (enum)  
**Required:** ⚠️ Recommended  
**Values:** `development`, `production`, `staging`, `test`

**Description:** Determines application behavior (error verbosity, SSL validation, etc.)

**Example:**
```bash
NODE_ENV="production"
```

**Impact:**
- **Production:**
  - Generic error messages
  - SSL certificate validation enforced
  - Optimized performance
- **Development:**
  - Detailed error messages with stack traces
  - Self-signed SSL certificates allowed
  - Debug logging enabled

**Default:** Falls back to "development" if not set

---

### `CORS_ORIGIN` or `FRONTEND_URL`
**Type:** String (comma-separated URLs)  
**Required:** ⚠️ Recommended  
**Default:** Uses built-in allowlist

**Description:** Additional origins allowed for CORS requests. Multiple origins can be comma-separated.

**Example:**
```bash
CORS_ORIGIN="https://sherohq.com,https://www.sherohq.com"
# OR
FRONTEND_URL="https://sherohq.com"
```

**Built-in Allowed Origins:**
- https://sherohq.com
- https://www.sherohq.com
- https://sherohq.vercel.app
- https://admin.sherohq.com
- http://localhost:5173
- http://localhost:3000

**Notes:**
- Trailing slashes are automatically normalized
- Don't include protocol if using FRONTEND_URL (it's added automatically)

---

### `PAYMENT_WEBHOOK_SECRET`
**Type:** String (secret key)  
**Required:** ⚠️ Required for payment webhooks  
**Default:** None (webhooks will fail without this)

**Description:** Secret key for verifying payment webhook signatures from Paystack/Hubtel.

**Example:**
```bash
PAYMENT_WEBHOOK_SECRET="sk_test_abc123xyz789..."
```

**Where to Find:**
- **Paystack:** Dashboard → Settings → API Keys & Webhooks → Secret Key
- **Hubtel:** Merchant Dashboard → API Settings → Webhook Secret

**⚠️ Security:** Never commit this to version control!

---

### `PUBLIC_URL`
**Type:** String (URL)  
**Required:** ⚠️ Recommended for production  
**Default:** http://localhost:5173

**Description:** Public URL of your frontend application for redirect URLs.

**Example:**
```bash
PUBLIC_URL="https://sherohq.com"
```

**Used For:**
- Payment success/cancel redirect URLs
- Email verification links
- Password reset links

---

### `API_URL`
**Type:** String (URL)  
**Required:** 🟢 Optional  
**Default:** http://localhost:5000

**Description:** Base URL of your API server for callback URLs.

**Example:**
```bash
API_URL="https://api.sherohq.com"
```

**Used For:**
- Payment webhook callback URLs
- API documentation links

---

## 🟢 OPTIONAL VARIABLES (Nice to Have)

### `DEBUG`
**Type:** String (boolean)  
**Required:** 🟢 Optional  
**Default:** false

**Description:** Enable verbose database query logging.

**Example:**
```bash
DEBUG="true"
```

**When Enabled:**
- Logs all database queries with execution time
- Shows slow queries (>100ms) highlighted
- Useful for performance debugging

**⚠️ Warning:** Don't enable in production (performance impact)

---

### `COOKIE_DOMAIN`
**Type:** String (domain)  
**Required:** 🟢 Optional (if using cookies)  
**Default:** undefined (current domain)

**Description:** Domain for httpOnly cookies (if implementing cookie-based auth).

**Example:**
```bash
COOKIE_DOMAIN=".sherohq.com"
```

**Notes:**
- Use leading dot (`.sherohq.com`) for subdomain sharing
- Not needed if frontend and backend on same domain

---

### `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
**Type:** Strings  
**Required:** 🟢 Optional (if using SMTP instead of Resend)

**Description:** SMTP server configuration for sending emails.

**Example:**
```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

**Alternative:** Use Resend (recommended)
```bash
RESEND_API_KEY="re_abc123..."
```

---

### `SENTRY_DSN`
**Type:** String (DSN URL)  
**Required:** 🟢 Optional (for error tracking)

**Description:** Sentry DSN for error tracking and monitoring.

**Example:**
```bash
SENTRY_DSN="https://abc123@o123.ingest.sentry.io/456"
```

---

### `REDIS_URL`
**Type:** String (connection string)  
**Required:** 🟢 Optional (for distributed caching)

**Description:** Redis connection string for caching and session storage.

**Example:**
```bash
REDIS_URL="redis://username:password@host:6379"
```

**Use Cases:**
- Distributed rate limiting
- Session storage
- Caching layer

---

## 📋 Complete .env.example Template

```env
# ============================================
# REQUIRED - Server won't start without these
# ============================================

# Database (PostgreSQL via Supabase)
DATABASE_URL="postgresql://postgres:password@host:5432/database"

# Supabase (for file storage)
SUPABASE_URL="https://yourproject.supabase.co"
SUPABASE_KEY="your-anon-or-service-key-here"

# Server Port
PORT=5000

# ============================================
# RECOMMENDED - Highly recommended for production
# ============================================

# Environment
NODE_ENV="production"

# CORS Configuration
CORS_ORIGIN="https://sherohq.com,https://www.sherohq.com"
FRONTEND_URL="https://sherohq.com"

# Payment Webhooks
PAYMENT_WEBHOOK_SECRET="your-payment-provider-webhook-secret"

# Public URLs
PUBLIC_URL="https://sherohq.com"
API_URL="https://api.sherohq.com"

# ============================================
# OPTIONAL - For additional features
# ============================================

# Debug Mode (development only)
# DEBUG="true"

# Email (SMTP or Resend)
# RESEND_API_KEY="re_abc123..."
# OR
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT="587"
# SMTP_USER="your-email@gmail.com"
# SMTP_PASS="your-app-password"

# Monitoring
# SENTRY_DSN="https://abc@sentry.io/123"

# Caching (if using Redis)
# REDIS_URL="redis://localhost:6379"

# Cookie Domain (if using httpOnly cookies)
# COOKIE_DOMAIN=".sherohq.com"
```

---

## 🔒 Security Best Practices

### DO ✅
- ✅ Use strong, randomly generated secrets
- ✅ Store .env files outside version control
- ✅ Use different values for dev/staging/production
- ✅ Rotate secrets regularly (every 90 days)
- ✅ URL-encode special characters in DATABASE_URL
- ✅ Use environment variable management tools (Doppler, Vault, etc.)
- ✅ Restrict access to .env files (chmod 600)

### DON'T ❌
- ❌ Commit .env files to Git
- ❌ Share .env files via email/Slack
- ❌ Use production secrets in development
- ❌ Hardcode secrets in code
- ❌ Log environment variables
- ❌ Share secrets in screenshots/demos

---

## 🚀 Platform-Specific Configuration

### Vercel (Frontend)
Set environment variables in:
- Dashboard → Settings → Environment Variables
- Add separately for Production, Preview, Development

**Required:**
- `VITE_API_URL` (points to backend)

---

### Render (Backend)
Set environment variables in:
- Dashboard → Environment → Environment Variables

**Auto-Provided:**
- `PORT` (automatically set by Render)

**You Must Set:**
- All required variables listed above

---

### Railway (Backend)
Set environment variables in:
- Dashboard → Variables tab

**Auto-Provided:**
- `PORT`, `DATABASE_URL` (if using Railway Postgres)

**You Must Set:**
- SUPABASE_URL, SUPABASE_KEY
- Other required variables

---

### Netlify (Frontend)
Set environment variables in:
- Site Settings → Environment Variables

**Prefix for client-side:**
- Use `VITE_` prefix for variables accessible in frontend

---

## 🧪 Testing Environment Variables

### Verify Required Variables
```bash
# Run this to check if server starts
cd server
node -e "require('dotenv').config(); console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing')"
```

### Test Database Connection
```bash
# Try connecting to database
cd server
yarn dev
# Check logs for: "✅ Database is ready to handle requests"
```

### Test Supabase Connection
```bash
# Try uploading a file
curl -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "image=@test.jpg"
```

---

## 📞 Troubleshooting

### Error: "Missing required environment variables"
**Solution:** Check that DATABASE_URL, SUPABASE_URL, SUPABASE_KEY, and PORT are set

### Error: "DATABASE_URL must be a valid PostgreSQL connection string"
**Solution:** Ensure URL starts with `postgresql://`

### Error: "SUPABASE_URL looks invalid"
**Solution:** URL should contain "supabase.co"

### Error: "Storage uploads fail"
**Solution:** Check SUPABASE_KEY is correct (use service_role key for backend)

### Error: "Webhook signature verification failed"
**Solution:** Ensure PAYMENT_WEBHOOK_SECRET matches payment provider's secret

### Error: "CORS blocked"
**Solution:** Add your frontend URL to CORS_ORIGIN environment variable

---

## 📚 Related Documentation

- **Security:** See `SECURITY_AUDIT.md`
- **Deployment:** See `QUICK_REFERENCE.md`
- **Architecture:** See `DESIGN_AUDIT.md`

---

**Last Updated:** 2024  
**Version:** 1.0  
**Maintained By:** SheroTech Development Team