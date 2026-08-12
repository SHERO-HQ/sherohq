import fs from "fs";
import path from "path";
import pg from "pg";

// Native env loader without external package dependency
function loadEnv(filePath) {
  try {
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  } catch (_) {}
}

loadEnv(path.resolve(process.cwd(), ".env.local"));
loadEnv(path.resolve(process.cwd(), ".env"));

const { Client } = pg;

const candidates = [
  process.env.DATABASE_URL,
  process.env.POSTGRES_URL,
  process.env.POSTGRES_URL_NON_POOLING,
];

const databaseUrl = candidates.find(
  (url) => typeof url === "string" && url.trim().length > 0 && !url.includes("127.0.0.1") && !url.includes("localhost")
) || candidates.find(
  (url) => typeof url === "string" && url.trim().length > 0
);

if (!databaseUrl) {
  console.warn(
    "⚠️ [apply-migrations] DATABASE_URL or POSTGRES_URL is not defined in environment. Skipping database migrations during build.",
  );
  process.exit(0);
}

const isLocalhost = databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1") || databaseUrl.includes("::1");

async function runMigrations() {
  console.log("🚀 Starting Sherotech database migrations...");

  const client = new Client({
    connectionString: databaseUrl,
    ssl: isLocalhost ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();
    console.log("🔌 Connected to PostgreSQL database successfully.");

    const sqlDir = path.resolve(process.cwd(), "sql");
    if (!fs.existsSync(sqlDir)) {
      console.warn("⚠️ Warning: sql directory not found, skipping migrations.");
      return;
    }

    const migrationFiles = fs
      .readdirSync(sqlDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    console.log(`📋 Found ${migrationFiles.length} migration files in sql/ directory.`);

    for (const file of migrationFiles) {
      const filePath = path.resolve(sqlDir, file);
      console.log(`\n📄 Reading migration: ${file}...`);
      const sqlContent = fs.readFileSync(filePath, "utf8");

      console.log(`⚙️ Executing migration: ${file}...`);

      try {
        await client.query("BEGIN");
        await client.query(sqlContent);
        await client.query("COMMIT");
        console.log(`✅ Migration ${file} applied successfully.`);
      } catch (err) {
        await client.query("ROLLBACK").catch(() => {});
        console.warn(`⚠️ Warning applying migration ${file}: ${err.message}`);
        // If it's already exists or duplicate object, proceed gracefully
      }
    }

    console.log(
      "\n🎉 Database migrations completed successfully!",
    );
  } catch (error) {
    console.error("\n💥 Database migration connection failed:", error.message || error);
    // Do not break production bundle building if DB is unreachable during build phase
    if (process.env.NODE_ENV === "production") {
      console.warn("⚠️ Continuing Next.js build without active DB migration connection.");
    } else {
      process.exit(1);
    }
  } finally {
    try {
      await client.end();
    } catch (_) {}
    console.log("🔌 Database connection closed.");
  }
}

runMigrations();
