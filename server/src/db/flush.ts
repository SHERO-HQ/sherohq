import db from "./database";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

async function flushTestData() {
  console.log("🧹 Starting database flush...");

  try {
    // Delete test data but keep products and categories
    await db.query("BEGIN");

    // Orders
    const ordersRes = await db.query("DELETE FROM orders");
    console.log(`🗑️ Deleted ${ordersRes.rowCount} orders`);

    // Tickets
    const ticketsRes = await db.query("DELETE FROM tickets");
    console.log(`🗑️ Deleted ${ticketsRes.rowCount} tickets`);

    // Inquiries
    const inquiriesRes = await db.query("DELETE FROM inquiries");
    console.log(`🗑️ Deleted ${inquiriesRes.rowCount} inquiries`);

    // Consultations
    const consultationsRes = await db.query("DELETE FROM consultations");
    console.log(`🗑️ Deleted ${consultationsRes.rowCount} consultations`);

    // Reviews
    const reviewsRes = await db.query("DELETE FROM reviews");
    console.log(`🗑️ Deleted ${reviewsRes.rowCount} reviews`);

    // Non-essential users (keep default user)
    const usersRes = await db.query(
      "DELETE FROM users WHERE email NOT IN ($1)",
      ["user@sherotech.com"],
    );
    console.log(`🗑️ Deleted ${usersRes.rowCount} test users`);

    await db.query("COMMIT");
    console.log("✅ Database flush complete.");
    process.exit(0);
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("❌ Error flushing database:", error);
    process.exit(1);
  }
}

// Execute the flush
flushTestData();
