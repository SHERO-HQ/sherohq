import { Pool, PoolConfig } from "pg";
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
    process.env.POSTGRES_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.DATABASE_URL,
  ];

  const validUrl = candidates.find(
    (url) => typeof url === "string" && url.trim().length > 0 && !url.includes("127.0.0.1") && !url.includes("localhost")
  ) || candidates.find(
    (url) => typeof url === "string" && url.trim().length > 0
  );

  const connectionString = validUrl || "";

  if (!connectionString) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL or POSTGRES_URL is not defined");
    } else {
      console.warn("⚠️ [DB] DATABASE_URL or POSTGRES_URL is not defined. Check your .env.local file.");
    }
  }

  const isLocalhost = connectionString.includes("localhost") || connectionString.includes("127.0.0.1") || connectionString.includes("::1");

  const poolConfig: PoolConfig = {
    connectionString,
    // Serverless optimization: keep max low per container to avoid pool exhaustion
    max: process.env.NODE_ENV === "production" ? 10 : 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    statement_timeout: 30000, // 30s timeout
    ssl: !isLocalhost ? { rejectUnauthorized: false } : false,
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
