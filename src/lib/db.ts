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

  // Optimization: Use port 6543 (Transaction Mode) if the URL is Supabase and port 5432 is found
  const optimizedConnectionString = connectionString?.includes("pooler.supabase.com:5432")
    ? connectionString.replace(":5432", ":6543")
    : connectionString;

  // Manually parse to ensure all fields are correctly typed
  const dbConfig: Record<string, unknown> = optimizedConnectionString ? parse(optimizedConnectionString) : {};
  // Remove any parsed ssl/sslmode to avoid pg v8 deprecation warning —
  // we set ssl explicitly below based on the host.
  delete dbConfig.ssl;

  const host = String(dbConfig.host || "");
  const isLocalhost = host === "localhost" || host === "127.0.0.1" || host === "::1";

  const poolConfig: PoolConfig = {
    ...dbConfig,
    // Serverless optimization: keep max low per container to avoid pool exhaustion
    max: process.env.NODE_ENV === "production" ? 5 : 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 8000,
    statement_timeout: 30000, // 30s timeout
    ssl: !isLocalhost ? { rejectUnauthorized: false } : false,
  };

  // Singleton for Next.js hot-reloading
  const globalForDb = global as unknown as { pool: Pool };
  
  if (!globalForDb.pool) {
    console.log(`[DB] Creating new pool connected to host: ${poolConfig.host}:${poolConfig.port}`);
    globalForDb.pool = new Pool(poolConfig);
  }
  
  pool = globalForDb.pool;

  return pool;
}

export const db = drizzle(getPool(), { schema });

export default {
  getPool,
  db,
};
