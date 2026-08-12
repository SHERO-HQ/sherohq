import { Pool, PoolConfig } from "pg";
import { parse } from "pg-connection-string";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./drizzle/schema";

/**
 * Singleton database connection pool for Next.js
 * Prevents multiple pools being created during hot-reloads in development.
 */

let pool: Pool | null = null;

function getPool(): Pool {
  if (pool) return pool;

  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_URL_NON_POOLING,
  ];

  const validUrl = candidates.find(
    (url) => typeof url === "string" && url.trim().length > 0 && !url.includes("127.0.0.1") && !url.includes("localhost")
  ) || candidates.find(
    (url) => typeof url === "string" && url.trim().length > 0
  );

  const connectionString = validUrl || "";

  if (!connectionString) {
    if (process.env.NODE_ENV === "production") {
      console.error("❌ [DB] DATABASE_URL or POSTGRES_URL is not defined in production!");
    } else {
      console.warn("⚠️ [DB] DATABASE_URL or POSTGRES_URL is not defined. Check your .env.local file.");
    }
  }

  let dbConfig: Record<string, any> = {};
  if (connectionString) {
    try {
      dbConfig = parse(connectionString);
    } catch (e) {
      console.error("❌ [DB] Failed to parse connection string:", e);
    }
  }

  delete dbConfig.ssl;

  const host = String(dbConfig.host || "");
  const isLocalhost = !host || host === "localhost" || host === "127.0.0.1" || host === "::1";

  const poolConfig: PoolConfig = {
    user: dbConfig.user,
    password: dbConfig.password,
    host: dbConfig.host,
    port: dbConfig.port ? parseInt(String(dbConfig.port), 10) : 5432,
    database: dbConfig.database,
    // Serverless optimization: keep max low per container to avoid pool exhaustion
    max: process.env.NODE_ENV === "production" ? 10 : 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    statement_timeout: 30000, // 30s timeout
    ssl: isLocalhost ? false : { rejectUnauthorized: false },
  };

  // Singleton for Next.js hot-reloading
  const globalForDb = global as unknown as { pool: Pool };
  
  if (!globalForDb.pool) {
    globalForDb.pool = new Pool(poolConfig);
    globalForDb.pool.on("error", (err) => {
      console.error("❌ [DB Pool Error]:", err.message);
    });
  }
  
  pool = globalForDb.pool;

  return pool;
}

export const db = drizzle(getPool(), { schema });

export default {
  getPool,
  db,
};
