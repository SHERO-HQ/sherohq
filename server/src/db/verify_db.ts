import db from "./database";

async function verifyCounts() {
  const tables = [
    "products",
    "categories",
    "orders",
    "admin_users",
    "users",
    "tickets",
    "consultations",
    "inquiries",
    "newsletter_subscribers",
    "support_guides",
    "activity_logs",
    "team_members",
    "testimonials",
    "site_stats",
  ];

  console.log("📊 Verifying Database Counts:");
  for (const table of tables) {
    try {
      const res = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`- ${table}: ${res.rows[0].count}`);
    } catch {
      console.error(
        `- ${table}: FAILED (Table may not exist or error during query)`,
      );
    }
  }
  process.exit(0);
}

verifyCounts();
