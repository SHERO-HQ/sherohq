import { v4 as uuidv4 } from "uuid";
import { db } from "./db";
import { sql } from "drizzle-orm";

/**
 * Log an administrative activity to the database
 */
export async function logActivity(
  adminId: string | null,
  action: string,
  type: string = "info",
  details?: string
) {
  try {
    await db.execute(sql`
      INSERT INTO activity_logs (id, "adminId", action, type, details) VALUES (${uuidv4()}, ${adminId}, ${action}, ${type}, ${details})
    `);
  } catch (error) {
    console.error("❌ [Activity Log Error]:", error);
  }
}
