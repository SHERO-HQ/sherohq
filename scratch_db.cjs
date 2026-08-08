require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { parse } = require('pg-connection-string');

async function test() {
  const connectionString = process.env.DATABASE_URL.replace(":5432", ":6543");
  const dbConfig = parse(connectionString);
  delete dbConfig.ssl;

  const poolConfig = {
    ...dbConfig,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    statement_timeout: 30000,
    ssl: { rejectUnauthorized: false },
  };

  const pool = new Pool(poolConfig);

  try {
    console.log("Adding guestEmail and guestPhone to abandoned_carts...");
    await pool.query(`ALTER TABLE abandoned_carts ADD COLUMN IF NOT EXISTS "guestEmail" VARCHAR(255);`);
    await pool.query(`ALTER TABLE abandoned_carts ADD COLUMN IF NOT EXISTS "guestPhone" VARCHAR(50);`);
    console.log("Columns added successfully.");
  } catch (err) {
    console.error("Query Failed:", err);
  } finally {
    pool.end();
  }
}

test();
