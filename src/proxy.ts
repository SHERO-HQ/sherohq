import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export const runtime = "edge"; // ← required for Cloudflare

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";

  // Extract subdomain dynamically
  // Handles locales like admin.localhost:3000 or prod like admin.sherohq.com
  const parts = hostname.split(".");
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

  // 1. Admin Subdomain
  if (subdomain === "admin") {
    // Avoid infinite loops: if the path already starts with /admin, we don't need to rewrite
    // but typically the goal is admin.sherohq.com/dashboard -> internally /admin/dashboard
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

// Config to match all paths except static assets, etc.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
