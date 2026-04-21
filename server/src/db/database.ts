import { Pool, Client } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

function getDatabaseConnectionString(): string {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) {
    throw new Error("DATABASE_URL is not set");
  }

  // Some providers use postgres:// while others use postgresql://.
  return raw.startsWith("postgres://")
    ? raw.replace("postgres://", "postgresql://")
    : raw;
}

function getSslConfig(): false | { rejectUnauthorized: boolean } {
  // Set DATABASE_SSL=false to disable TLS for local/dev databases.
  const sslDisabled = process.env.DATABASE_SSL === "false";

  if (sslDisabled) return false;

  // Explicit env override always wins.
  if (process.env.DATABASE_SSL_ALLOW_SELF_SIGNED === "true") {
    return { rejectUnauthorized: false };
  }

  // Supabase pooler endpoints (*.pooler.supabase.com) serve TLS certificates
  // issued for *.supabase.co, which causes a hostname-mismatch rejection when
  // rejectUnauthorized is true.  Auto-detect and relax for these hosts.
  const dbUrl = process.env.DATABASE_URL ?? "";
  const isSupabasePooler = dbUrl.includes("pooler.supabase.com");

  if (isSupabasePooler) {
    return { rejectUnauthorized: false };
  }

  // Non-production environments: allow self-signed certs for convenience.
  if (process.env.NODE_ENV !== "production") {
    return { rejectUnauthorized: false };
  }

  // Default production: enforce strict TLS validation.
  return { rejectUnauthorized: true };
}

const connectionString = getDatabaseConnectionString();
const ssl = getSslConfig();

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString,
  ssl,
  max: 20, // Increased pool size
  idleTimeoutMillis: 30000, // Reduced to 30s to rotate connections more frequently
  connectionTimeoutMillis: 10000, // 10s is enough for pooler connection
});

// CRITICAL: Handle errors on idle clients in the pool to prevent uncaughtException crashes
pool.on("error", (err) => {
  console.error("💥 Unexpected error on idle database client:", err);
  // We don't exit here, the pool will handle creating new clients
});

