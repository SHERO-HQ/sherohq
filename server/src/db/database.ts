import { Pool, Client } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Always use SSL for Supabase
  max: 20, // Increased pool size
  idleTimeoutMillis: 60000, // 60 seconds
  connectionTimeoutMillis: 60000, // 60 seconds - allow time for initialization
});

// Helper to query the database with logging
export const query = async (text: string, params?: unknown[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 100) {
      // Log slow queries (> 100ms)
      console.log(
        `🐢 Slow Query (${duration}ms): ${text.substring(0, 200)}...`,
      );
    } else if (process.env.DEBUG === "true") {
      console.log(`⏱️ DB Query (${duration}ms): ${text.substring(0, 100)}...`);
    }
    return res;
  } catch (err) {
    const duration = Date.now() - start;
    console.error(
      `❌ [DB Error] (${duration}ms) Query: ${text.substring(0, 500)}`,
    );
    console.error(`[DB Error] Params:`, params);
    console.error(
      `[DB Error] Message:`,
      err instanceof Error ? err.message : err,
    );
    throw err;
  }
};

// Create tables
export async function initializeDatabase() {
  console.log("🔌 Attempting to connect to the database...");

  // Use a direct client for initialization to bypass pooler issues with DDL
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    console.log(
      "📡 Connected to database. Running migrations/initialization...",
    );

    // Products table
    console.log("📦 Initializing products table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        sku TEXT UNIQUE,
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
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
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
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Users table (Customers)
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
        "expiresAt" TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Admin users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        "passwordHash" TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        avatar TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sessions table for admin authentication
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        "adminId" TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        "expiresAt" TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
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
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
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

    // --- PERFORMANCE INDEXES ---
    console.log("⚡ Creating performance indexes...");

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

    console.log("⚡ Indexes ensured.");

    console.log("📦 Database initialized successfully");
  } catch (err) {
    console.error("❌ Error initializing database:", err);
    throw err;
  } finally {
    await client.end();
  }
}

export default { query };
