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

// Helper to query the database with logging
export const query = async (text: string, params?: unknown[]) => {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    console.error(`[DB Error] Query: ${text.substring(0, 500)}`);
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

    // Migration: Convert TEXT columns to JSONB if they are still TEXT
    const tablesToMigrate = [
      { table: "products", columns: ["images", "features", "specifications"] },
      { table: "orders", columns: ["items", "shippingInfo"] },
      { table: "users", columns: ["shippingAddress"] },
    ];

    for (const { table, columns } of tablesToMigrate) {
      for (const column of columns) {
        try {
          // Check column type
          const typeRes = await client.query(
            `
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = $1 AND column_name = $2
          `,
            [table, column],
          );

          if (
            typeRes.rows[0]?.data_type === "text" ||
            typeRes.rows[0]?.data_type === "character varying"
          ) {
            console.log(
              `🔄 Migrating ${table}.${column} from TEXT to JSONB...`,
            );
            await client.query(`
              ALTER TABLE ${table} 
              ALTER COLUMN "${column}" TYPE JSONB USING "${column}"::JSONB
            `);
          }
        } catch (error_) {
          console.warn(`⚠️ Migration failed for ${table}.${column}:`, error_);
        }
      }
    }

    // Migration: Add missing columns to users if they don't exist
    try {
      await client.query(
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT`,
      );
      await client.query(
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true`,
      );
      await client.query(
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer'`,
      );
    } catch (error_) {
      console.warn("⚠️ Migration failed for users table:", error_);
    }

    // Ensure phone column exists in tickets table (migration)
    try {
      await client.query(
        `ALTER TABLE tickets ADD COLUMN IF NOT EXISTS phone TEXT`,
      );
    } catch {
      // Column might already exist
    }

    // Ensure ticket_no column exists in tickets table (migration)
    try {
      await client.query(
        `ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ticket_no SERIAL`,
      );
      // Set sequence to start from 100000 for 6-7 digit ticket numbers
      await client.query(
        `SELECT setval(pg_get_serial_sequence('tickets', 'ticket_no'), GREATEST(100000, (SELECT COALESCE(MAX(ticket_no), 0) FROM tickets)))`,
      );
    } catch {
      // Column might already exist
    }

    // Migration: Add condition column to products if it doesn't exist
    try {
      await client.query(
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'New'`,
      );
    } catch {
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
