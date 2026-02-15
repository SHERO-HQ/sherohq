# SheroTech Security Fixes - Quick Reference Guide

**For Developers & DevOps**

---

## 🚨 CRITICAL - Must Know Before Deploying

### 1. Environment Variables (Required)
The server **WILL NOT START** without these:

```bash
DATABASE_URL=postgresql://user:pass@host/db
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your-key-here
PORT=5000
```

**Optional but Recommended:**
```bash
NODE_ENV=production
CORS_ORIGIN=https://sherohq.com
PAYMENT_WEBHOOK_SECRET=your-webhook-secret
PUBLIC_URL=https://sherohq.com
API_URL=https://api.sherohq.com
```

### 2. Rate Limiting Is Always On
- **Global API:** 500 requests / 15 minutes
- **Login:** 5 attempts / 15 minutes per email
- **Admin Login:** 20 attempts / 15 minutes per username

**No more bypasses in development!**

### 3. CORS Is Strictly Enforced
Allowed origins must be in the allowlist:
- https://sherohq.com
- https://www.sherohq.com
- http://localhost:5173
- Or set via `CORS_ORIGIN` env var

**No wildcard origins allowed!**

---

## 🛡️ Security Features Enabled

### Helmet Security Headers
All responses include:
- Content-Security-Policy
- Strict-Transport-Security (HSTS)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy
- Permissions-Policy

### SSL Certificate Validation
- **Production:** Enforced (certificates must be valid)
- **Development:** Self-signed allowed

### Error Handling
- **Production:** Generic error messages
- **Development:** Detailed error messages
- Stack traces never exposed to clients

---

## 📝 Input Validation

### How to Use Validation Schemas

```typescript
import { validateBody } from '../middleware/validate';
import { RegisterSchema } from '../schemas';

router.post('/register', validateBody(RegisterSchema), async (req, res) => {
  // req.body is now validated and typed
  const { email, password, name } = req.body;
});
```

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Ghana Phone Validation
- Must start with `02` or `05`
- Must be exactly 10 digits
- Regex: `/^(02|05)\d{8}$/`

### Available Schemas
- `RegisterSchema` - User registration
- `LoginSchema` - User login
- `AdminLoginSchema` - Admin login
- `CreateOrderSchema` - Order creation
- `UpdateOrderStatusSchema` - Order status updates
- `InitializePaymentSchema` - Payment initialization
- `ShippingInfoSchema` - Shipping information
- And 20+ more in `server/src/schemas/index.ts`

---

## 🔐 Webhook Security

### Payment Webhooks
**MUST** include signature verification:

```typescript
import { verifyPaystackSignature } from '../middleware/webhookAuth';

router.post('/webhook', 
  verifyPaystackSignature(process.env.PAYMENT_WEBHOOK_SECRET), 
  async (req, res) => {
    // Signature verified, process webhook
  }
);
```

**Required Header:**
- Paystack: `X-Paystack-Signature`
- Hubtel: `X-Hubtel-Signature`
- Generic: `X-Webhook-Signature`

**Required Env Var:**
```bash
PAYMENT_WEBHOOK_SECRET=your-secret-from-payment-provider
```

---

## 🔒 Authentication Changes

### Timing Attack Protection
**Always use this pattern:**

```typescript
// ✅ CORRECT - Timing safe
const user = result.rows[0];
const fakeHash = "$2a$10$fakeHashForTimingConsistencyPreventionXXX...";
const isMatch = await bcrypt.compare(password, user?.passwordHash || fakeHash);

if (!user || !isMatch) {
  return res.status(401).json({ error: "Invalid credentials" });
}

// ❌ WRONG - Timing attack vulnerable
const user = result.rows[0];
if (!user) {
  return res.status(401).json({ error: "Invalid credentials" });
}
const isMatch = await bcrypt.compare(password, user.passwordHash);
```

### Error Handling Pattern
**Use this everywhere:**

```typescript
catch (error) {
  console.error("Operation failed:", error); // Log full details
  const isDev = process.env.NODE_ENV === "development";
  res.status(500).json({
    error: "Internal server error",
    ...(isDev && { details: error instanceof Error ? error.message : "Unknown error" }),
  });
}
```

---

## 📊 Monitoring & Health Checks

### Health Endpoint
```bash
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "message": "Sherotech API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### What to Monitor
- Failed login attempts (rate limit triggers)
- Webhook signature failures
- CORS policy violations
- Environment validation errors
- SSL certificate errors

---

## 🧪 Testing Checklist

### Before Deployment
- [ ] Environment variables set correctly
- [ ] `NODE_ENV=production` in production
- [ ] CORS origins configured
- [ ] Rate limiting tested
- [ ] Webhook signature tested
- [ ] SSL certificates valid
- [ ] Security headers present
- [ ] Input validation working

### Test Commands
```bash
# Test CORS (should be blocked)
curl -H "Origin: http://evil.com" https://api.sherohq.com/api/health

