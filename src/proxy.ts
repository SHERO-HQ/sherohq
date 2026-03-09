import { NextRequest, NextResponse } from "next/server";

/**
 * Subdomain-based routing proxy.
 *
 * Rewrites requests from subdomains to their corresponding path prefix:
 *   admin.sherohq.com/dashboard → /admin/dashboard
 *   support.sherohq.com/faq     → /support/faq
 *   shop.sherohq.com/product-1  → /shop/product-1
 */
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Never rewrite API or uploads requests: they must hit backend proxies directly
  if (pathname.startsWith("/api") || pathname.startsWith("/uploads")) {
    return NextResponse.next();
  }

  const hostname = request.headers.get("host") || "";
  const subdomain = getSubdomain(hostname);

  if (!subdomain) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();

  // If we're on an admin/support/shop subdomain and the path doesn't
  // already include the prefix, rewrite it
  if (subdomain === "admin" && !url.pathname.startsWith("/admin")) {
    url.pathname = `/admin${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  if (subdomain === "support" && !url.pathname.startsWith("/support")) {
    url.pathname = `/support${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  if (subdomain === "shop" && !url.pathname.startsWith("/shop")) {
    url.pathname = `/shop${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

function getSubdomain(hostname: string): string | null {
  // Skip localhost and IP addresses
  if (
    hostname.includes("localhost") ||
    hostname.includes("127.0.0.1") ||
    hostname.startsWith("192.168.")
  ) {
    return null;
  }

  const parts = hostname.split(":")[0].split(".");

  // Root domain (sherohq.com → ["sherohq", "com"])
  if (parts.length <= 2) return null;

  const subdomain = parts[0].toLowerCase();

  // Ignore www
  if (subdomain === "www") return null;

  return subdomain;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api, uploads (backend proxy paths)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Static assets (svg, png, jpg, etc.)
     */
    "/((?!api|uploads|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
