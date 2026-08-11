import { cookies } from "next/headers";
import { db } from "./db";
import { sql } from "drizzle-orm";

export const USER_SESSION_COOKIE = "user_session_token";
export const ADMIN_SESSION_COOKIE = "admin_session_token";

export async function getAdminFromSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) return null;

  try {
    // Find valid session and join with admin user in one go
    // Note: We use * to avoid crashing if new MFA columns aren't added yet
    const sessionRes = await db.execute(sql`
      SELECT 
        au.*
       FROM sessions s
       JOIN admin_users au ON s."adminId" = au.id
       WHERE s.token = ${token} AND s."expiresAt" > NOW()
    `);

    return (sessionRes.rows[0] as any) || null;
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
    const sessionRes = await db.execute(sql`
      SELECT 
        u.id, u.name, u.email, u.phone, u.avatar
       FROM user_sessions us
       JOIN users u ON us."userId" = u.id
       WHERE us.token = ${token} AND us."expiresAt" > NOW()
    `);

    return (sessionRes.rows[0] as any) || null;
  } catch (error) {
    console.error("User auth validation error:", error);
    return null;
  }
}
