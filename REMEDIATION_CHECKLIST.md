# SheroTech Remediation Checklist

**Purpose:** Step-by-step guide to fix audit findings  
**Difficulty:** Varies per item (marked with ⏱️ estimates)  
**Total Effort:** ~30-40 developer hours  

---

## Phase 1: Critical Security Fixes (MUST DO THIS WEEK)

### ✅ 1. Fix CORS Bypass in Non-Production Environments
**Status:** ⏳ Not Started  
**Effort:** ⏱️ 30 minutes  
**Risk if Not Fixed:** CRITICAL  

**Current Code (VULNERABLE):**
```typescript
// server/src/index.ts (Lines 87-89)
const isAllowed =
  normalizedAllowedOrigins.includes(normalizedOrigin) ||
  process.env.NODE_ENV !== "production";  // ❌ ALLOWS ALL ORIGINS IN DEV!
```

**Fixed Code:**
```typescript
// server/src/index.ts
const isAllowed = normalizedAllowedOrigins.includes(normalizedOrigin);

if (!isAllowed) {
  console.error(`🚫 CORS blocked for origin: ${origin}`);
  callback(new Error(`CORS policy violation: ${origin}`));
} else {
  callback(null, true);
}
```

**Testing:**
```bash
# Test with non-whitelisted origin
curl -H "Origin: http://malicious.com" \
     http://localhost:5000/api/products

# Should get 403 error in all environments
```

**✓ Verification:**
- [ ] CORS blocks non-whitelisted origins in development
- [ ] CORS blocks non-whitelisted origins in production
- [ ] Whitelisted origins still work
- [ ] Logs show blocked origins

---

### ✅ 2. Remove Environment Variables from API Responses
**Status:** ⏳ Not Started  
**Effort:** ⏱️ 15 minutes  
**Risk if Not Fixed:** MEDIUM  

**Current Code (VULNERABLE):**
```typescript
// server/src/index.ts (GET /)
res.json({
  message: "Sherotech API is running",
  frontend: process.env.CORS_ORIGIN || "https://www.sherohq.com",  // ❌ EXPOSES ENV VAR
  endpoints: { ... }
});
```

**Fixed Code:**
```typescript
// server/src/index.ts
res.json({
  message: "Sherotech API is running",
  endpoints: {
    health: "/api/health",
    products: "/api/products",
    docs: "https://api.sherohq.com/docs",
  },
});
// Remove CORS_ORIGIN from response
```

**✓ Verification:**
- [ ] GET / returns no environment variables
- [ ] API documentation endpoint exists
- [ ] No sensitive configuration in response

---

### ✅ 3. Sanitize Error Messages (Remove Stack Traces)
**Status:** ⏳ Not Started  
**Effort:** ⏱️ 2-3 hours  
**Risk if Not Fixed:** CRITICAL  

**Current Code (VULNERABLE):**
```typescript
// routes/auth.ts, routes/payments.ts, routes/upload.ts
catch (error: unknown) {
  console.error("Auth error:", error);
  res.status(500).json({
    error: "Failed to login",
    details: error instanceof Error ? error.message : "Unknown error",  // ❌ EXPOSES DETAILS
  });
}
```

**Fixed Code - Option 1: Global Error Handler**
```typescript
// middleware/errorHandler.ts
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isDev = process.env.NODE_ENV === "development";
  const isOperationalError = err instanceof ApiError;

  // Log full details for debugging
  console.error({
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ...(isDev && { details: err }),
  });

  // Return generic error to client in production
  if (isOperationalError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(isDev && { code: err.code }),
    });
  }

  // Generic error for unexpected errors
  res.status(500).json({
    error: "An error occurred while processing your request",
    ...(isDev && { details: err.message }),
    requestId: req.id, // For tracing
  });
};

// Add to server/src/index.ts (must be LAST middleware)
app.use(errorHandler);
```

**Fixed Code - Option 2: In Route Handlers**
```typescript
// routes/auth.ts
catch (error: unknown) {
  const isDev = process.env.NODE_ENV === "development";
  console.error("Login error:", error);
  
  res.status(500).json({
    error: "Authentication failed. Please try again.",
    ...(isDev && { 
      details: error instanceof Error ? error.message : "Unknown error" 
    }),
  });
}
```

**✓ Verification:**
- [ ] Stack traces not visible in API responses
- [ ] Generic error messages returned in production
- [ ] Full errors still logged server-side for debugging
- [ ] Development mode shows details (optional)

