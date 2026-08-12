import { cookies, headers } from "next/headers";
import { db } from "./db";
import { sql } from "drizzle-orm";

export const USER_SESSION_COOKIE = "user_session_token";
export const ADMIN_SESSION_COOKIE = "admin_session_token";

export async function getCookieDomain(): Promise<string | undefined> {
  try {
    const headersList = await headers();
    const host = headersList.get("host") || "";
    const cleanHost = host.split(":")[0].toLowerCase();

    // Do not set domain on localhost, IP addresses, or vercel.app preview domains (public suffixes)
    if (
      !cleanHost ||
      cleanHost === "localhost" ||
      cleanHost.endsWith(".localhost") ||
      cleanHost === "127.0.0.1" ||
      cleanHost.startsWith("192.168.") ||
      cleanHost.endsWith(".vercel.app") ||
      cleanHost.endsWith(".netlify.app")
    ) {
      return undefined;
    }

    // Extract base domain for custom domains (e.g. sherohq.com or sherotech.com)
    const parts = cleanHost.split(".");
    if (parts.length >= 2) {
      const base = parts.slice(-2).join(".");
      return `.${base}`;
    }
  } catch {
    // Fallback if headers are not available
  }
  return undefined;
}

export async function getAuthCookieOptions(expiresOrMaxAge?: Date | number) {
  const domain = await getCookieDomain();
  const options: Record<string, any> = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };

  if (expiresOrMaxAge instanceof Date) {
    options.expires = expiresOrMaxAge;
  } else if (typeof expiresOrMaxAge === "number") {
    options.maxAge = expiresOrMaxAge;
  }

  if (domain) {
    options.domain = domain;
  }

  return options;
}

export async function clearAuthCookie(cookieName: string) {
  const cookieStore = await cookies();
  const domain = await getCookieDomain();

  if (domain) {
    cookieStore.set(cookieName, "", {
      maxAge: 0,
      path: "/",
      domain,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  cookieStore.set(cookieName, "", {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}

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
        u.id, 
        u.name, 
        u.email, 
        u.phone, 
        u.avatar,
        u."emailVerified",
        u."mfaEnabled",
        u."shippingAddress",
        u."createdAt"
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
