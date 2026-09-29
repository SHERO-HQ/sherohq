import type { NextConfig } from "next";

const siteUrl = "https://sherohq.com";

// Google Analytics and Microsoft Clarity load only after cookie consent,
// but their hosts must be allowed for when they do.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.clarity.ms https://*.clarity.ms",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://*.clarity.ms https://c.bing.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
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

      // Old site's shop and support subdomains.
      {
        source: "/:path*",
        has: [{ type: "host", value: "shop.sherohq.com" }],
        destination: `${siteUrl}/shop`,
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "support.sherohq.com" }],
        destination: `${siteUrl}/support`,
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
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
