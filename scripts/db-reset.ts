// Drops everything in the local database and re-applies all migrations.
// Refuses to run against anything but localhost.
import { execSync } from "node:child_process";
import postgres from "postgres";

const url = process.env.DATABASE_URL ?? "postgres://shero:shero@localhost:5432/shero";
const host = new URL(url).hostname;
if (!["localhost", "127.0.0.1", "db"].includes(host)) {
  console.error(`Refusing to reset a non-local database (${host}).`);
  process.exit(1);
}

const sql = postgres(url, { max: 1 });
await sql.unsafe("drop schema if exists public cascade; drop schema if exists drizzle cascade; create schema public;");
await sql.end();
execSync("yarn db:migrate", { stdio: "inherit", env: { ...process.env, DATABASE_URL: url } });
console.log("Local database reset.");
