import path from "path";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const { Client } = pg;
const databaseUrl = process.env.DATABASE_URL;

async function inspectDb() {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes("supabase.com") ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();

    console.log("\n📦 MOST RECENT ORDERS:");
    const ordersRes = await client.query(`
      SELECT id, status, "paymentStatus", "paymentMessage", "paymentMethod", total, "createdAt"
      FROM orders
      ORDER BY "createdAt" DESC
      LIMIT 5
    `);
    ordersRes.rows.forEach((o, i) => {
      console.log(`\n--- Order #${i+1} ---`);
      console.log(`ID: ${o.id}`);
      console.log(`Status: ${o.status}`);
      console.log(`Payment Status: ${o.paymentStatus}`);
      console.log(`Payment Message: ${o.paymentMessage}`);
      console.log(`Payment Method: ${o.paymentMethod}`);
      console.log(`Total: GHS ${o.total}`);
      console.log(`Created At: ${o.createdAt}`);
    });

  } catch (err) {
    console.error("Error querying DB:", err);
  } finally {
    await client.end();
  }
}

inspectDb();
