import { Router, Response } from "express";
import db from "../db/database";
import { adminAuth, AdminRequest, requireRole } from "../middleware/adminAuth";

const router = Router();

interface UserRow {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

interface OrderRow {
  id: string;
  total: string;
  status: string;
  createdAt: string;
  items: string;
}

// Get user statistics for dashboard - MUST be before /:id route
router.get(
  "/stats/overview",
  adminAuth,
  requireRole("manager"),
  async (_req: AdminRequest, res: Response) => {
    try {
      const [totalRes, verifiedRes, recentRes] = await Promise.all([
        db.query("SELECT COUNT(*) as total FROM users"),
        db.query(
          'SELECT COUNT(*) as verified FROM users WHERE "emailVerified" = true',
        ),
        db.query(
          `SELECT COUNT(*) as recent FROM users WHERE "createdAt" > NOW() - INTERVAL '30 days'`,
        ),
      ]);

      res.json({
        totalUsers: Number.parseInt(totalRes.rows[0].total),
        verifiedUsers: Number.parseInt(verifiedRes.rows[0].verified),
        newUsersThisMonth: Number.parseInt(recentRes.rows[0].recent),
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ error: "Failed to fetch user statistics" });
    }
  },
);

// Get all users with pagination and search
router.get(
  "/",
  adminAuth,
  requireRole("manager"),
  async (req: AdminRequest, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1;
    const limit = Number.parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || "";
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, email, name, phone, avatar, "emailVerified", "isActive", "createdAt"
      FROM users
    `;
    let countQuery = `SELECT COUNT(*) as total FROM users`;
    const params: (string | number)[] = [];
    const countParams: string[] = [];

    if (search) {
      const searchCondition = ` WHERE name ILIKE $1 OR email ILIKE $1`;
      query += searchCondition;
      countQuery += searchCondition;
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    query += ` ORDER BY "createdAt" DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const [usersRes, countRes] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, countParams),
    ]);

    const users = usersRes.rows as UserRow[];
    const total = Number.parseInt(countRes.rows[0].total);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get user details with order history
router.get(
  "/:id",
  adminAuth,
  requireRole("manager"),
  async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Get user details
    const userRes = await db.query(
      `SELECT id, email, name, phone, avatar, "emailVerified", "isActive", "shippingAddress", "createdAt"
       FROM users WHERE id = $1`,
      [id],
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userRes.rows[0];

    // Get user's orders
    const ordersRes = await db.query(
      `SELECT id, total, status, "createdAt", items
       FROM orders WHERE "userId" = $1
       ORDER BY "createdAt" DESC
       LIMIT 20`,
      [id],
    );

    const orders = ordersRes.rows as OrderRow[];

    // Calculate user stats
    const stats = {
      totalOrders: orders.length,
      totalSpent: orders.reduce(
        (sum, order) => sum + Number.parseFloat(order.total),
        0,
      ),
      lastOrderDate: orders.length > 0 ? orders[0].createdAt : null,
    };

    res.json({
      user,
      orders: orders.map((order) => ({
        ...order,
        items: JSON.parse(order.items),
      })),
      stats,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});

// Update user (e.g., toggle active status, update info)
router.patch(
  "/:id",
  adminAuth,
  requireRole("admin"),
  async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, emailVerified, isActive } = req.body;

    const updates: string[] = [];
    const values: (string | boolean | string[])[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(phone);
    }
    if (emailVerified !== undefined) {
      updates.push(`"emailVerified" = $${paramIndex++}`);
      values.push(emailVerified);
    }
    if (isActive !== undefined) {
      updates.push(`"isActive" = $${paramIndex++}`);
      values.push(isActive);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(id);
    const result = await db.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values,
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Revoke all sessions when deactivating the account
    if (isActive === false) {
      await db.query('DELETE FROM user_sessions WHERE "userId" = $1', [id]);
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Reset password — forces user to change password on next login
router.post(
  "/:id/reset-password",
  adminAuth,
  requireRole("admin"),
  async (req: AdminRequest, res: Response) => {
    try {
      const { id } = req.params;

      const userRes = await db.query(
        "SELECT id, email, name FROM users WHERE id = $1",
        [id],
      );
      if (userRes.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      // Flag account for mandatory password reset
      await db.query(
        'UPDATE users SET "passwordResetRequired" = true WHERE id = $1',
        [id],
      );

      // Invalidate all existing sessions so the user must log in again
      await db.query('DELETE FROM user_sessions WHERE "userId" = $1', [id]);

      console.log(
        `🔑 Password reset flagged for user: ${userRes.rows[0].email}`,
      );

      res.json({
        success: true,
        message: "User will be prompted to set a new password on next login.",
      });
    } catch (error) {
      console.error("Error resetting user password:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  },
);

// Delete user account
router.delete(
  "/:id",
  adminAuth,
  requireRole("admin"),
  async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const userRes = await db.query("SELECT id FROM users WHERE id = $1", [id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete user (cascade will handle related records)
    await db.query("DELETE FROM users WHERE id = $1", [id]);

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
