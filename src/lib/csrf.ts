import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";

export const CSRF_COOKIE = "shero_csrf";
export const CSRF_HEADER = "x-csrf-token";

/**
 * Gets the existing CSRF token from the cookie, or generates a new one.
 * Calling this function will set the cookie if it doesn't exist.
 */
export async function getOrCreateCsrfToken(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CSRF_COOKIE)?.value;
  if (existing) return existing;
  
  const token = randomBytes(32).toString("hex");
  cookieStore.set(CSRF_COOKIE, token, {
    httpOnly: false, // Must be readable by client JS to send back in header
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return token;
}

/**
 * Verifies that the CSRF token in the request header matches the cookie.
 * This should be used on all mutating endpoints (POST, PUT, DELETE, PATCH).
 */
export async function verifyCsrfToken(request: Request): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE)?.value;
  const headerToken = request.headers.get(CSRF_HEADER);
  
  // If either is missing, verification fails
  if (!cookieToken || !headerToken) return false;
  
  // They must match exactly
  return cookieToken === headerToken;
}
