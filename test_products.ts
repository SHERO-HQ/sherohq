import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function run() {
  const { query } = await import("./src/lib/db.ts");

  console.log("Fetching products...");
  try {
    let queryText = `
      SELECT
        p.*,
        COALESCE(c_by_id.name, c_by_name.name) as category_name,
        COALESCE(c_by_id.id, c_by_name.id) as resolved_category_id
      FROM products p
      LEFT JOIN categories c_by_id ON p.category = c_by_id.id
      LEFT JOIN categories c_by_name ON p.category = c_by_name.name
      ORDER BY p."createdAt" DESC LIMIT $1 OFFSET $2
    `;
    const res = await query(queryText, [50, 0]);
    console.log("Success. Rows:", res.rows.length);
  } catch (err) {
    console.error("Error executing query:", err);
  }
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
