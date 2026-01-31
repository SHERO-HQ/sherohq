import { Router, Response } from "express";
import db from "../db/database";
import { adminAuth, AdminRequest } from "../middleware/adminAuth";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// GET /api/admin/activity - Get recent activity logs
router.get("/activity", adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const result = await db.query(`
      SELECT al.*, au.username as "adminName"
      FROM activity_logs al
      LEFT JOIN admin_users au ON al."adminId" = au.id
      ORDER BY al."createdAt" DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
});

// POST /api/admin/activity - Create a new activity log
export async function logActivity(
  adminId: string,
  action: string,
  type: string = "info",
  details?: string,
) {
  try {
    await db.query(
      'INSERT INTO activity_logs (id, "adminId", action, type, details) VALUES ($1, $2, $3, $4, $5)',
      [uuidv4(), adminId, action, type, details],
    );
  } catch (error) {
    console.error("Error logging activity:", error);
  }
}

export default router;
