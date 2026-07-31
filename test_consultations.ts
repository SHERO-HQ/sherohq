import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function run() {
  const { query } = await import("./src/lib/db.ts");

  console.log("Fetching recent consultations...");
  try {
    const res = await query(`SELECT * FROM consultations ORDER BY "createdAt" DESC LIMIT 5`);
    console.table(res.rows);
  } catch (err) {
    console.error("Error executing query:", err);
  }
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