// Helper to query the database with logging
// Helper to query the database with logging and auto-retry for transient errors
export const query = async (text: string, params?: unknown[], retries = 2) => {
  const start = Date.now();
  let attempt = 0;

  while (attempt <= retries) {
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      if (duration > 100) {
        console.log(
          `🐢 Slow Query (${duration}ms, Attempt ${attempt + 1}): ${text.substring(0, 200)}...`,
        );
      } else if (process.env.DEBUG === "true") {
        console.log(
          `⏱️ DB Query (${duration}ms, Attempt ${attempt + 1}): ${text.substring(0, 100)}...`,
        );
      }
      return res;
    } catch (err: any) {
      attempt++;
      const duration = Date.now() - start;

      // Retry on transient connection errors (ETIMEDOUT, ECONNRESET, etc.)
      const isTransient =
        err.code === "ETIMEDOUT" ||
        err.code === "ECONNRESET" ||
        err.message?.includes("terminated") ||
        err.message?.includes("timeout");

      if (isTransient && attempt <= retries) {
        const delay = attempt * 500; // 500ms, 1000ms
        console.warn(
          `⚠️ [DB Retry] Attempt ${attempt} failed with ${err.code || err.message}. Retrying in ${delay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      console.error(
        `❌ [DB Error] (${duration}ms, Final Attempt) Query: ${text.substring(0, 500)}`,
      );
      console.error(`[DB Error] Params:`, params);
      console.error(
        `[DB Error] Message:`,
        err instanceof Error ? err.message : err,
      );
      throw err;
    }
  }
  throw new Error("Maximum retries reached for database query");
};

export const getClient = async () => pool.connect();

export async function checkDatabaseHealth(timeoutMs = 5000): Promise<{
  ok: boolean;
  latencyMs: number;
  error?: string;
}> {
  const start = Date.now();

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      const timer = setTimeout(() => {
        clearTimeout(timer);
        reject(
          new Error(`Database health check timed out after ${timeoutMs}ms`),
        );
      }, timeoutMs);
    });

    await Promise.race([pool.query("SELECT 1"), timeoutPromise]);

    return {
      ok: true,
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : "Unknown DB health error",
    };
  }
}

// Create tables
export async function initializeDatabase() {
  const host = connectionString.split("@")[1]?.split(":")[0] || "unknown host";
  console.log(`🔌 Attempting to connect to the database (Host: ${host})...`);

  // Use a direct client for initialization to bypass pooler issues with DDL
  const client = new Client({
    connectionString,
    ssl,
    connectionTimeoutMillis: 60000, // Increased to 60s for initialization
  });

  const maxRetries = 3;
  let retryCount = 0;
  let lastError: Error | null = null;

  while (retryCount < maxRetries) {
    try {
      const retryDelay = retryCount * 2000; // Exponential backoff: 0s, 2s, 4s
      if (retryCount > 0) {
        console.log(
          `🔄 Retry attempt ${retryCount}/${maxRetries} to connect to DB (Delay: ${retryDelay}ms)...`,
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        console.log("🛠️ Starting DB connection handshake...");
      }

      await client.connect();

      console.log(
        `📡 Connected to database (Host: ${host}) after ${retryCount + 1} attempt(s). Running migrations/initialization...`,
      );
      break; // Exit loop on success
    } catch (err) {
      retryCount++;
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(
        `❌ DB Connection attempt ${retryCount}/${maxRetries} failed:`,
        lastError.message,
      );

      if (retryCount >= maxRetries) {
        console.error("💥 All database connection attempts failed.");
        throw lastError;
      }
    }
  }

  try {

    // Products table
    console.log("📦 Initializing products table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        sku TEXT UNIQUE,
        slug TEXT UNIQUE,
        category TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        "originalPrice" DECIMAL(10, 2),
        image TEXT,
        images JSONB,
        rating DECIMAL(3, 2) DEFAULT 0,
        reviews INTEGER DEFAULT 0,
        badge TEXT,
        "inStock" BOOLEAN DEFAULT true,
        "stockQuantity" INTEGER DEFAULT 100,
        description TEXT,
        features JSONB,
        specifications JSONB,
        condition TEXT DEFAULT 'New',
        "isSpotlight" BOOLEAN DEFAULT false,
        "isFeatured" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migration: add slug, condition, isSpotlight, and isFeatured columns to existing products tables
    await client.query(`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS slug TEXT,
      ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'New',
      ADD COLUMN IF NOT EXISTS "isSpotlight" BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN DEFAULT false;
    `);

    // Backward-compat migration for older schemas that predate camelCase timestamp columns.
    await client.query(`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    // Categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT
      )
    `);

    // Orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        "guestId" TEXT NOT NULL,
        "userId" TEXT,
        items JSONB NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        "shippingInfo" JSONB NOT NULL,
        "paymentMethod" TEXT,
        status TEXT DEFAULT 'pending',
        "orderAccessTokenHash" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "referralCode" TEXT
      )
    `);

    // Users table (Customers)
    await client.query(`
          ALTER TABLE orders ADD COLUMN IF NOT EXISTS "referralCode" TEXT;
        `);

    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS "orderAccessTokenHash" TEXT;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        "passwordHash" TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        avatar TEXT,
        "emailVerified" BOOLEAN DEFAULT false,
        "verificationToken" TEXT,
        "verificationExpiry" TEXT,
        "isActive" BOOLEAN DEFAULT true,
        role TEXT DEFAULT 'customer',
        "shippingAddress" JSONB,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User Sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        "expiresAt" TIMESTAMPTZ NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      ALTER TABLE user_sessions
      ALTER COLUMN "expiresAt" TYPE TIMESTAMPTZ
      USING "expiresAt"::timestamptz;
    `);

    // Admin users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        "passwordHash" TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        phone TEXT,
        avatar TEXT,
        "passwordResetRequired" BOOLEAN DEFAULT true,
        "passwordUpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sessions table for admin authentication
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        "adminId" TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        "expiresAt" TIMESTAMPTZ NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      ALTER TABLE sessions
      ALTER COLUMN "expiresAt" TYPE TIMESTAMPTZ
      USING "expiresAt"::timestamptz;
    `);

    // Support Tickets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        ticket_no SERIAL,
        "userId" TEXT REFERENCES users(id) ON DELETE SET NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        category TEXT NOT NULL,
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'open',
        "productId" TEXT REFERENCES products(id) ON DELETE SET NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // AI Chat Logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_chat_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "guestId" TEXT,
        "userId" TEXT,
        query TEXT NOT NULL,
        response TEXT NOT NULL,
        intent TEXT,
        "recommendedProducts" JSONB,
        "hasImage" BOOLEAN DEFAULT false,
        "source" TEXT DEFAULT 'general',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      ALTER TABLE ai_chat_logs ADD COLUMN IF NOT EXISTS "source" TEXT DEFAULT 'general';
    `);

    // Catalog Gaps table
    await client.query(`
      CREATE TABLE IF NOT EXISTS catalog_gaps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "keyword" TEXT UNIQUE NOT NULL,
        "queryCount" INTEGER DEFAULT 1,
        "lastRequested" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "isResolved" BOOLEAN DEFAULT false
      )
    `);

    // Reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        "productId" TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        "userName" TEXT NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Activity Logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id TEXT PRIMARY KEY,
        "adminId" TEXT REFERENCES admin_users(id) ON DELETE SET NULL,
        action TEXT NOT NULL,
        details TEXT,
        type TEXT DEFAULT 'info',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Consultations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS consultations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        service TEXT NOT NULL,
        date TIMESTAMP NOT NULL,
        time TEXT NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'pending',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Inquiries table
    await client.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Newsletter subscribers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        name TEXT,
        source TEXT DEFAULT 'footer',
        status TEXT DEFAULT 'active',
        "unsubscribeToken" TEXT UNIQUE NOT NULL,
        "subscribedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "unsubscribedAt" TIMESTAMP,
        "lastCampaignAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Newsletter campaigns table
    await client.query(`
      CREATE TABLE IF NOT EXISTS newsletter_campaigns (
        id TEXT PRIMARY KEY,
        channel TEXT DEFAULT 'email',
        subject TEXT NOT NULL,
        content TEXT NOT NULL,
        status TEXT DEFAULT 'draft',
        "audienceStatus" TEXT DEFAULT 'active',
        "audienceSource" TEXT,
        "audienceSubscribedAfter" TIMESTAMP,
        "audienceSubscribedBefore" TIMESTAMP,
        "recipientLimit" INTEGER,
        "batchSize" INTEGER DEFAULT 100,
        "sendDelayMs" INTEGER DEFAULT 0,
        "isTest" BOOLEAN DEFAULT false,
        "testEmail" TEXT,
        "testPhone" TEXT,
        "whatsappTemplateName" TEXT,
        "whatsappTemplateLanguage" TEXT,
        "whatsappTemplateParams" JSONB,
        "totalTargets" INTEGER DEFAULT 0,
        "sentCount" INTEGER DEFAULT 0,
        "failedCount" INTEGER DEFAULT 0,
        "scheduledAt" TIMESTAMP,
        "sentAt" TIMESTAMP,
        "createdBy" TEXT REFERENCES admin_users(id) ON DELETE SET NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      ALTER TABLE newsletter_campaigns
      ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'email';
    `);

    await client.query(`
      ALTER TABLE newsletter_subscribers
      ADD COLUMN IF NOT EXISTS phone TEXT;
    `);

    await client.query(`
      ALTER TABLE newsletter_campaigns
      ADD COLUMN IF NOT EXISTS "testPhone" TEXT;
    `);

    await client.query(`
      ALTER TABLE newsletter_campaigns
      ADD COLUMN IF NOT EXISTS "whatsappTemplateName" TEXT;
    `);

    await client.query(`
      ALTER TABLE newsletter_campaigns
      ADD COLUMN IF NOT EXISTS "whatsappTemplateLanguage" TEXT;
    `);

    await client.query(`
      ALTER TABLE newsletter_campaigns
      ADD COLUMN IF NOT EXISTS "whatsappTemplateParams" JSONB;
    `);

    // Projects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        client TEXT,
        description TEXT,
        "useCase" TEXT,
        technologies JSONB,
        image TEXT,
        link TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Support Guides table (for hardware/software articles)
    await client.query(`
      CREATE TABLE IF NOT EXISTS support_guides (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        content TEXT NOT NULL,
        summary TEXT,
        category TEXT NOT NULL,
        "authorId" TEXT REFERENCES admin_users(id) ON DELETE SET NULL,
        "coverImage" TEXT,
        published BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Team Members table
    await client.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        bio TEXT,
        image TEXT,
        social JSONB,
        "order" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Testimonials table
    await client.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id TEXT PRIMARY KEY,
        quote TEXT NOT NULL,
        author TEXT NOT NULL,
        role TEXT,
        company TEXT,
        image TEXT,
        "order" INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        "externalSource" TEXT,
        "externalId" TEXT,
        rating INTEGER,
        "reviewUrl" TEXT,
        "publishedAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      ALTER TABLE testimonials
      ADD COLUMN IF NOT EXISTS "externalSource" TEXT,
      ADD COLUMN IF NOT EXISTS "externalId" TEXT,
      ADD COLUMN IF NOT EXISTS rating INTEGER,
      ADD COLUMN IF NOT EXISTS "reviewUrl" TEXT,
      ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP;
    `);

    // Site Stats table
    await client.query(`
      CREATE TABLE IF NOT EXISTS site_stats (
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        value TEXT NOT NULL,
        suffix TEXT,
        prefix TEXT,
        icon TEXT,
        color TEXT,
        "order" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Expenses table
    await client.query(`
          CREATE TABLE IF NOT EXISTS expenses (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            category TEXT NOT NULL,
            date TIMESTAMP NOT NULL,
            description TEXT,
            "adminId" TEXT REFERENCES admin_users(id) ON DELETE SET NULL,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

    // Migration: Add phone, password_reset_required, and password_updated_at to admin_users
    await client.query(`
      ALTER TABLE admin_users 
      ADD COLUMN IF NOT EXISTS phone TEXT,
      ADD COLUMN IF NOT EXISTS "passwordResetRequired" BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS "passwordUpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
    `);

    // Migration: Add passwordResetRequired and passwordUpdatedAt to users
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS "passwordResetRequired" BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS "passwordUpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    // --- PERFORMANCE INDEXES ---
    console.log("⚡ Creating performance indexes...");

    // Expenses
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date)",
    );
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category)",
    );

    // Products
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)",
    );
    await client.query(
      'CREATE INDEX IF NOT EXISTS idx_products_created_at ON products("createdAt")',
    );
    await client.query(
      'CREATE INDEX IF NOT EXISTS idx_products_stock ON products("stockQuantity")',
    );

    // Orders
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)",
    );
    await client.query(
      'CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders("createdAt")',
    );
    await client.query(
      'CREATE INDEX IF NOT EXISTS idx_orders_composite ON orders(status, "createdAt")',
    );
    await client.query(
      'CREATE INDEX IF NOT EXISTS idx_orders_access_token_hash ON orders("orderAccessTokenHash")',
    );

    // Sessions (critical for authentication performance)
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)",
    );
    await client.query(
      'CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions("expiresAt")',
    );

    // Admin users
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_admin_users_id ON admin_users(id)",
    );

    // Activity logs
    await client.query(
      'CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs("createdAt" DESC)',
    );
    await client.query(
      'CREATE INDEX IF NOT EXISTS idx_activity_logs_admin ON activity_logs("adminId")',
    );

    // Reviews indexes
    await client.query(
      'CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews("productId")',
    );
    await client.query(
      'CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews("createdAt" DESC)',
    );

    // Categories index
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name)",
    );

    // Testimonials indexes
    await client.query(
      'CREATE INDEX IF NOT EXISTS idx_testimonials_order_created ON testimonials("order", "createdAt" DESC)',
    );
    await client.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_testimonials_external_unique ON testimonials("externalSource", "externalId")',
    );

    // Newsletter subscribers indexes
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers(status)",
    );
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email)",
    );
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_phone ON newsletter_subscribers(phone)",
    );
    await client.query(
      'CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_token ON newsletter_subscribers("unsubscribeToken")',
    );

    // Newsletter campaign indexes
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status ON newsletter_campaigns(status)",
    );
    await client.query(
      'CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_scheduled ON newsletter_campaigns("scheduledAt")',
    );
    await client.query(
      'CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_created ON newsletter_campaigns("createdAt" DESC)',
    );
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_channel ON newsletter_campaigns(channel)",
    );

    console.log("⚡ Indexes ensured.");

    console.log("📦 Database initialized successfully");
  } catch (err) {
    console.error("❌ Error initializing database:", err);
    throw err;
  } finally {
    await client.end();
  }
}

export default { query, getClient, checkDatabaseHealth };
