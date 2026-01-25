import Database, { type Database as DatabaseType } from "better-sqlite3";
import path from "node:path";

// Initialize database in the server directory
const dbPath = path.join(__dirname, "../../data/sherotech.db");
const db: DatabaseType = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Create tables
export function initializeDatabase() {
  // Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      originalPrice REAL,
      image TEXT,
      images TEXT,
      rating REAL DEFAULT 0,
      reviews INTEGER DEFAULT 0,
      badge TEXT,
      inStock INTEGER DEFAULT 1,
      description TEXT,
      features TEXT,
      specifications TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT
    )
  `);

  // Orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      guestId TEXT NOT NULL,
      userId TEXT,
      items TEXT NOT NULL,
      total REAL NOT NULL,
      shippingInfo TEXT NOT NULL,
      paymentMethod TEXT,
      status TEXT DEFAULT 'pending',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Users table (Customers)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User Sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expiresAt TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Admin users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Sessions table for admin authentication
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      adminId TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expiresAt TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (adminId) REFERENCES admin_users(id) ON DELETE CASCADE
    )
  `);

  // Reviews table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      userName TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  // Add stockQuantity column if it doesn't exist (safe migration)
  try {
    db.exec(
      `ALTER TABLE products ADD COLUMN stockQuantity INTEGER DEFAULT 100`,
    );
    console.log("📦 Added stockQuantity column to products");
  } catch {
    // Column already exists, ignore
  }

  // Add userId column to orders if it doesn't exist
  try {
    db.exec(`ALTER TABLE orders ADD COLUMN userId TEXT`);
    console.log("📦 Added userId column to orders");
  } catch {
    // Column already exists
  }

  // Add email verification columns to users
  try {
    db.exec(`ALTER TABLE users ADD COLUMN emailVerified INTEGER DEFAULT 0`);
    console.log("📧 Added emailVerified column to users");
  } catch {
    // Column already exists
  }

  try {
    db.exec(`ALTER TABLE users ADD COLUMN verificationToken TEXT`);
    console.log("📧 Added verificationToken column to users");
  } catch {
    // Column already exists
  }

  try {
    db.exec(`ALTER TABLE users ADD COLUMN verificationExpiry TEXT`);
    console.log("📧 Added verificationExpiry column to users");
  } catch {
    // Column already exists
  }

  // Add shippingAddress column to users for profile management
  try {
    db.exec(`ALTER TABLE users ADD COLUMN shippingAddress TEXT`);
    console.log("📦 Added shippingAddress column to users");
  } catch {
    // Column already exists
  }

  console.log("📦 Database initialized successfully");
}

export default db;
