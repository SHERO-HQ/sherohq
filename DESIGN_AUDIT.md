# Design & Architecture Audit Report - SheroTech E-Commerce Platform

**Date**: 2024  
**Project**: SheroTech E-Commerce Platform  
**Scope**: Application architecture, design patterns, system design, scalability, and maintainability

---

## Executive Summary

SheroTech demonstrates a **well-structured full-stack architecture** with clear separation of concerns between frontend, backend, and infrastructure. The design choices are modern and appropriate for an e-commerce platform. However, there are opportunities for improvement in:

1. **State management complexity** (Context API over Redux/Zustand)
2. **API design consistency** and documentation
3. **Code organization** and module boundaries
4. **Testing coverage** and strategy
5. **Performance optimization** opportunities
6. **Error handling** standardization

**Overall Architecture Score**: 7.5/10  
**Scalability**: Good - Ready for growth with minor improvements  
**Maintainability**: Good - Clear structure, some refactoring opportunities

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Frontend Architecture Analysis](#frontend-architecture-analysis)
3. [Backend Architecture Analysis](#backend-architecture-analysis)
4. [Database Design Review](#database-design-review)
5. [API Design Review](#api-design-review)
6. [Code Organization](#code-organization)
7. [Performance & Scalability](#performance--scalability)
8. [Design Patterns & Best Practices](#design-patterns--best-practices)
9. [Recommendations](#recommendations)

---

## Architecture Overview

### System Architecture Diagram (Conceptual)

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ React 19 + TypeScript                                   │   │
│  │ - Components (UI/checkout/products)                     │   │
│  │ - Context API (Auth, Cart, Theme, Wishlist)           │   │
│  │ - React Query (TanStack) for data fetching             │   │
│  │ - React Router for routing                             │   │
│  │ - Tailwind CSS + Motion for styling                    │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/HTTPS
                             │ (CORS protected)
┌────────────────────────────▼────────────────────────────────────┐
│                    API SERVER (Node.js/Express)                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Routes Layer (15+ endpoints)                            │   │
│  │ - /api/products                                         │   │
│  │ - /api/orders                                           │   │
│  │ - /api/admin (protected)                                │   │
│  │ - /api/payments (Paystack/Hubtel integration)          │   │
│  │ - /api/auth (user authentication)                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Middleware Layer                                        │   │
│  │ - adminAuth (Bearer token validation)                   │   │
│  │ - csrfProtection (custom header check)                  │   │
│  │ - rateLimit (express-rate-limit)                        │   │
│  │ - helmet (security headers)                             │   │
│  │ - cors (origin validation)                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Services Layer                                          │   │
│  │ - NotificationService (email via Resend/SMTP)          │   │
│  │ - PaymentService (Paystack/Hubtel integration)         │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │ SQL (SSL)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                  PostgreSQL (Supabase)                          │
│  - 15+ tables (products, orders, users, admin_users, etc.)    │
│  - Indexed for performance                                     │
│  - Foreign key constraints                                     │
│  - JSON/JSONB fields for flexible data                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│              External Services                                  │
│  - Supabase Storage (file uploads)                              │
│  - Resend/SMTP (email notifications)                            │
│  - Paystack/Hubtel (payment processing)                         │
└─────────────────────────────────────────────────────────────────┘
```

### Key Technology Choices

| Layer | Technology | Rating | Notes |
|-------|-----------|--------|-------|
| Frontend Framework | React 19 | ⭐⭐⭐⭐⭐ | Modern, ecosystem mature |
| Frontend Language | TypeScript | ⭐⭐⭐⭐⭐ | Strong type safety |
| State Management | Context API | ⭐⭐⭐ | Works for current scale, may need improvement |
| Data Fetching | TanStack Query | ⭐⭐⭐⭐⭐ | Excellent choice, proper caching |
| Styling | Tailwind CSS v4 | ⭐⭐⭐⭐⭐ | Modern, utility-first, good DX |
| Animations | Framer Motion | ⭐⭐⭐⭐ | Solid choice, well-integrated |
| Backend Framework | Express.js | ⭐⭐⭐⭐ | Lightweight, mature ecosystem |
| Backend Language | TypeScript | ⭐⭐⭐⭐⭐ | Type safety on backend crucial |
| Database | PostgreSQL | ⭐⭐⭐⭐⭐ | Excellent choice for e-commerce |
| Authentication | Bearer Tokens | ⭐⭐⭐ | Works, but no refresh token pattern |
| Testing | Vitest/Playwright | ⭐⭐⭐ | Good setup, coverage could be higher |

---

## Frontend Architecture Analysis

### Current Structure

```
src/
├── components/
│   ├── checkout/          # Checkout flow components
│   ├── products/          # Product display components
│   ├── common/            # Reusable UI components
│   ├── motion/            # Animation components
│   ├── ui/                # Shadcn/Radix UI components
│   └── ...
├── context/               # React Context (Auth, Cart, Theme)
├── hooks/                 # Custom hooks
│   └── queries/           # React Query hooks
├── pages/                 # Route pages
├── services/              # API service functions
├── constants/             # Constants (emails, contacts)
├── types/                 # TypeScript interfaces
└── utils/                 # Utility functions
```

### Strengths ✅

1. **Clear Component Hierarchy**: Components well-organized by feature
2. **Context API for Global State**: Works well for auth, theme, cart
3. **React Query Integration**: Excellent for server state management
4. **Type Safety**: Comprehensive TypeScript usage
5. **CSS Framework**: Tailwind CSS provides consistency
6. **Responsive Design**: Mobile-first approach
7. **Accessibility**: WCAG AA compliance mentioned

### Issues & Concerns ⚠️

#### 1. **State Management Scattered Across Multiple Contexts**

**Issue**: Authentication, cart, wishlist, theme, and notifications each have separate Context providers

```typescript
// Current approach - Multiple contexts
const [user, setUser] = useState();
const [cart, setCart] = useState();
const [wishlist, setWishlist] = useState();
const [theme, setTheme] = useState();
const [notification, setNotification] = useState();

// Creates 5+ context rerenders on every update
```

**Problem**:
- Context causes unnecessary rerenders of entire subtrees
- No memoization prevents optimization
- Difficult to debug state flow
- Performance degrades as app grows

**Recommendation**:
```typescript
// Option 1: Consolidate contexts
const AppStateContext = createContext({
  auth: { user, isLoading, error },
  ui: { theme, notification },
  cart: { items, total },
});

// Option 2: Use Zustand or Redux for complex state
import { create } from 'zustand';

const useAppStore = create((set) => ({
  user: null,
  cart: [],
  setUser: (user) => set({ user }),
  addToCart: (item) => set((state) => ({
    cart: [...state.cart, item]
  })),
}));

// Usage: const { user, cart, setUser } = useAppStore();
```

**Migration Path**:
1. Extract Context logic to custom hook: `useAuthStore()`
2. Replace with Zustand: `const useAuthStore = create(...)`
3. Update all components to use new hook
4. Remove Context providers

---

#### 2. **localStorage Token Management Vulnerability**

**Current Implementation**:
```typescript
// AuthContext.tsx
localStorage.setItem("userToken", token);
localStorage.setItem("adminToken", token);
```

**Problems**:
- XSS attacks can steal tokens
- No automatic cleanup on expiration
- No encryption of tokens at rest
- Observable by any JavaScript on the page

**Recommendation**: Implement secure token storage
```typescript
// Option 1: Use httpOnly cookies (requires backend changes)
// Backend: res.cookie('token', token, { httpOnly: true, secure: true })
// Frontend: Auto-sent with fetch(url, { credentials: 'include' })

// Option 2: If localStorage required, encrypt tokens
import CryptoJS from 'crypto-js';

const storeToken = (token: string) => {
  const encrypted = CryptoJS.AES.encrypt(token, 'secret-key').toString();
  localStorage.setItem('token', encrypted);
};

const getToken = () => {
  const encrypted = localStorage.getItem('token');
  if (!encrypted) return null;
  const decrypted = CryptoJS.AES.decrypt(encrypted, 'secret-key').toString(CryptoJS.enc.Utf8);
  return decrypted;
};

// Option 3: Use sessionStorage + shorter expiry
sessionStorage.setItem('token', token); // Cleared on tab close
```

---

#### 3. **Missing Component Props Validation**

**Current Approach**: Props types defined but no runtime validation

```typescript
// No validation - props could be wrong type at runtime
interface ProductCardProps {
  product: Product;
  onAddToCart: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  // No guarantee product has required fields
  return <div>{product.name}</div>;
};
```

**Recommendation**: Add runtime validation
```typescript
import { z } from 'zod';

const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  price: z.number().positive(),
  image: z.string().url().optional(),
});

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const validated = ProductSchema.parse(product);
  return <div>{validated.name}</div>;
};
```

---

#### 4. **API Service Functions Need Standardization**

**Current State**: `src/services/api.ts` is large with inconsistent patterns

```typescript
// Inconsistent error handling
export async function fetchProducts() {
  const response = await fetch(...);
  return handleResponse<Product[]>(response);
}

export async function createOrder() {
  const response = await authFetch(...);
  return handleResponse<Order>(response);
  // But what if handleResponse throws?
}
```

**Issues**:
- No consistent retry logic
- Error types inconsistent
- No request deduplication
- Missing request/response interceptors

**Recommendation**: Create API client class
```typescript
class ApiClient {
  private baseUrl: string;
  private retryConfig = { maxRetries: 3, delay: 1000 };

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries = 0
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: this.getHeaders(),
        ...options,
      });

      if (!response.ok) {
        throw new ApiError(response.status, response.statusText);
      }

      return response.json() as Promise<T>;
    } catch (error) {
      if (retries < this.retryConfig.maxRetries && this.isRetryable(error)) {
        await delay(this.retryConfig.delay);
        return this.request<T>(endpoint, options, retries + 1);
      }
      throw error;
    }
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`,
      'X-CSRF-Protection': '1',
    };
  }

  private isRetryable(error: unknown): boolean {
    return error instanceof ApiError && [408, 429, 500, 502, 503, 504].includes(error.status);
  }
}
```

---

#### 5. **Missing Error Boundary Implementation**

**Current State**: No error boundaries in component tree

**Risk**: Single component error crashes entire app

**Recommendation**: Add error boundaries
```typescript
import { useErrorHandler } from 'react-error-boundary';

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundaryComponent fallback={<ErrorFallback />}>
      {children}
    </ErrorBoundaryComponent>
  );
}

function ErrorFallback() {
  return (
    <div className="error-container">
      <h1>Something went wrong</h1>
      <button onClick={() => window.location.reload()}>Reload Page</button>
    </div>
  );
}

// In App.tsx
<ErrorBoundary>
  <Routes>...</Routes>
</ErrorBoundary>
```

---

#### 6. **Testing Coverage Low**

**Current State**: 
- `api.test.ts` exists but coverage unclear
- No component unit tests visible
- E2E tests with Playwright (good)

**Issues**:
- No snapshot tests for components
- No integration tests for workflows
- No visual regression tests

**Recommendation**: Implement testing strategy
```typescript
// Component test example
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductCard from './ProductCard';

describe('ProductCard', () => {
  it('should display product name and price', () => {
    const product = { id: '1', name: 'iPhone', price: 999 };
    render(<ProductCard product={product} />);
    
    expect(screen.getByText('iPhone')).toBeInTheDocument();
    expect(screen.getByText('$999')).toBeInTheDocument();
  });

  it('should call onAddToCart when button clicked', async () => {
    const onAddToCart = vi.fn();
    const product = { id: '1', name: 'iPhone', price: 999 };
    
    render(<ProductCard product={product} onAddToCart={onAddToCart} />);
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    
    expect(onAddToCart).toHaveBeenCalledWith('1');
  });
});
```

---

### Frontend Design Recommendations Summary

| Issue | Priority | Effort | Impact |
|-------|----------|--------|--------|
| Consolidate state management | High | 2-3 days | Medium |
| Secure token storage | Critical | 1-2 days | High |
| Add runtime prop validation | Medium | 1 day | Low |
| Standardize API client | High | 1-2 days | Medium |
| Add error boundaries | Medium | 1 day | Medium |
| Improve test coverage | Medium | 2-3 days | Medium |

---

## Backend Architecture Analysis

### Current Structure

```
server/src/
├── index.ts                # Express app setup
├── db/
│   ├── database.ts        # Connection pool & queries
│   ├── migrate.ts         # Schema creation
│   ├── seed.ts            # Data seeding
│   └── ...
├── middleware/
│   ├── adminAuth.ts       # Bearer token validation
│   └── csrfProtection.ts  # CSRF header check
├── routes/                # 15+ route handlers
│   ├── products.ts
│   ├── orders.ts
│   ├── admin.ts
│   ├── auth.ts
│   ├── payments.ts
│   └── ...
├── services/
│   ├── NotificationService.ts  # Email sending
│   └── PaymentService.ts       # Payment processing
└── utils/
    └── sku.ts             # SKU generation
```

### Strengths ✅

1. **Clear Route Organization**: Each feature has dedicated route file
2. **Middleware Pattern**: Authentication, CSRF, rate limiting as middleware
3. **Service Layer**: Business logic separated (Notifications, Payments)
4. **Database Abstraction**: Custom query wrapper with logging
5. **TypeScript**: Full type coverage
6. **Environment Management**: dotenv for configuration

### Issues & Concerns ⚠️

#### 1. **Missing Service Layer Abstraction**

**Current Problem**: Route handlers directly query database

```typescript
// routes/orders.ts - Business logic mixed with HTTP handling
router.post('/admin', adminAuth, async (req, res) => {
  const { items, total, shippingInfo } = req.body;
  
  // Database query directly in route
  await db.query(
    `INSERT INTO orders (id, "guestId", "userId", items, total, ...)
     VALUES ($1, $2, $3, $4, $5, ...)`,
    [orderId, guestId, req.admin?.id, JSON.stringify(items), total, ...]
  );
});
```

**Problems**:
- Tight coupling between HTTP and database layers
- Difficult to test business logic
- Duplication if same logic used in different routes
- Hard to implement transactions

**Recommendation**: Create service layer
```typescript
// services/OrderService.ts
class OrderService {
  async createOrder(
    items: OrderItem[],
    total: number,
    shippingInfo: ShippingInfo,
    userId?: string
  ): Promise<Order> {
    const orderId = uuidv4();
    
    try {
      await db.query('BEGIN');
      
      // Validate inventory
      await this.validateInventory(items);
      
      // Create order
      const result = await db.query(
        `INSERT INTO orders (...) VALUES (...)`,
        [orderId, ...]
      );
      
      // Update inventory
      await this.updateInventory(items);
      
      // Send notification
      await notificationService.sendOrderConfirmation(orderId);
      
      await db.query('COMMIT');
      
      return result.rows[0];
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }

  private async validateInventory(items: OrderItem[]) {
    // Business logic here
  }

  private async updateInventory(items: OrderItem[]) {
    // Update stock quantities
  }
}

// routes/orders.ts - Now much cleaner
router.post('/admin', adminAuth, async (req, res) => {
  try {
    const order = await orderService.createOrder(
      req.body.items,
      req.body.total,
      req.body.shippingInfo
    );
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});
```

---

#### 2. **No Dependency Injection**

**Current Problem**: Services instantiated inline

```typescript
// routes/payments.ts
const { notificationService } = await import("../services/NotificationService");
notificationService.sendPaymentReceipt(...);
```

**Issues**:
- Hard to mock in tests
- Circular dependency risks
- No clear dependency graph
- Difficult to swap implementations

**Recommendation**: Implement simple DI container
```typescript
// services/container.ts
class ServiceContainer {
  private services: Map<string, any> = new Map();

  register<T>(key: string, factory: () => T) {
    this.services.set(key, factory());
  }

  get<T>(key: string): T {
    const service = this.services.get(key);
    if (!service) throw new Error(`Service ${key} not registered`);
    return service;
  }
}

// Initialize in index.ts
const container = new ServiceContainer();
container.register('orderService', () => new OrderService(db));
container.register('notificationService', () => new NotificationService());
container.register('paymentService', () => new PaymentService());

// Export for use in routes
export { container };

// Use in routes
import { container } from '../services/container';

router.post('/orders', async (req, res) => {
  const orderService = container.get('orderService');
  const order = await orderService.createOrder(...);
});
```

---

#### 3. **Inconsistent Error Handling Across Routes**

**Current Pattern**: Each route has try-catch with different error responses

```typescript
// routes/auth.ts
catch (error: unknown) {
  console.error("Login error:", error);
  res.status(500).json({
    error: "Internal server error",
    details: error instanceof Error ? error.message : String(error),
  });
}

// routes/orders.ts
catch (error) {
  console.error("Order creation error:", error);
  res.status(500).json({ error: "Failed to create order" });
}

// Inconsistent error handling!
```

**Recommendation**: Implement error middleware
```typescript
// middleware/errorHandler.ts
class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message }),
  });
};

app.use(errorHandler);

// Usage in routes
router.post('/login', async (req, res, next) => {
  try {
    const user = await findUser(email);
    if (!user) {
      throw new ApiError(401, 'Invalid credentials', 'AUTH_FAILED');
    }
  } catch (error) {
    next(error);  // Pass to error handler
  }
});
```

---

#### 4. **Database Transactions Not Implemented**

**Current Problem**: Multi-step operations not atomic

```typescript
// If order creation succeeds but email fails, data is inconsistent
await db.query('INSERT INTO orders...');
await notificationService.sendOrderEmail(...);  // Could fail
```

**Recommendation**: Implement transaction support
```typescript
// db/database.ts
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Usage
await transaction(async (client) => {
  await client.query('INSERT INTO orders...');
  await client.query('INSERT INTO order_items...');
  // All succeed or all fail
});
```

---

#### 5. **No Request/Response Interceptors**

**Current State**: No way to intercept all requests/responses for logging, metrics, etc.

**Recommendation**: Add interceptor pattern
```typescript
// middleware/interceptors.ts
interface Request {
  id: string;
  startTime: number;
}

// Logging interceptor
app.use((req: Request, res: Response, next: NextFunction) => {
  req.id = uuidv4();
  req.startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    console.log({
      requestId: req.id,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
    });
  });
  
  next();
});

// Metrics interceptor
app.use((req, res, next) => {
  res.on('finish', () => {
    metrics.recordHttpRequest({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: Date.now() - req.startTime,
    });
  });
  next();
});
```

---

#### 6. **Missing API Documentation**

**Current State**: No OpenAPI/Swagger documentation

**Recommendation**: Add Swagger documentation
```typescript
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'SheroTech API',
    version: '1.0.0',
  },
  servers: [
    {
      url: 'https://api.sherohq.com',
      description: 'Production',
    },
  ],
  paths: {
    '/api/products': {
      get: {
        summary: 'Get all products',
        parameters: [
          {
            name: 'category',
            in: 'query',
            type: 'string',
          },
        ],
        responses: {
          200: {
            description: 'List of products',
            schema: { $ref: '#/components/schemas/Product' },
          },
        },
      },
    },
  },
};

const specs = swaggerJsdoc({ definition: swaggerDefinition });
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));
```

---

#### 7. **Health Check Implementation Too Basic**

**Current**:
```typescript
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});
```

**Recommendation**: Enhanced health check
```typescript
app.get('/api/health', async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    supabase: await checkSupabase(),
    memory: process.memoryUsage().heapUsed / 1024 / 1024, // MB
  };

  const isHealthy = checks.database && checks.supabase;
  
  res
    .status(isHealthy ? 200 : 503)
    .json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks,
      uptime: process.uptime(),
    });
});

async function checkDatabase() {
  try {
    const result = await db.query('SELECT 1');
    return result.rowCount === 1;
  } catch {
    return false;
  }
}
```

---

### Backend Design Recommendations Summary

| Issue | Priority | Effort | Impact |
|-------|----------|--------|--------|
| Create service layer | High | 2-3 days | High |
| Implement DI container | High | 1-2 days | Medium |
| Standardize error handling | High | 1-2 days | Medium |
| Add transaction support | High | 1 day | High |
| Add request interceptors | Medium | 1 day | Medium |
| Add API documentation | Medium | 1-2 days | Low |
| Enhance health checks | Low | 1 day | Low |

---

## Database Design Review

### Schema Analysis ✅

**Strengths**:
1. **Proper Normalization**: Tables well-designed with primary/foreign keys
2. **Indexes**: Performance indexes on frequently queried columns
3. **Timestamps**: Created/updated timestamps for audit trails
4. **Flexible Storage**: JSONB fields for varying data structures
5. **Constraints**: Foreign key constraints maintain referential integrity

### Issues & Concerns ⚠️

#### 1. **Cascading Deletes Too Aggressive**

**Current**:
```sql
CREATE TABLE activity_logs (
  id TEXT PRIMARY KEY,
  "adminId" TEXT REFERENCES admin_users(id) ON DELETE CASCADE
);
```

**Problem**: Deleting admin user deletes all their activity logs, losing audit trail

**Recommendation**: Use ON DELETE SET NULL or implement soft deletes
```sql
-- Option 1: Keep logs but orphan them
ALTER TABLE activity_logs 
  DROP CONSTRAINT activity_logs_adminid_fkey,
  ADD CONSTRAINT activity_logs_adminid_fkey
    FOREIGN KEY ("adminId") REFERENCES admin_users(id) ON DELETE SET NULL;

-- Option 2: Implement soft deletes
ALTER TABLE admin_users ADD COLUMN "deletedAt" TIMESTAMP;
ALTER TABLE activity_logs ADD COLUMN "deletedAt" TIMESTAMP;

-- Update queries to filter deleted records
SELECT * FROM admin_users WHERE "deletedAt" IS NULL;
```

---

#### 2. **Missing Indexes on Foreign Keys**

**Current**: Foreign keys exist but may not have indexes

**Recommendation**: Add indexes for performance
```sql
CREATE INDEX idx_orders_user_id ON orders("userId");
CREATE INDEX idx_orders_guest_id ON orders("guestId");
CREATE INDEX idx_user_sessions_user_id ON user_sessions("userId");
CREATE INDEX idx_sessions_admin_id ON sessions("adminId");
```

---

#### 3. **No Soft Delete Strategy**

**Problem**: Hard deletes lose data, audit trails break

**Recommendation**: Implement soft deletes pattern
```sql
-- Add deletedAt to all important tables
ALTER TABLE users ADD COLUMN "deletedAt" TIMESTAMP;
ALTER TABLE products ADD COLUMN "deletedAt" TIMESTAMP;
ALTER TABLE orders ADD COLUMN "deletedAt" TIMESTAMP;

-- Update queries
SELECT * FROM users WHERE "deletedAt" IS NULL;

-- Restore deleted records
UPDATE users SET "deletedAt" = NULL WHERE id = $1;
```

---

#### 4. **Inconsistent Data Types for JSON Storage**

**Current**: JSON stored as TEXT in some places, JSONB in others

```sql
-- Inconsistent
"shippingInfo" JSONB,
"verificationToken" TEXT,  -- Should be hashed, not stored plaintext
```

**Recommendation**: Standardize and secure sensitive data
```sql
-- Secure verification tokens
ALTER TABLE users DROP COLUMN "verificationToken";
ALTER TABLE users ADD COLUMN "verificationTokenHash" TEXT;
ALTER TABLE users ADD COLUMN "verificationTokenExpiry" TIMESTAMP;

-- Use JSONB for structured data
ALTER TABLE orders ALTER COLUMN "shippingInfo" TYPE JSONB USING "shippingInfo"::jsonb;
ALTER TABLE products ALTER COLUMN features TYPE JSONB USING features::jsonb;
```

---