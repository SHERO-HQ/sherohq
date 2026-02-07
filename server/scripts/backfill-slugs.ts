import * as dotenv from "dotenv";
import path from "path";

// Load env before importing db
dotenv.config({ path: path.join(__dirname, "../.env") });

async function backfillSlugs() {
  console.log("🚀 Starting slug backfill...");
  try {
    const dbModule = await import("../src/db/database");
    const db = dbModule.default;

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
        const count = check.rowCount || 0;

        if (count > 0 && check.rows[0].id !== p.id) {
          slug = `${slug}-${p.id.slice(0, 4)}`;
        }

        await db.query("UPDATE products SET slug = $1 WHERE id = $2", [
          slug,
          p.id,
        ]);
        console.log(`✅ Updated: ${p.name} -> ${slug}`);
        updatedCount++;
      } else {
        console.log(`ℹ️  Skipping: ${p.name} (already has slug: ${p.slug})`);
      }
    }

    console.log(`✨ Backfill complete. Updated ${updatedCount} products.`);
  } catch (err) {
    console.error("❌ Backfill failed:", err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

backfillSlugs();
