import { Pool, PoolConfig } from "pg";
import { parse } from "pg-connection-string";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./drizzle/schema";

/**
 * Singleton database connection pool for Next.js
 * Prevents multiple pools being created during hot-reloads in development.
 */

let pool: Pool | null = null;
let currentConnectionString = "";
let drizzleInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getPool(): Pool {
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

  if (pool && currentConnectionString === connectionString && connectionString !== "") {
    return pool;
  }

  if (pool) {
    try {
      pool.end().catch(() => {});
    } catch (_) {}
    pool = null;
    drizzleInstance = null;
  }

  currentConnectionString = connectionString;

  if (!connectionString) {
    const errorMsg = "Database connection string is missing. Please set DATABASE_URL or POSTGRES_URL in Vercel Project Settings -> Environment Variables.";
    console.error(`❌ [DB] ${errorMsg}`);
    throw new Error(errorMsg);
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
    max: process.env.NODE_ENV === "production" ? 10 : 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    statement_timeout: 30000,
    ssl: isLocalhost ? false : { rejectUnauthorized: false },
  };

  pool = new Pool(poolConfig);
  pool.on("error", (err) => {
    console.error("❌ [DB Pool Error]:", err.message);
  });

  return pool;
}

export function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  const currentPool = getPool();
  if (!drizzleInstance) {
    drizzleInstance = drizzle(currentPool, { schema });
  }
  return drizzleInstance;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop, receiver) {
    const activeDb = getDb();
    const value = Reflect.get(activeDb, prop, receiver);
    if (typeof value === "function") {
      return value.bind(activeDb);
    }
    return value;
  },
});

export default {
  getPool,
  getDb,
  db,
};
