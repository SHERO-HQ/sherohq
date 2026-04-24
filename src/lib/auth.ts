import { cookies } from "next/headers";
import { query } from "./db";

export const USER_SESSION_COOKIE = "user_session_token";
export const ADMIN_SESSION_COOKIE = "admin_session_token";

export async function getAdminFromSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) return null;

  try {
    // Find valid session and join with admin user in one go
    // Note: We use * to avoid crashing if new MFA columns aren't added yet
    const sessionRes = await query(
      `SELECT 
        au.*
       FROM sessions s
       JOIN admin_users au ON s."adminId" = au.id
       WHERE s.token = $1 AND s."expiresAt" > NOW()`,
      [token]
    );

    return sessionRes.rows[0] || null;
  } catch (error) {
    console.error("Auth validation error:", error);
    return null;
  }
}

export async function getUserFromSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_SESSION_COOKIE)?.value;

  if (!token) return null;

  try {
    const sessionRes = await query(
      `SELECT 
        u.id, u.name, u.email, u.phone, u.avatar
       FROM user_sessions us
       JOIN users u ON us."userId" = u.id
       WHERE us.token = $1 AND us."expiresAt" > NOW()`,
      [token]
    );

    return sessionRes.rows[0] || null;
  } catch (error) {
    console.error("User auth validation error:", error);
    return null;
  }
}
