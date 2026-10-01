import type { NextConfig } from "next";

const siteUrl = "https://sherohq.com";
// The shop's own site (owner, 1 Oct 2026); src/lib/site.ts links to it when NEXT_PUBLIC_SHOP_URL is set.
const shopUrl = process.env.NEXT_PUBLIC_SHOP_URL?.replace(/\/$/, "") || "https://shop.sherohq.com";
const shopHost = [{ type: "host" as const, value: new URL(shopUrl).host }];
const mainHost = [{ type: "host" as const, value: "(www\\.)?sherohq\\.com" }];

// In `next dev`, React uses eval() for debugging and hot reload uses a
// WebSocket; production needs neither, so they're allowed in development only.
const isDev = process.env.NODE_ENV === "development";

// Google Analytics and Microsoft Clarity load only after cookie consent,
// but their hosts must be allowed for when they do.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.clarity.ms https://*.clarity.ms`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws:" : ""} https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://*.clarity.ms https://c.bing.com`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Listing photos go up one at a time, shrunk in the browser first; this
  // leaves room for one photo while staying under Vercel's 4.5 MB request cap.
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  poweredByHeader: false,

  async redirects() {
    return [
      // Old site paths → their new homes (PRD: "Existing URLs").
      { source: "/consultation", destination: "/support/consultation", permanent: true },
      { source: "/contact-us", destination: "/support", permanent: true },
      { source: "/products", destination: "/shop", permanent: true },
      { source: "/products/:path*", destination: "/shop", permanent: true },
      { source: "/partners", destination: "/work", permanent: true },
      { source: "/careers", destination: "/about/careers", permanent: true },

      // Product subdomains point at their pages until launch, when they become
      // the product itself, so these are temporary (not cached by browsers).
      {
        source: "/:path*",
        has: [{ type: "host", value: "merchander.sherohq.com" }],
        destination: `${siteUrl}/merchander`,
        permanent: false,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "pharmasyst.sherohq.com" }],
        destination: `${siteUrl}/pharmasyst`,
        permanent: false,
      },

      // The admin lives at admin.sherohq.com/admin/…: the bare host opens it,
      // and site pages asked for on the admin host go to the public site. The
      // public host never serves the admin.
      {
        source: "/",
        has: [{ type: "host", value: "admin.sherohq.com" }],
        destination: "/admin",
        permanent: false,
      },
      {
        source: "/:path((?!admin|_next|assets|uploads|favicon|apple-touch-icon).+)",
        has: [{ type: "host", value: "admin.sherohq.com" }],
        destination: `${siteUrl}/:path`,
        permanent: false,
      },
      {
        source: "/admin/:path*",
        has: [{ type: "host", value: "(www\\.)?sherohq\\.com" }],
        destination: "https://admin.sherohq.com/admin/:path*",
        permanent: false,
      },

      // The shop is its own site at shop.sherohq.com, at clean paths ("/",
      // "/<laptop>", "/cart"; see rewrites below). The main site's old shop
      // paths move there for good, and business pages asked for on the shop
      // host go to the main site. Local and preview builds serve both in one app.
      { source: "/shop", has: mainHost, destination: `${shopUrl}/`, permanent: true },
      { source: "/shop/:slug", has: mainHost, destination: `${shopUrl}/:slug`, permanent: true },
      { source: "/:page(cart|track)", has: mainHost, destination: `${shopUrl}/:page`, permanent: true },
      { source: "/checkout/:path*", has: mainHost, destination: `${shopUrl}/checkout/:path*`, permanent: true },
      { source: "/shop", has: shopHost, destination: "/", permanent: true },
      { source: "/shop/:slug", has: shopHost, destination: "/:slug", permanent: true },
      {
        source: "/:section(services|work|about|support|legal|admin)/:path*",
        has: shopHost,
        destination: `${siteUrl}/:section/:path*`,
        permanent: false,
      },

      // The old site's support subdomain.
      {
        source: "/:path*",
        has: [{ type: "host", value: "support.sherohq.com" }],
        destination: `${siteUrl}/support`,
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return {
      // On the shop host, clean paths map to this app's shop routes.
      beforeFiles: [
        { source: "/", has: shopHost, destination: "/shop" },
        {
          source: "/:slug((?!cart$|checkout|track$|shop$|api|uploads|_next|favicon|apple-touch-icon|site\\.webmanifest|robots\\.txt|sitemap\\.xml|opengraph-image)[^/.]+)",
          has: shopHost,
          destination: "/shop/:slug",
        },
      ],
    };
  },

  async headers() {
    // Keep Vercel previews (e.g. the rebuild branch) out of search results.
    const previewHeaders =
      process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production"
        ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
        : [];

    return [
      // The admin is never indexed, wherever it's served from.
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      {
        source: "/:path*",
        headers: [
          ...previewHeaders,
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
