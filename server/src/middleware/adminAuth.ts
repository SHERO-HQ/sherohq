import { Request, Response, NextFunction } from "express";
import db from "../db/database";

// Extended request type with admin user
export interface AdminRequest extends Request {
  admin?: {
    id: string;
    username: string;
    email: string;
    role: string;
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
  role: string;
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
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
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
      SELECT id, username, email, role FROM admin_users WHERE id = $1
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

/**
 * Optional auth - doesn't fail if no token, just doesn't set admin
 */
export async function optionalAdminAuth(
  req: AdminRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  return adminAuth(req, res, next);
}