---

### ✅ 4. Migrate Tokens from localStorage to httpOnly Cookies
**Status:** ⏳ Not Started  
**Effort:** ⏱️ 3-4 hours  
**Risk if Not Fixed:** CRITICAL  

**Step 1: Backend Changes**

```typescript
// server/src/routes/auth.ts - Login endpoint
router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // ... existing auth logic ...
    
    const token = randomBytes(32).toString("hex");
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await db.query(
      'INSERT INTO user_sessions (id, "userId", token, "expiresAt") VALUES ($1, $2, $3, $4)',
      [sessionId, user.id, token, expiresAt]
    );

    // ✅ Set httpOnly cookie instead of returning token
    res.cookie('userToken', token, {
      httpOnly: true,           // JavaScript cannot access
      secure: true,             // HTTPS only
      sameSite: 'strict',       // CSRF protection
      maxAge: 24 * 60 * 60 * 1000,  // 24 hours
      domain: process.env.COOKIE_DOMAIN || undefined,
      path: '/',
    });

    // Return user info, NOT token
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    // ... error handling ...
  }
});

// Logout endpoint - clear cookie
router.post("/logout", async (req, res) => {
  res.clearCookie('userToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  });
  res.json({ success: true });
});

// Get current user - use cookie automatically
router.get("/me", async (req, res) => {
  const token = req.cookies.userToken;  // Auto-extracted from cookies
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  // ... rest of endpoint ...
});
```

**Step 2: Backend Middleware Setup**

```typescript
// server/src/index.ts
import cookieParser from 'cookie-parser';

app.use(cookieParser());  // Add after body parser
app.use(express.json());

// Update CORS to accept cookies
app.use(cors({
  origin: (origin, callback) => {
    // ... existing origin check ...
  },
  credentials: true,  // ✅ Allow cookies
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-CSRF-Protection",
    "X-Requested-With",
  ],
}));
```

**Step 3: Frontend Changes**

```typescript
// src/context/AuthContext.tsx - BEFORE
const checkAuth = useCallback(async () => {
  try {
    const token = localStorage.getItem("userToken");  // ❌ VULNERABLE
    if (!token) {
      setIsLoading(false);
      return;
    }
    
    const response = await fetch("/api/auth/me", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    // ...
  } catch {
    localStorage.removeItem("userToken");  // ❌ EXPOSED
    setUser(null);
  }
}, []);

// src/context/AuthContext.tsx - AFTER
const checkAuth = useCallback(async () => {
  try {
    // ✅ No token in code - sent automatically via cookies
    const response = await fetch("/api/auth/me", {
      credentials: "include",  // ✅ Send cookies with request
    });
    // ...
  } catch {
    setUser(null);
  }
}, []);
```

**Step 4: API Client Update**

```typescript
// src/services/api.ts - BEFORE
export async function authFetch(url: string, options: RequestInit = {}) {
  const token = getAuthToken();  // ❌ FETCH FROM LOCALSTORAGE
  const headers = {
    ...options.headers,
    "Authorization": `Bearer ${token}`,
  };
  
  const response = await fetch(url, { ...options, headers });
  return response;
}

// src/services/api.ts - AFTER
export async function authFetch(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "include",  // ✅ SEND COOKIES AUTOMATICALLY
    headers: {
      ...options.headers,
      "X-CSRF-Protection": "1",
    },
  });
  return response;
}
```

**Install Required Dependencies:**
```bash
npm install cookie-parser
# or
yarn add cookie-parser
```

**✓ Verification:**
- [ ] Login endpoint sets httpOnly cookie
- [ ] Cookie visible in DevTools Application tab
- [ ] Cookie NOT accessible from JavaScript console
- [ ] Logout clears cookie
- [ ] Requests automatically include cookie
- [ ] localStorage no longer used for tokens
- [ ] Admin token also uses cookies

---

### ✅ 5. Enable Rate Limiting in All Environments
**Status:** ⏳ Not Started  
**Effort:** ⏱️ 30 minutes  
**Risk if Not Fixed:** HIGH  

**Current Code (VULNERABLE):**
```typescript
// server/src/index.ts
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === "production" ? 500 : 100000,  // ❌ 100K/15min in dev!
  skip: () => process.env.NODE_ENV !== "production",  // ❌ DISABLED IN DEV!
});
```

