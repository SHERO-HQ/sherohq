import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const CSRF_EXEMPT_PATHS = [/^\/api\/cron\//, /^\/api\/payments\/webhook$/];

function isUnsafeMethod(method: string) {
  return UNSAFE_METHODS.has(method.toUpperCase());
}

function isCsrfExemptPath(pathname: string) {
  return CSRF_EXEMPT_PATHS.some((pattern) => pattern.test(pathname));
}

function getRequestOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin) return origin;

  const referer = request.headers.get("referer");
  if (!referer) return null;

  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

function isAllowedOrigin(request: NextRequest) {
  const requestOrigin = getRequestOrigin(request);
  // If the request has no Origin (e.g., internal server-side fetches),
  // treat it as allowed. Browsers will include Origin for cross-site requests.
  // This avoids rejecting valid internal requests while still validating
  // browser-originated requests.
  if (!requestOrigin) return true;

  // Allow exact origin match first
  if (requestOrigin === request.nextUrl.origin) return true;

  // Allow same-root subdomains (helpful in local dev where admin.localhost:3000
  // may call the API hosted at localhost:3000). This accepts origins whose
  // host ends with the server host (including port), e.g. "admin.localhost:3000" endsWith "localhost:3000".
  try {
    const originHost = new URL(requestOrigin).host; // host includes port
    const serverHost = request.nextUrl.host; // includes port
    if (originHost.endsWith(serverHost.replace(/^www\./, ""))) return true;
  } catch (e) {
    // if URL parsing fails, fall through to rejection
  }

  return false;
}

export default function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";
  const host = hostname.toLowerCase();
  const path = url.pathname;

  if (
    path.startsWith("/api") &&
    isUnsafeMethod(request.method) &&
    !isCsrfExemptPath(path)
  ) {
    if (!isAllowedOrigin(request)) {
      // Log useful headers to help debug CSRF failures in development
      console.error("[CSRF] validation failed", {
        path: request.nextUrl.pathname,
        method: request.method,
        origin: request.headers.get("origin"),
        referer: request.headers.get("referer"),
        host: request.headers.get("host"),
        nextOrigin: request.nextUrl.origin,
      });

      return NextResponse.json(
        { success: false, error: "CSRF validation failed" },
        { status: 403 },
      );
    }
  }

  // NOTE: Do NOT redirect www ↔ non-www here.
  // Vercel handles domain canonicalization (apex → www or vice-versa).
  // Adding a conflicting redirect here causes an infinite redirect loop.

  // Extract subdomain dynamically
  // Handles locales like admin.localhost:3000 or prod like admin.sherohq.com
  // Also handles www.sherohq.com (www is not a functional subdomain)
  const parts = host.replace(/^www\./, "").split(".");
  let subdomain = "";

  if (parts.length > 2) {
    // If it's a subdomain (e.g., admin.sherohq.com)
    subdomain = parts[0].toLowerCase();
  } else if (parts.length === 2 && hostname.includes("localhost")) {
    // Localhost subdomain (e.g., admin.localhost:3000)
    subdomain = parts[0].toLowerCase();
  }

  // Skip if not a functional subdomain
  if (!subdomain || subdomain === "www" || subdomain === "localhost") {
    return NextResponse.next();
  }

  // Handle specific subdomains
  // Explicitly bypass static files, Next.js internal paths, and API routes.
  // This acts as a fail-safe in case the config matcher regex is ignored (e.g. by Turbopack or Vercel Edge).
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.startsWith("/assets") ||
    path.match(
      /\.(png|jpe?g|gif|svg|ico|webp|avif|woff2?|js|css|json|webmanifest|xml|txt)$/i,
    )
  ) {
    return NextResponse.next();
  }

  // 1. Admin Subdomain
  if (subdomain === "admin") {
    // Avoid infinite loops: if the path already starts with /admin, we don't need to rewrite
    if (!path.startsWith("/admin")) {
      url.pathname = `/admin${path}`;
      return NextResponse.rewrite(url);
    }
  }

  // 2. Shop Subdomain
  if (subdomain === "shop") {
    // If the path starts with /products, map it to the actual shop route structure in Next.js:
    // - /products -> /shop
    // - /products/[id] -> /shop/[id]
    if (path.startsWith("/products")) {
      const cleanPath = path.replace(/^\/products\/?/, "");
      if (cleanPath) {
        url.pathname = `/shop/${cleanPath}`;
      } else {
        url.pathname = "/shop";
      }
      return NextResponse.rewrite(url);
    }

    if (!path.startsWith("/shop")) {
      url.pathname = `/shop${path}`;
      return NextResponse.rewrite(url);
    }
  }

  // 3. Support Subdomain
  if (subdomain === "support") {
    if (!path.startsWith("/support")) {
      url.pathname = `/support${path}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - assets (internal assets)
     * - favicon.ico, sitemap.xml, robots.txt, etc.
     */
    "/((?!_next/static|_next/image|assets|favicon.ico|sw.js|site.webmanifest|sitemap.xml|robots.txt).*)",
  ],
};
