import db from "../server/src/db/database";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

async function backfillSlugs() {
  console.log("🚀 Starting slug backfill...");
  try {
    const res = await db.query("SELECT id, name, slug FROM products");
    const products = res.rows;
    console.log(`📦 Found ${products.length} products to check.`);

    let updatedCount = 0;

    for (const p of products) {
      if (!p.slug) {
        let slug = p.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        // Simple collision avoidance
        const check = await db.query(
          "SELECT id FROM products WHERE slug = $1",
          [slug],
        );
        if (check.rowCount > 0 && check.rows[0].id !== p.id) {
          slug = `${slug}-${p.id.slice(0, 4)}`;
        }

        await db.query("UPDATE products SET slug = $1 WHERE id = $2", [
          slug,
          p.id,
        ]);
        console.log(`✅ Updated: ${p.name} -> ${slug}`);
        updatedCount++;
      }
    }

    console.log(`✨ Backfill complete. Updated ${updatedCount} products.`);
  } catch (err) {
    console.error("❌ Backfill failed:", err);
  } finally {
    // We cannot easily close the pool if it's exported from database.ts without an end() method exposed?
    // Looking at database.ts would tell, but usually process.exit works.
    process.exit(0);
  }
}

backfillSlugs();