# Test rate limiting
for i in {1..6}; do
  curl -X POST https://api.sherohq.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done

# Test environment validation (should fail)
unset DATABASE_URL
npm run dev

# Test security headers
curl -I https://api.sherohq.com/api/health | grep -E "Strict-Transport|Content-Security|X-Frame"
```

---

## 🐛 Common Issues & Solutions

### Issue: Server won't start
**Error:** "Missing required environment variables"
**Solution:** Check .env file has DATABASE_URL, SUPABASE_URL, SUPABASE_KEY, PORT

### Issue: CORS errors
**Error:** "Not allowed by CORS"
**Solution:** Add frontend origin to allowedOrigins array or CORS_ORIGIN env var

### Issue: Rate limit too strict
**Error:** "Too many requests"
**Solution:** This is intentional. Wait 15 minutes or adjust limits in code

### Issue: Webhook signature fails
**Error:** "Invalid webhook signature"
**Solution:** Ensure PAYMENT_WEBHOOK_SECRET matches payment provider's secret

### Issue: Invalid phone number
**Error:** "Invalid Ghana phone number"
**Solution:** Format must be 02XXXXXXXX or 05XXXXXXXX (10 digits)

---

## 📚 File Locations

### Key Files
```
server/src/
├── index.ts                    # Main server, CORS, Helmet, rate limiting
├── schemas/index.ts            # 30+ validation schemas
├── middleware/
│   ├── validate.ts             # Validation middleware
│   ├── webhookAuth.ts          # Webhook signature verification
│   ├── adminAuth.ts            # Admin authentication
│   └── csrfProtection.ts       # CSRF protection
├── routes/
│   ├── auth.ts                 # User authentication (validated)
│   ├── admin.ts                # Admin routes (validated)
│   ├── payments.ts             # Payments (webhook verified)
│   └── orders.ts               # Orders (validated)
└── db/
    └── database.ts             # Database connection (SSL enforced)
```

### Documentation
```
root/
├── SECURITY_AUDIT.md           # Full security audit (24KB)
├── DESIGN_AUDIT.md             # Architecture analysis (31KB)
├── AUDIT_SUMMARY.md            # Executive summary (11KB)
├── REMEDIATION_CHECKLIST.md    # Step-by-step fixes (25KB)
├── FIXES_COMPLETED_SUMMARY.md  # What we fixed
└── QUICK_REFERENCE.md          # This file
```

---

## 🚀 Deployment Commands

### Development
```bash
# Install dependencies
yarn install

# Set up environment
cp server/.env.example server/.env
# Edit server/.env with your values

# Run development servers
yarn dev:all  # Frontend + Backend
```

### Production
```bash
# Build frontend
yarn build

# Build backend
cd server && yarn build

# Start production server
cd server && yarn start

# Or with PM2
pm2 start server/dist/index.js --name sherotech-api
```

---

## 🎯 Quick Wins

### Add Validation to New Endpoint
```typescript
// 1. Import middleware and schema
import { validateBody } from '../middleware/validate';
import { YourSchema } from '../schemas';

// 2. Add to route
router.post('/your-endpoint', 
  validateBody(YourSchema), 
  async (req, res) => {
    // Your logic here
  }
);
```

### Create New Validation Schema
```typescript
// In server/src/schemas/index.ts
export const YourSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^(02|05)\d{8}$/),
});
```

### Add Error Handling
```typescript
try {
  // Your code
  res.json({ success: true });
} catch (error) {
  console.error("Error:", error);
  const isDev = process.env.NODE_ENV === "development";
  res.status(500).json({
    error: "Operation failed",
    ...(isDev && { details: error instanceof Error ? error.message : "Unknown" }),
  });
}
```

---

## 📞 Support

### Security Questions
- Review: SECURITY_AUDIT.md
- Examples: REMEDIATION_CHECKLIST.md

### Architecture Questions
- Review: DESIGN_AUDIT.md
- Examples: Code files with comments

### Implementation Help
- Check: FIXES_COMPLETED_SUMMARY.md
- Reference: This file

---

## ✅ Checklist: "Am I Secure?"

- [ ] Environment variables validated at startup
- [ ] CORS allowlist configured (no wildcards)
- [ ] Rate limiting enabled
- [ ] Security headers present (6 headers)
- [ ] SSL certificates valid in production
- [ ] Input validation on all user inputs
- [ ] Webhook signatures verified
- [ ] Error messages sanitized in production
- [ ] Timing attack protection in auth
- [ ] No stack traces exposed to clients

**If all checked → You're good to go! 🎉**

---

**Last Updated:** 2024  
**Version:** 1.0  
**Status:** Production Ready 🚀