**Fixed Code:**
```typescript
// server/src/index.ts
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,  // ✅ Same limit everywhere
  skip: false,  // ✅ Never skip
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
  keyGenerator: (req) => {
    // Rate limit by IP or user ID
    return req.user?.id || req.ip;
  },
});

// Same fix for auth limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,  // ✅ Strict for auth
  skip: false,  // ✅ Never skip
  skipSuccessfulRequests: true,  // Don't count successful logins
  keyGenerator: (req) => req.body.email || req.ip,  // Per-email limit
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  skip: false,  // ✅ Never skip
});
```

**✓ Verification:**
- [ ] Rate limiting enforced in development
- [ ] Rate limiting enforced in production
- [ ] Auth endpoints limited to 5 attempts/15min
- [ ] Admin endpoints limited to 20 attempts/15min
- [ ] Global API limited to 500 requests/15min

---

### ✅ 6. Add Security Headers with Helmet
**Status:** ⏳ Not Started  
**Effort:** ⏱️ 1-2 hours  
**Risk if Not Fixed:** HIGH  

**Current Code (INSUFFICIENT):**
```typescript
// server/src/index.ts
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
```

**Fixed Code:**
```typescript
// server/src/index.ts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.vercel.com"],  // Whitelist CDNs
      styleSrc: ["'self'", "'unsafe-inline'"],  // Tailwind needs this
      imgSrc: ["'self'", "https:", "data:"],
      connectSrc: [
        "'self'",
        "https://sherotech.onrender.com",
        "https://api.sherohq.com",
      ],
      frameSrc: ["'none'"],  // Prevent clickjacking
      objectSrc: ["'none'"],  // Prevent plugins
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
  noSniff: true,  // Prevent MIME sniffing
  hsts: {
    maxAge: 31536000,  // 1 year
    includeSubDomains: true,
    preload: true,  // Enable HSTS preload
  },
  frameguard: { action: "deny" },  // X-Frame-Options
  permissionsPolicy: {
    features: {
      geolocation: [],
      microphone: [],
      camera: [],
      payment: [],  // Disable Payment API unless explicitly used
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
```

**Testing:**
```bash
# Check security headers
curl -I https://api.sherohq.com

# Should see headers like:
# Strict-Transport-Security: max-age=31536000
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Content-Security-Policy: ...
```

**✓ Verification:**
- [ ] Strict-Transport-Security header present
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] Content-Security-Policy configured
- [ ] Referrer-Policy configured
- [ ] Permissions-Policy configured

---

### ✅ 7. Verify SSL Certificate Checking
**Status:** ⏳ Not Started  
**Effort:** ⏱️ 30 minutes  
**Risk if Not Fixed:** MEDIUM  

**Current Code (INSUFFICIENT):**
```typescript
// server/src/db/database.ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },  // ❌ DISABLES CERTIFICATE VALIDATION!
});
```

**Fixed Code:**
```typescript
// server/src/db/database.ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? true  // ✅ Enforce in production
    : { rejectUnauthorized: false },  // ✅ Allow self-signed in dev
  max: 20,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 60000,
});

// Also fix in migrate.ts
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? true
    : { rejectUnauthorized: false },
});
```

**✓ Verification:**
- [ ] SSL certificates verified in production
- [ ] Self-signed certs allowed in development
- [ ] Database connection succeeds with valid cert
- [ ] Connection fails with invalid cert (in production)

---

### ✅ 8. Implement Environment Variable Validation
**Status:** ⏳ Not Started  
**Effort:** ⏱️ 1 hour  
**Risk if Not Fixed:** CRITICAL  

**Add to `server/src/index.ts`:**
```typescript
// Validate required environment variables at startup
function validateEnvironment() {
  const required = [
    "DATABASE_URL",
    "SUPABASE_URL",
    "SUPABASE_KEY",
    "PORT",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `❌ FATAL: Missing required environment variables: ${missing.join(", ")}`
    );
    process.exit(1);
  }

  // Validate DATABASE_URL format
  if (!process.env.DATABASE_URL?.startsWith("postgresql://")) {
    console.error(
      "❌ FATAL: DATABASE_URL must be a valid PostgreSQL connection string"
    );
    process.exit(1);
  }

  // Validate Supabase URL
  if (!process.env.SUPABASE_URL?.includes("supabase.co")) {
    console.warn(
      "⚠️ WARNING: SUPABASE_URL looks invalid. Uploads may fail."
    );
  }

  console.log("✅ All required environment variables present and valid");
}

// Call BEFORE initializing database
validateEnvironment();

const app = express();
// ... rest of setup
```

