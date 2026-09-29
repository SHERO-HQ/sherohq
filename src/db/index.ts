import "server-only";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Db = PostgresJsDatabase<typeof schema>;

// One pool per server process, reused across hot reloads in development.
// Created on first use, so builds without a database still succeed.
const globalForDb = globalThis as unknown as { sheroDb?: Db };

function connect(): Db {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. See .env.example.");
  return drizzle(postgres(url, { max: 5, prepare: false }), { schema });
}

export const db = new Proxy({} as Db, {
  get(_target, property) {
    globalForDb.sheroDb ??= connect();
    return Reflect.get(globalForDb.sheroDb, property);
  },
});
