import { Pool } from "pg";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

async function migrate() {
  console.log("🚀 Starting migration...");
  const client = await pool.connect();
  try {
    console.log(
      '📡 Connected to database. Adding "avatar" column to "admin_users"...',
    );
    await client.query(
      "ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS avatar TEXT;",
    );
    console.log(
      '✅ Migration successful: "avatar" column added or already exists.',
    );

    console.log('📡 Adding "slug" column to "products"...');
    await client.query(
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;",
    );
    console.log(
      '✅ Migration successful: "slug" column added or already exists.',
    );
    console.log(
      '✅ Migration successful: "avatar" column added or already exists.',
    );
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
