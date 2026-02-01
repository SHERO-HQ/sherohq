import { Router, Response } from "express";
import db from "../db/database";
import { adminAuth, AdminRequest } from "../middleware/adminAuth";

const router = Router();

interface UserRow {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  emailVerified: boolean;
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
router.get("/", adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1;
    const limit = Number.parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || "";
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, email, name, phone, avatar, "emailVerified", "createdAt"
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
router.get("/:id", adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Get user details
    const userRes = await db.query(
      `SELECT id, email, name, phone, avatar, "emailVerified", "shippingAddress", "createdAt"
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
router.patch("/:id", adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, emailVerified } = req.body;

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

    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete user account
router.delete("/:id", adminAuth, async (req: AdminRequest, res: Response) => {
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
