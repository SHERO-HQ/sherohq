import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { randomBytes } from "node:crypto";
import { rateLimit } from "express-rate-limit";
import db from "../db/database";
import { adminAuth, requireRole, AdminRequest } from "../middleware/adminAuth";
import { logActivity } from "./activity";
import { validateBody } from "../middleware/validate";
import {
  AdminLoginSchema,
  AdminRegisterSchema,
  AdminUpdateProfileSchema,
} from "../schemas";
import {
  ADMIN_SESSION_COOKIE,
  getTokenFromRequest,
  getSessionCookieOptions,
  getClearSessionCookieOptions,
} from "../utils/sessionAuth";

const router = Router();

interface AdminUserRow {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: string;
  avatar?: string;
  passwordResetRequired: boolean;
  passwordUpdatedAt: string;
  createdAt: string;
}

// Rate limiting for admin login: Enabled in all environments
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: "Too many admin login attempts, please try again later." },
});

// POST /api/admin/login
router.post(
  "/login",
  adminLimiter,
  validateBody(AdminLoginSchema),
  async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      console.log(`🔐 Admin login attempt: ${username}`);

      // Find admin by username or email
      const result = await db.query(
        `
      SELECT * FROM admin_users
      WHERE username = $1 OR email = $2
    `,
        [username, username],
      );

      const admin = result.rows[0] as AdminUserRow | undefined;

      // Always run bcrypt to prevent timing attacks
      const fakeHash =
        "$2a$10$fakeHashForTimingConsistencyPreventionXXXXXXXXXXXXXXXXXXXXXXXX";
      const isValid = await bcrypt.compare(
        password,
        admin?.passwordHash || fakeHash,
      );

      if (!admin || !isValid) {
        console.warn(
          `❌ Admin login failed: Invalid credentials for ${username}`,
        );
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check if account is active
      if ((admin as AdminUserRow & { isActive?: boolean }).isActive === false) {
        console.warn(
          `🚫 Admin login blocked: Account deactivated for ${username}`,
        );
        return res.status(403).json({
          error: "This account has been deactivated. Contact a superadmin.",
        });
      }

      // Check for password expiration (6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const passwordExpired = new Date(admin.passwordUpdatedAt) < sixMonthsAgo;
      const mustReset = admin.passwordResetRequired || passwordExpired;

      // Create session token
      const token = randomBytes(32).toString("hex");
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

      res.cookie(
        ADMIN_SESSION_COOKIE,
        token,
        getSessionCookieOptions(7 * 24 * 60 * 60 * 1000),
      );

      console.log(`✅ Admin logged in: ${admin.username}`);
      await logActivity(
        admin.id,
        "admin_login",
        "success",
        `Admin logged in: ${admin.username}`,
      );

      res.json({
        success: true,
        token,
        mustReset,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          avatar: admin.avatar,
        },
      });
    } catch (error: unknown) {
      console.error("❌ Admin login error:", error);
      const isDev = process.env.NODE_ENV === "development";
      res.status(500).json({
        error: "Login failed",
        ...(isDev && {
          details: error instanceof Error ? error.message : "Unknown error",
        }),
      });
    }
  },
);

