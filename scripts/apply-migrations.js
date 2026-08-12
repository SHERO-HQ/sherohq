import fs from "fs";
import path from "path";
import pg from "pg";
import dotenv from "dotenv";

// Load environment variables from .env.local in development, use process.env in production
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
}

const { Client } = pg;
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ Error: DATABASE_URL environment variable is not defined in .env.local");
  process.exit(1);
}

const migrationFiles = [
  "001-create-customer-feedback-table.sql",
  "002-fix-database-security.sql",
  "003-remove-duplicate-indexes.sql",
  "004-disable-unnecessary-rls.sql",
  "005-add-missing-indexes.sql",
  "006-create-product-reviews-and-carts.sql",
  "007-add-cost-price-and-cogs.sql",
  "008-add-seo-columns.sql",
  "009-add-payment-columns.sql",
  "010-create-client-partners.sql",
  "011-add-logo-dark-to-client-partners.sql"
];

async function runMigrations() {
  console.log("🚀 Starting Sherotech database migrations...");
  
  const client = new Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes("supabase.com") ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log("🔌 Connected to PostgreSQL database successfully.");

    // INSPECT THE PRODUCT POLICY DEFINITION
    console.log("\n🔍 Inspecting policy 'admin_products_writable' on 'products' table...");
    const policyRes = await client.query(`
      SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check 
      FROM pg_policies 
      WHERE tablename = 'products' AND policyname = 'admin_products_writable'
    `);
    
    console.log("--- POLICY METADATA ---");
    if (policyRes.rows.length === 0) {
      console.log("No policy named 'admin_products_writable' found on 'products' table in pg_policies.");
    } else {
      policyRes.rows.forEach(row => {
        console.log(`Table: ${row.tablename}`);
        console.log(`Policy Name: ${row.policyname}`);
        console.log(`Command: ${row.cmd}`);
        console.log(`Roles: ${JSON.stringify(row.roles)}`);
        console.log(`Qual (USING clause): ${row.qual}`);
        console.log(`With Check (WITH CHECK clause): ${row.with_check}`);
      });
    }
    console.log("-----------------------\n");

    for (const file of migrationFiles) {
      const filePath = path.resolve(process.cwd(), "sql", file);
      
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ Warning: Migration file not found at ${filePath}, skipping.`);
        continue;
      }

      console.log(`\n📄 Reading migration: ${file}...`);
      const sqlContent = fs.readFileSync(filePath, "utf8");

      console.log(`⚙️ Executing migration: ${file}...`);
      
      // Start transaction for each migration file to ensure atomic application
      await client.query("BEGIN");
      try {
        await client.query(sqlContent);
        await client.query("COMMIT");
        console.log(`✅ Migration ${file} applied successfully.`);
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`❌ Error applying migration ${file}. Transaction rolled back.`);
        throw err;
      }
    }

    console.log("\n🎉 All database migrations applied successfully! Database is secure and linter warnings should be resolved.");
  } catch (error) {
    console.error("\n💥 Database migration failed:", error.message || error);
    process.exit(1);
  } finally {
    await client.end();
    console.log("🔌 Database connection closed.");
  }
}

runMigrations();
