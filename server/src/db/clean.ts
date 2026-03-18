import db from "./database";
import { seedAdminUser } from "./seed";

async function cleanDatabase() {
  try {
    console.log("🗑️ Cleaning database...");
    await db.query("BEGIN");

    // Tables to truncate
    const tables = [
      "reviews",
      "tickets",
      "consultations",
      "inquiries",
      "newsletter_subscribers",
      "orders",
      "user_sessions",
      "users",
      "products",
      "categories",
      "activity_logs",
      "sessions",
      "admin_users",
      "support_guides",
    ];

    console.log(`Truncating tables: ${tables.join(", ")}`);

    // Truncate all listed tables
    await db.query(
      `TRUNCATE TABLE ${tables.join(", ")} RESTART IDENTITY CASCADE`,
    );

    await db.query("COMMIT");
    console.log("✅ Database cleaned successfully.");

    // Re-seed admin user to ensure access
    console.log("👤 Restoring default admin user...");
    await seedAdminUser();
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("❌ Error cleaning database:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the script
cleanDatabase();
