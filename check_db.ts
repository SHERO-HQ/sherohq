import { Pool } from "pg";
import * as dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.join(process.cwd(), "server/.env") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  const res = await pool.query("SELECT COUNT(*) FROM products");
  console.log("Total Products:", res.rows[0].count);

  const categories = await pool.query("SELECT * FROM categories limit 10");
  console.log("Categories:", categories.rows);

  if (res.rows[0].count > 0) {
    const sample = await pool.query(
      'SELECT name, category, "inStock" FROM products LIMIT 5',
    );
    console.log("Sample Products:", sample.rows);
  }
} catch (err) {
  console.error("Error:", err);
} finally {
  await pool.end();
}
