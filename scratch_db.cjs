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
    const res = await pool.query("SELECT * FROM categories ORDER BY name ASC");
    console.log("Categories:", res.rows);
  } catch (err) {
    console.error("Query Failed:", err);
  } finally {
    pool.end();
  }
}

test();