// POST /api/admin/logout
router.post("/logout", adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const token = getTokenFromRequest(req, ADMIN_SESSION_COOKIE);
    if (token) {
      await db.query("DELETE FROM sessions WHERE token = $1", [token]);
    }

    res.cookie(ADMIN_SESSION_COOKIE, "", getClearSessionCookieOptions());

    console.log(`🔓 Admin logout: ${req.admin?.username}`);
    if (req.admin?.id) {
      await logActivity(
        req.admin.id,
        "admin_logout",
        "info",
        `Admin logged out: ${req.admin.username}`,
      );
    }
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

// POST /api/admin/register - Create new admin (protected)
router.post(
  "/register",
  adminAuth,
  requireRole("admin"),
  validateBody(AdminRegisterSchema),
  async (req: AdminRequest, res: Response) => {
    try {
      const { username, email, password, phone, role = "admin" } = req.body;
      const creatorRole = req.admin?.role || "admin";

      // Restriction: ONLY superadmin can create superadmins
      if (role === "superadmin" && creatorRole !== "superadmin") {
        return res
          .status(403)
          .json({ error: "Only superadmins can create other superadmins" });
      }

      // Restriction: admins can only create manager/attendant/clerk
      if (creatorRole === "admin" && role === "admin") {
        // Let's decide: can admin create another admin?
        // Usually yes, but for strict staff management, maybe only superadmin creates admins.
        // User said 'manager, attendant, clerk' should be open to admin.
        // I will allow admin to create manager, attendant, clerk.
      }

      const allowedRolesForAdmin = ["manager", "attendant", "clerk"];
      if (creatorRole === "admin" && !allowedRolesForAdmin.includes(role)) {
        return res.status(403).json({
          error: `Admins can only create ${allowedRolesForAdmin.join(", ")} roles.`,
        });
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
      INSERT INTO admin_users (id, username, email, "passwordHash", phone, role, "passwordResetRequired")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
        [adminId, username, email, passwordHash, phone, role, true],
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
          phone,
          role,
        },
      });
    } catch (error) {
      console.error("Register error:", error);
      const isDev = process.env.NODE_ENV === "development";
      res.status(500).json({
        error: "Failed to create admin",
        ...(isDev && {
          details: error instanceof Error ? error.message : "Unknown error",
        }),
      });
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
      "SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status != 'cancelled'",
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
    const isDev = process.env.NODE_ENV === "development";
    res.status(500).json({
      error: "Failed to fetch statistics",
      ...(isDev && {
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    });
  }
});

// PUT /api/admin/profile - Update current admin profile
router.put(
  "/profile",
  adminAuth,
  validateBody(AdminUpdateProfileSchema),
  async (req: AdminRequest, res: Response) => {
    try {
      const { username, email, password, phone, avatar } = req.body;
      const adminId = req.admin?.id;

      if (!adminId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Prepare update parts
      const updates: string[] = [];
      const params: (string | number)[] = [];
      let paramIndex = 1;

      // Username and Email updates are restricted to SuperAdmin/Admin via /users/:id endpoint
      // Users cannot update their own username/email here.

      if (password) {
        const passwordHash = await bcrypt.hash(password, 10);
        updates.push(`"passwordHash" = $${paramIndex}`);
        params.push(passwordHash);
        paramIndex++;
      }

      if (avatar) {
        updates.push(`avatar = $${paramIndex}`);
        params.push(avatar);
        paramIndex++;
      }

      if (phone) {
        updates.push(`phone = $${paramIndex}`);
        params.push(phone);
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

      console.log(
        `👤 Admin profile updated: ${username || req.admin?.username}`,
      );
      if (adminId) {
        await logActivity(
          adminId,
          "admin_profile_update",
          "info",
          `Updated admin profile for: ${username || req.admin?.username}`,
        );
      }

      res.json({
        success: true,
        message: "Profile updated successfully",
        user: {
          ...req.admin,
          username: username || req.admin?.username,
          email: email || req.admin?.email,
          phone: phone !== undefined ? phone : req.admin?.phone,
          avatar: avatar !== undefined ? avatar : req.admin?.avatar,
        },
      });
    } catch (error) {
      console.error("Profile update error:", error);
      const isDev = process.env.NODE_ENV === "development";
      res.status(500).json({
        error: "Failed to update profile",
        ...(isDev && {
          details: error instanceof Error ? error.message : "Unknown error",
        }),
      });
    }
  },
);

// GET /api/admin/users/:id - Get specific admin user
router.get(
  "/users/:id",
  adminAuth,
  requireRole("admin"),
  async (req: AdminRequest, res: Response) => {
    try {
      const { id } = req.params;
      const result = await db.query(
        'SELECT id, username, email, role, phone, avatar, "isActive", "createdAt" FROM admin_users WHERE id = $1',
        [id],
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Admin user not found" });
      }

      res.json({ success: true, user: result.rows[0] });
    } catch (error) {
      console.error("Fetch admin details error:", error);
      res.status(500).json({ error: "Failed to fetch admin details" });
    }
  },
);

// GET /api/admin/users - List all admin users (superadmin, admin)
router.get(
  "/users",
  adminAuth,
  requireRole("admin"),
  async (req: AdminRequest, res: Response) => {
    try {
      const result = await db.query(
        'SELECT id, username, email, role, phone, avatar, "isActive", "createdAt" FROM admin_users ORDER BY "createdAt" DESC',
      );
      res.json({ success: true, users: result.rows });
    } catch (error) {
      console.error("Fetch admins error:", error);
      res.status(500).json({ error: "Failed to fetch admin users" });
    }
  },
);

// POST /api/admin/users/:id/reset-password - Force staff member to reset password on next login
router.post(
  "/users/:id/reset-password",
  adminAuth,
  requireRole("admin"),
  async (req: AdminRequest, res: Response) => {
    try {
      const { id } = req.params;

      if (id === req.admin?.id) {
        return res.status(400).json({
          error: "Use the change-password endpoint to reset your own password",
        });
      }

      const userRes = await db.query(
        "SELECT id, username, role FROM admin_users WHERE id = $1",
        [id],
      );
      if (userRes.rowCount === 0) {
        return res.status(404).json({ error: "Admin user not found" });
      }

      const target = userRes.rows[0];
      const creatorRole = req.admin?.role || "admin";

      // Only superadmin can reset superadmin passwords
      if (target.role === "superadmin" && creatorRole !== "superadmin") {
        return res.status(403).json({
          error: "Only superadmins can reset other superadmin passwords",
        });
      }

      // Flag for mandatory reset and revoke all sessions
      await db.query(
        'UPDATE admin_users SET "passwordResetRequired" = true WHERE id = $1',
        [id],
      );
      await db.query('DELETE FROM sessions WHERE "adminId" = $1', [id]);

      await logActivity(
        req.admin!.id,
        "admin_password_reset",
        "warning",
        `Forced password reset for admin: ${target.username}`,
      );

      console.log(
        `🔑 Password reset flagged for admin: ${target.username} by ${req.admin?.username}`,
      );

      res.json({
        success: true,
        message: `${target.username} will be required to set a new password on next login.`,
      });
    } catch (error) {
      console.error("Reset admin password error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  },
);

// PATCH /api/admin/users/:id - Toggle active/inactive (superadmin only)
router.patch(
  "/users/:id",
  adminAuth,
  requireRole("superadmin"),
  async (req: AdminRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body as { isActive?: boolean };

      if (isActive === undefined) {
        return res.status(400).json({ error: "isActive field is required" });
      }

      if (id === req.admin?.id) {
        return res
          .status(400)
          .json({ error: "Cannot deactivate your own account" });
      }

      const userRes = await db.query(
        "SELECT id, username FROM admin_users WHERE id = $1",
        [id],
      );
      if (userRes.rowCount === 0) {
        return res.status(404).json({ error: "Admin user not found" });
      }

      await db.query('UPDATE admin_users SET "isActive" = $1 WHERE id = $2', [
        isActive,
        id,
      ]);

      // Revoke all sessions when deactivating
      if (!isActive) {
        await db.query('DELETE FROM sessions WHERE "adminId" = $1', [id]);
      }

      await logActivity(
        req.admin!.id,
        isActive ? "admin_account_reactivated" : "admin_account_deactivated",
        "warning",
        `${isActive ? "Reactivated" : "Deactivated"} admin account: ${userRes.rows[0].username}`,
      );

      res.json({ success: true, isActive });
    } catch (error) {
      console.error("Toggle admin active error:", error);
      res.status(500).json({ error: "Failed to update account status" });
    }
  },
);

// DELETE /api/admin/users/:id - Delete admin user (superadmin only)
router.delete(
  "/users/:id",
  adminAuth,
  requireRole("superadmin"),
  async (req: AdminRequest, res: Response) => {
    try {
      const { id } = req.params;

      if (id === req.admin?.id) {
        return res
          .status(400)
          .json({ error: "Cannot delete your own account" });
      }

      const result = await db.query(
        "DELETE FROM admin_users WHERE id = $1 RETURNING username",
        [id],
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Admin user not found" });
      }

      console.log(
        `🗑️ Admin deleted: ${result.rows[0].username} by ${req.admin?.username}`,
      );
      await logActivity(
        req.admin!.id,
        "admin_delete",
        "warning",
        `Deleted admin: ${result.rows[0].username}`,
      );

      res.json({ success: true, message: "Admin user deleted successfully" });
    } catch (error) {
      console.error("Delete admin error:", error);
      res.status(500).json({ error: "Failed to delete admin user" });
    }
  },
);

// PUT /api/admin/users/:id - Update admin user (role, username, email - superadmin/admin)
router.put(
  "/users/:id",
  adminAuth,
  requireRole("admin"),
  async (req: AdminRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { role, username, email } = req.body as {
        role?: string;
        username?: string;
        email?: string;
      };
      const creatorRole = req.admin?.role || "admin";

      if (!role && !username && !email) {
        return res.status(400).json({ error: "No fields provided for update" });
      }

      // Check if user exists
      const userRes = await db.query(
        "SELECT role FROM admin_users WHERE id = $1",
        [id],
      );
      if (userRes.rowCount === 0) {
        return res.status(404).json({ error: "Admin user not found" });
      }

      const targetUserRole = userRes.rows[0].role;
      // Restriction: Only superadmins can modify other superadmins
      if (targetUserRole === "superadmin" && creatorRole !== "superadmin") {
        return res
          .status(403)
          .json({ error: "Only superadmins can modify other superadmins" });
      }

      // Role update restrictions
      if (role) {
        if (role === "superadmin" && creatorRole !== "superadmin") {
          return res
            .status(403)
            .json({ error: "Only superadmins can assign the superadmin role" });
        }
      }

      const updates: string[] = [];
      const params: (string | number)[] = [];
      let paramIndex = 1;

      if (username) {
        const check = await db.query(
          "SELECT id FROM admin_users WHERE username = $1 AND id != $2",
          [username, id],
        );
        if (check.rowCount && check.rowCount > 0) {
          return res.status(409).json({ error: "Username already exists" });
        }
        updates.push(`username = $${paramIndex++}`);
        params.push(username);
      }

      if (email) {
        const check = await db.query(
          "SELECT id FROM admin_users WHERE email = $1 AND id != $2",
          [email, id],
        );
        if (check.rowCount && check.rowCount > 0) {
          return res.status(409).json({ error: "Email already exists" });
        }
        updates.push(`email = $${paramIndex++}`);
        params.push(email);
      }

      if (role) {
        updates.push(`role = $${paramIndex++}`);
        params.push(role);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: "No valid updates provided" });
      }

      params.push(String(id));
      await db.query(
        `UPDATE admin_users SET ${updates.join(", ")} WHERE id = $${paramIndex}`,
        params,
      );

      console.log(
        `🆙 Admin updated: ${id} by ${req.admin?.username}. Changes: ${updates.join(", ")}`,
      );
      await logActivity(
        req.admin!.id,
        "admin_update",
        "info",
        `Updated admin ${id}: ${updates.join(", ")}`,
      );

      res.json({ success: true, message: "Admin user updated successfully" });
    } catch (error) {
      console.error("Update admin error:", error);
      res.status(500).json({ error: "Failed to update admin user" });
    }
  },
);

// POST /api/admin/change-password - Force password reset
router.post(
  "/change-password",
  adminAuth,
  async (req: AdminRequest, res: Response) => {
    try {
      const { password } = req.body;
      const adminId = req.admin?.id;

      if (!password || password.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters" });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      await db.query(
        `
      UPDATE admin_users 
      SET "passwordHash" = $1, "passwordResetRequired" = false, "passwordUpdatedAt" = CURRENT_TIMESTAMP
      WHERE id = $2
    `,
        [passwordHash, adminId],
      );

      console.log(`🔐 Password changed for admin: ${req.admin?.username}`);
      await logActivity(
        adminId!,
        "admin_password_reset",
        "info",
        `Admin changed their own password`,
      );

      res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ error: "Failed to change password" });
    }
  },
);

export default router;