**✓ Verification:**
- [ ] Server refuses to start without DATABASE_URL
- [ ] Server refuses to start without SUPABASE_URL
- [ ] Server refuses to start without SUPABASE_KEY
- [ ] Error message clearly states what's missing
- [ ] Validates URL format, not just presence

---

### ✅ 9. Implement Webhook Signature Verification
**Status:** ⏳ Not Started  
**Effort:** ⏱️ 1-2 hours  
**Risk if Not Fixed:** HIGH  

**Create `server/src/middleware/webhookAuth.ts`:**
```typescript
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

export function verifyWebhookSignature(secret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers["x-webhook-signature"] as string;

    if (!signature) {
      return res.status(401).json({
        error: "Missing webhook signature",
      });
    }

    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    // Use timing-safe comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )) {
      return res.status(401).json({
        error: "Invalid webhook signature",
      });
    }

    next();
  };
}
```

**Update `server/src/routes/payments.ts`:**
```typescript
import { verifyWebhookSignature } from "../middleware/webhookAuth";

// Add webhook verification middleware
router.post(
  "/webhook",
  verifyWebhookSignature(process.env.PAYMENT_WEBHOOK_SECRET || ""),
  async (req: Request, res: Response) => {
    try {
      const data = req.body;
      console.log("💰 Payment Webhook Verified:", JSON.stringify(data, null, 2));

      // ... existing webhook logic ...
    } catch (error) {
      console.error("Webhook error:", error);
      res.sendStatus(500);
    }
  }
);
```

**Environment Variables Required:**
```bash
# Add to .env.example
PAYMENT_WEBHOOK_SECRET=your-secret-key-from-paystack-or-hubtel
```

**✓ Verification:**
- [ ] Webhook rejects requests without signature
- [ ] Webhook rejects requests with invalid signature
- [ ] Webhook accepts requests with valid signature
- [ ] Paystack/Hubtel configured with webhook secret
- [ ] Test webhook signature verification

---

## Phase 2: High-Priority Fixes (NEXT SPRINT)

### ✅ 10. Implement Comprehensive Input Validation with Zod
**Status:** ⏳ Not Started  
**Effort:** ⏱️ 2-3 days  
**Risk if Not Fixed:** HIGH  

**Create `server/src/schemas/index.ts`:**
```typescript
import { z } from "zod";

// User & Auth Schemas
export const RegisterSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/\d/, "Must contain number"),
  name: z.string().min(2).max(100),
  phone: z
    .string()
    .regex(/^(02|05)\d{8}$/, "Invalid Ghana phone number (02x or 05x)")
    .optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Shipping Schema
export const ShippingInfoSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  phone: z.string().regex(/^(02|05)\d{8}$/, "Invalid Ghana phone number"),
  address: z.string().min(5).max(200),
  city: z.string().min(1).max(50),
  region: z.string().min(1).max(50),
  postalCode: z.string().optional(),
});

// Order Schema
export const CreateOrderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1),
  total: z.number().positive(),
  shippingInfo: ShippingInfoSchema,
  paymentMethod: z.enum(["card", "momo", "cash", "paystack"]),
});

// Product Schema
export const CreateProductSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  category: z.string().uuid(),
  description: z.string().optional(),
  image: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  stockQuantity: z.number().int().nonnegative(),
  inStock: z.boolean(),
  features: z.record(z.string()).optional(),
});
```

**Create `server/src/middleware/validate.ts`:**
```typescript
import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export function validate(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      const validated = await schema.parseAsync(req.body);
      req.body = validated;  // Replace with validated data
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          issues: error.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
}
```

**Update Routes to Use Validation:**
```typescript
// server/src/routes/auth.ts
import { validate } from "../middleware/validate";
import { RegisterSchema, LoginSchema } from "../schemas";

router.post("/register", validate(RegisterSchema), async (req, res) => {
  try {
    // req.body is now validated
    const { email, password, name, phone } = req.body;
    // ... rest of implementation
  } catch (error) {
    // ... error handling
  }
});

router.post("/login", authLimiter, validate(LoginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    // ... rest of implementation
  } catch (error) {
    // ... error handling
  }
});

// server/src/routes/orders.ts
router.post("/", validate(CreateOrderSchema), async (req, res) => {
  try {
    const { items, total, shippingInfo, paymentMethod } = req.body;
    // All fields now validated
  } catch (error) {
    // ... error handling
  }
});
```

