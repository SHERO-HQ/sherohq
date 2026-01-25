import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import db from "../db/database";
import { adminAuth, AdminRequest } from "../middleware/adminAuth";

const router = Router();

interface AdminUserRow {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: string;
}

// POST /api/admin/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    // Find admin by username or email
    const result = await db.query(
      `
      SELECT * FROM admin_users 
      WHERE username = $1 OR email = $2
    `,
      [username, username],
    );

    const admin = result.rows[0] as AdminUserRow | undefined;

    if (!admin) {
      return res.status(401).json({ error: "Wrong username" });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Wrong password" });
    }

    // Create session token
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Delete any existing sessions for this admin
    await db.query('DELETE FROM sessions WHERE "adminId" = $1', [admin.id]);

    // Create new session
    await db.query(
      `
      INSERT INTO sessions (id, "adminId", token, "expiresAt")
      VALUES ($1, $2, $3, $4)
    `,
      [uuidv4(), admin.id, token, expiresAt.toISOString()],
    );

    console.log(`🔐 Admin login: ${admin.username}`);

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed", details: error.message });
  }
});

// POST /api/admin/logout
router.post("/logout", adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      await db.query("DELETE FROM sessions WHERE token = $1", [token]);
    }

    console.log(`🔓 Admin logout: ${req.admin?.username}`);
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
});

// GET /api/admin/me - Get current admin user
router.get("/me", adminAuth, (req: AdminRequest, res: Response) => {
  res.json({
    success: true,
    admin: req.admin,
  });
});

// POST /api/admin/register - Create new admin (protected, superadmin only)
router.post(
  "/register",
  adminAuth,
  async (req: AdminRequest, res: Response) => {
    try {
      // Only superadmin can create new admins
      if (req.admin?.role !== "superadmin") {
        return res.status(403).json({ error: "Insufficient privileges" });
      }

      const { username, email, password, role = "admin" } = req.body;

      if (!username || !email || !password) {
        return res
          .status(400)
          .json({ error: "Username, email, and password required" });
      }

      // Check if username or email already exists
      const check = await db.query(
        `
      SELECT id FROM admin_users WHERE username = $1 OR email = $2
    `,
        [username, email],
      );

      if (check.rowCount && check.rowCount > 0) {
        return res
          .status(409)
          .json({ error: "Username or email already exists" });
      }

      // Hash password and create admin
      const passwordHash = await bcrypt.hash(password, 10);
      const adminId = uuidv4();

      await db.query(
        `
      INSERT INTO admin_users (id, username, email, "passwordHash", role)
      VALUES ($1, $2, $3, $4, $5)
    `,
        [adminId, username, email, passwordHash, role],
      );

      console.log(
        `👤 New admin created: ${username} by ${req.admin?.username}`,
      );

      res.status(201).json({
        success: true,
        admin: {
          id: adminId,
          username,
          email,
          role,
        },
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ error: "Failed to create admin" });
    }
  },
);

// GET /api/admin/stats - Dashboard statistics
router.get("/stats", adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const productCountRes = await db.query(
      "SELECT COUNT(*) as count FROM products",
    );
    const orderCountRes = await db.query(
      "SELECT COUNT(*) as count FROM orders",
    );
    const totalRevenueRes = await db.query(
      "SELECT COALESCE(SUM(total), 0) as total FROM orders",
    );

    // Low stock: <= 10 and in stock
    const lowStockCountRes = await db.query(
      'SELECT COUNT(*) as count FROM products WHERE "stockQuantity" <= 10 AND "stockQuantity" > 0',
    );

    // Out of stock: 0 stock or explicitly out of stock
    const outOfStockCountRes = await db.query(
      'SELECT COUNT(*) as count FROM products WHERE "inStock" = $1 OR "stockQuantity" = 0',
      [false],
    );

    const pendingOrdersRes = await db.query(
      "SELECT COUNT(*) as count FROM orders WHERE status = 'pending'",
    );

    res.json({
      products: Number(productCountRes.rows[0].count),
      orders: Number(orderCountRes.rows[0].count),
      revenue: Number(totalRevenueRes.rows[0].total),
      lowStock: Number(lowStockCountRes.rows[0].count),
      outOfStock: Number(outOfStockCountRes.rows[0].count),
      pendingOrders: Number(pendingOrdersRes.rows[0].count),
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// PUT /api/admin/profile - Update current admin profile
router.put("/profile", adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const adminId = req.admin?.id;

    if (!adminId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Prepare update parts
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (username) {
      // Check if username already exists for another user
      const check = await db.query(
        "SELECT id FROM admin_users WHERE username = $1 AND id != $2",
        [username, adminId],
      );
      if (check.rowCount && check.rowCount > 0) {
        return res.status(409).json({ error: "Username already exists" });
      }
      updates.push(`username = $${paramIndex}`);
      params.push(username);
      paramIndex++;
    }

    if (email) {
      // Check if email already exists for another user
      const check = await db.query(
        "SELECT id FROM admin_users WHERE email = $1 AND id != $2",
        [email, adminId],
      );
      if (check.rowCount && check.rowCount > 0) {
        return res.status(409).json({ error: "Email already exists" });
      }
      updates.push(`email = $${paramIndex}`);
      params.push(email);
      paramIndex++;
    }

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      updates.push(`"passwordHash" = $${paramIndex}`);
      params.push(passwordHash);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No updates provided" });
    }

    params.push(adminId);
    await db.query(
      `
      UPDATE admin_users 
      SET ${updates.join(", ")} 
      WHERE id = $${paramIndex}
    `,
      params,
    );

    console.log(`👤 Admin profile updated: ${username || req.admin?.username}`);

    res.json({
      success: true,
      message: "Profile updated successfully",
      admin: {
        ...req.admin,
        username: username || req.admin?.username,
        email: email || req.admin?.email,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
