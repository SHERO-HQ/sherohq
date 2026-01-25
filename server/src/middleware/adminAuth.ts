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
  expiresAt: string;
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
export function adminAuth(
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

    // Find valid session
    const session = db
      .prepare(
        `
      SELECT * FROM sessions 
      WHERE token = ? AND expiresAt > datetime('now')
    `,
      )
      .get(token) as SessionRow | undefined;

    if (!session) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    // Get admin user
    const admin = db
      .prepare(
        `
      SELECT id, username, email, role FROM admin_users WHERE id = ?
    `,
      )
      .get(session.adminId) as AdminUserRow | undefined;

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
export function optionalAdminAuth(
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
