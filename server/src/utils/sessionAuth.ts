import type { CookieOptions, Request } from "express";

export const USER_SESSION_COOKIE = "user_session_token";
export const ADMIN_SESSION_COOKIE = "admin_session_token";

function parseCookies(
  cookieHeader: string | undefined,
): Record<string, string> {
  if (!cookieHeader) return {};

  return cookieHeader.split(";").reduce<Record<string, string>>((acc, part) => {
    const [rawName, ...rawValue] = part.trim().split("=");
    if (!rawName || rawValue.length === 0) return acc;

    const value = rawValue.join("=");
    acc[rawName] = decodeURIComponent(value);
    return acc;
  }, {});
}

function getSessionCookieDomain(req?: Request): string | undefined {
  const configuredDomain = process.env.SESSION_COOKIE_DOMAIN?.trim();
  if (configuredDomain) {
    if (configuredDomain === "none" || configuredDomain === "false") {
      return undefined;
    }
    return configuredDomain;
  }

  if (process.env.NODE_ENV === "production") {
    // If we have a request, check if the host matches our primary domain
    if (req) {
      const host = req.headers.host || "";
      if (host.includes("sherohq.com")) {
        return ".sherohq.com";
      }
      // If we're in production but NOT on sherohq.com (e.g. onrender.com preview), 
      // don't set a cross-subdomain cookie as it might fail on different domains.
      return undefined;
    }
    return ".sherohq.com";
  }

  return undefined;
}

function isSecureCookieEnabled(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.COOKIE_SECURE === "true"
  );
}

export function getTokenFromRequest(
  req: Request,
  cookieName: string,
): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const bearerToken = authHeader.substring(7).trim();
    if (bearerToken) {
      return bearerToken;
    }
  }

  const cookies = parseCookies(req.headers.cookie);
  const cookieToken = cookies[cookieName];
  return cookieToken || null;
}

export function getSessionCookieOptions(
  maxAgeMs: number,
  req?: Request,
): CookieOptions {
  const domain = getSessionCookieDomain(req);

  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureCookieEnabled(),
    maxAge: maxAgeMs,
    path: "/",
    ...(domain ? { domain } : {}),
  };
}

export function getClearSessionCookieOptions(req?: Request): CookieOptions {
  const domain = getSessionCookieDomain(req);

  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureCookieEnabled(),
    expires: new Date(0),
    path: "/",
    ...(domain ? { domain } : {}),
  };
}