**✓ Verification:**
- [ ] Invalid emails rejected
- [ ] Invalid phone numbers rejected
- [ ] Negative prices rejected
- [ ] Empty arrays rejected
- [ ] Proper error messages returned
- [ ] All critical routes validated

---

## Phase 3: Medium-Priority Fixes (FOLLOWING SPRINT)

### ✅ 11. Implement Service Layer
**Status:** ⏳ Not Started  
**Effort:** ⏱️ 2-3 days  
**Risk if Not Fixed:** MEDIUM  

**Create `server/src/services/OrderService.ts`:**
```typescript
import { v4 as uuidv4 } from "uuid";
import db from "../db/database";
import { notificationService } from "./NotificationService";

export class OrderService {
  async createOrder(
    items: any[],
    total: number,
    shippingInfo: any,
    userId?: string
  ) {
    const orderId = uuidv4();
    const guestId = `guest_${uuidv4().substring(0, 8)}`;

    // Validate inventory
    await this.validateInventory(items);

    // Insert order
    const result = await db.query(
      `INSERT INTO orders (id, "guestId", "userId", items, total, "shippingInfo", status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        orderId,
        guestId,
        userId || null,
        JSON.stringify(items),
        total,
        JSON.stringify(shippingInfo),
        "pending",
      ]
    );

    const order = result.rows[0];

    // Send confirmation email (async, don't block)
    notificationService
      .sendOrderConfirmation(orderId, shippingInfo, items)
      .catch((err) => console.error("Failed to send confirmation:", err));

    return order;
  }

  async getOrder(id: string) {
    const result = await db.query("SELECT * FROM orders WHERE id = $1", [id]);
    return result.rows[0];
  }

  async updateOrderStatus(id: string, status: string) {
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    const result = await db.query(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    return result.rows[0];
  }

  private async validateInventory(items: any[]) {
    // Check stock for each item
    for (const item of items) {
      const result = await db.query(
        `SELECT "stockQuantity" FROM products WHERE id = $1`,
        [item.id]
      );

      if (result.rowCount === 0) {
        throw new Error(`Product ${item.id} not found`);
      }

      const stock = result.rows[0].stockQuantity;
      if (stock < item.quantity) {
        throw new Error(
          `Insufficient stock for product ${item.id}. Available: ${stock}`
        );
      }
    }
  }
}

export const orderService = new OrderService();
```

**Update Routes:**
```typescript
// server/src/routes/orders.ts
import { orderService } from "../services/OrderService";

router.post("/", async (req, res) => {
  try {
    const order = await orderService.createOrder(
      req.body.items,
      req.body.total,
      req.body.shippingInfo,
      req.user?.id
    );
    res.status(201).json({ success: true, order });
  } catch (error) {
    // ... error handling
  }
});

router.get("/:id", async (req, res) => {
  try {
    const order = await orderService.getOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    // ... error handling
  }
});
```

---

### ✅ 12. Add Comprehensive Audit Logging
**Status:** ⏳ Not Started  
**Effort:** ⏱️ 2 days  
**Risk if Not Fixed:** MEDIUM  

**Create `server/src/services/AuditService.ts`:**
```typescript
import db from "../db/database";
import { v4 as uuidv4 } from "uuid";

export type AuditAction =
  | "user_login"
  | "user_logout"
  | "user_register"
  | "user_password_change"
  | "order_created"
  | "order_status_change"
  | "payment_processed"
  | "admin_login"
  | "admin_logout"
  | "product_created"
  | "product_updated"
  | "product_deleted";

export class AuditService {
  async log(
    action: AuditAction,
    userId: string,
    details: any,
    ipAddress?: string
  ) {
    try {
      await db.query(
        `INSERT INTO audit_logs (id, action, "userId", details, "ipAddress", "createdAt")
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          uuidv4(),
          action,
          userId,
          JSON.stringify(details),
          ipAddress,
        ]
      );
    } catch (error) {
      console.error("Failed to log audit event:", error);
      // Don't throw - logging shouldn't break the request
    }
  }

  async getAuditLog(userId: string, limit: number = 100) {
    const result = await db.query(
      `SELECT * FROM audit_logs WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }
}

export const auditService = new AuditService();
```

**Create audit table:**
```sql
CREATE TABLE