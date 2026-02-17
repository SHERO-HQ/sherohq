import db from "../db/database";

async function forceReset() {
  try {
    console.log("🔄 Forcing password reset for user@sherohq.com...");

    const res = await db.query(
      `UPDATE users 
       SET "passwordResetRequired" = true, "passwordUpdatedAt" = NOW() - INTERVAL '1 year'
       WHERE email = $1 
       RETURNING id, name, email`,
      ["user@sherohq.com"],
    );

    if (res.rowCount === 0) {
      console.log("⚠️ User not found! Creating default user...");
      const { seedDefaultUser } = await import("../db/seed");
      await seedDefaultUser();

      // Retry update
      const res2 = await db.query(
        `UPDATE users 
         SET "passwordResetRequired" = true, "passwordUpdatedAt" = NOW() - INTERVAL '1 year'
         WHERE email = $1 
         RETURNING id, name, email`,
        ["user@sherohq.com"],
      );

      if (res2.rowCount === 0) {
        console.error("❌ Failed to create/update user!");
        process.exit(1);
      }
      console.log(
        `✅ User ${res2.rows[0].email} created and forced to reset password.`,
      );
      process.exit(0);
    }

    console.log(`✅ User ${res.rows[0].email} forced to reset password.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

forceReset();
