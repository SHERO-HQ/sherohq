import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

// Helper to query the database
export const query = (text: string, params?: unknown[]) =>
  pool.query(text, params);

// Create tables
export async function initializeDatabase() {
  console.log("🔌 Attempting to connect to the database...");
  const client = await pool.connect();
  try {
    console.log(
      "📡 Connected to database. Running migrations/initialization...",
    );
    await client.query("BEGIN");

    // Products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        sku TEXT UNIQUE,
        category TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        "originalPrice" DECIMAL(10, 2),
        image TEXT,
        images TEXT,
        rating DECIMAL(3, 2) DEFAULT 0,
        reviews INTEGER DEFAULT 0,
        badge TEXT,
        "inStock" BOOLEAN DEFAULT true,
        "stockQuantity" INTEGER DEFAULT 100,
        description TEXT,
        features TEXT,
        specifications TEXT,
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
        items TEXT NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        "shippingInfo" TEXT NOT NULL,
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
        "shippingAddress" TEXT,
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

    // Ensure phone column exists in tickets table (migration)
    try {
      await client.query(
        `ALTER TABLE tickets ADD COLUMN IF NOT EXISTS phone TEXT`,
      );
    } catch (ignore) {
      // Column might already exist
    }

    // Ensure ticket_no column exists in tickets table (migration)
    try {
      await client.query(
        `ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ticket_no SERIAL`,
      );
    } catch (ignore) {
      // Column might already exist
    }

    await client.query("COMMIT");
    console.log("📦 Database initialized successfully");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error initializing database:", err);
    throw err;
  } finally {
    client.release();
  }
}

export default { query };
