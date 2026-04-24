import { v4 as uuidv4 } from "uuid";
import { query } from "./db";

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
    await query(
      'INSERT INTO activity_logs (id, "adminId", action, type, details) VALUES ($1, $2, $3, $4, $5)',
      [uuidv4(), adminId, action, type, details]
    );
  } catch (error) {
    console.error("❌ [Activity Log Error]:", error);
  }
}
