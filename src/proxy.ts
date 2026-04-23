import { NextResponse } from "next/server";
import { NextRequest } from "next/server";



export default function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";
  const host = hostname.toLowerCase();

  // 1. Strip 'www.' prefix and redirect permanently
  // This prevents issues where users type www.api.sherohq.com or www.admin.sherohq.com
  if (host.startsWith("www.")) {
    url.hostname = host.replace(/^www\./, "");
    return NextResponse.redirect(url, 301);
  }

  // Extract subdomain dynamically
  // Handles locales like admin.localhost:3000 or prod like admin.sherohq.com
  const parts = host.split(".");
  let subdomain = "";

  if (parts.length > 2) {
    // If it's a subdomain (e.g., admin.sherohq.com)
    subdomain = parts[0].toLowerCase();
  } else if (parts.length === 2 && hostname.includes("localhost")) {
    // Localhost subdomain (e.g., admin.localhost:3000)
    subdomain = parts[0].toLowerCase();
  }

  // Skip if it's a known service or not a subdomain
  if (!subdomain || subdomain === "www" || subdomain === "localhost") {
    return NextResponse.next();
  }

  // Handle specific subdomains
  const path = url.pathname;

  // Explicitly bypass static files, Next.js internal paths, and API routes.
  // This acts as a fail-safe in case the config matcher regex is ignored (e.g. by Turbopack or Vercel Edge).
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.startsWith("/assets") ||
    path.match(/\.(png|jpe?g|gif|svg|ico|webp|avif|woff2?|js|css|json|webmanifest|xml|txt)$/i)
  ) {
    return NextResponse.rewrite(url);
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
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - assets (internal assets)
     * - favicon.ico, sitemap.xml, robots.txt, etc.
     */
    "/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|site.webmanifest|sitemap.xml|robots.txt).*)",
  ],
};


