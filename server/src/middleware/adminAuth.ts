import { Request, Response, NextFunction } from "express";
import db from "../db/database";

// Extended request type with admin user
export interface AdminRequest extends Request {
  admin?: {
    id: string;
    username: string;
    email: string;
    phone?: string;
    role: string;
    avatar?: string;
  };
}

interface SessionRow {
  id: string;
  adminId: string;
  token: string;
  expiresAt: Date;
}

interface AdminUserRow {
  id: string;
  username: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
}

/**
 * Middleware to protect admin routes
 * Validates session token from Authorization header
 */
export async function adminAuth(
  req: AdminRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    // Get token from Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No authorization token provided" });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Find valid session (expiresAt is stored as TEXT in ISO format)
    const sessionRes = await db.query(
      `
      SELECT * FROM sessions 
      WHERE token = $1 AND "expiresAt"::timestamp > NOW()
    `,
      [token],
    );

    const session = sessionRes.rows[0] as SessionRow | undefined;

    if (!session) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    // Get admin user
    const adminRes = await db.query(
      `
      SELECT id, username, email, phone, role, avatar FROM admin_users WHERE id = $1
    `,
      [session.adminId],
    );

    const admin = adminRes.rows[0] as AdminUserRow | undefined;

    if (!admin) {
      return res.status(401).json({ error: "Admin user not found" });
    }

    // Attach admin to request
    req.admin = admin;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(500).json({ error: "Authentication error" });
  }
}

const ROLE_HIERARCHY: Record<string, number> = {
  superadmin: 100,
  admin: 80,
  manager: 60,
  attendant: 40,
  clerk: 20,
};

/**
 * Middleware to require a minimum role level
 */
export function requireRole(minRole: string) {
  return (req: AdminRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const userLevel = ROLE_HIERARCHY[req.admin.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] || 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        error: "Insufficient privileges",
        required: minRole,
        actual: req.admin.role,
      });
    }

    next();
  };
}

/**
 * Middleware to require one of specific roles (no hierarchy)
 */
export function requireAnyRole(roles: string[]) {
  return (req: AdminRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        error: "Access denied for this role",
      });
    }

    next();
  };
}
