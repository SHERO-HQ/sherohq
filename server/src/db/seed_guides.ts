import db from "./database";
import { v4 as uuidv4 } from "uuid";

export async function seedGuides() {
  try {
    const existingRes = await db.query(
      "SELECT COUNT(*) as count FROM support_guides",
    );
    if (Number(existingRes.rows[0].count) > 0) {
      console.log("📚 Guides already seeded, skipping...");
      return;
    }

    const adminRes = await db.query("SELECT id FROM admin_users LIMIT 1");
    const adminId = adminRes.rows[0]?.id || null;

    const guides = [
      {
        title: "How to set up your Shero Laptop",
        slug: "setup-shero-laptop",
        summary:
          "A complete guide to getting started with your new Shero professional laptop.",
        content:
          "## Getting Started\n\n1. Unbox your laptop...\n2. Connect to power...\n3. Press the power button...",
        category: "hardware",
        published: true,
      },
      {
        title: "Software Installation Guide",
        slug: "software-installation-guide",
        summary:
          "Learn how to install and update essential software on your Shero device.",
        content:
          "## Software Basics\n\nFollow these steps to install software...",
        category: "software",
        published: true,
      },
      {
        title: "Troubleshooting Power Issues",
        slug: "troubleshooting-power",
        summary: "Common solutions for power and battery related problems.",
        content: "## Power Issues\n\nIf your laptop doesn't turn on...",
        category: "hardware",
        published: true,
      },
    ];

    await db.query("BEGIN");
    for (const guide of guides) {
      await db.query(
        `INSERT INTO support_guides (id, title, slug, content, summary, category, "authorId", published)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          uuidv4(),
          guide.title,
          guide.slug,
          guide.content,
          guide.summary,
          guide.category,
          adminId,
          guide.published,
        ],
      );
    }
    await db.query("COMMIT");
    console.log(`✅ Seeded ${guides.length} support guides.`);
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error seeding guides:", error);
  }
}
