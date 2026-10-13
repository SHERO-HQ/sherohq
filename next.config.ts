import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Project screenshots are served from SHERO's existing storage bucket.
    remotePatterns: [
      { protocol: "https", hostname: "uydnijaimlpxqwnabfce.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  // Old URLs that moved or now live elsewhere.
  async redirects() {
    return [
      { source: "/services", destination: "/solutions", permanent: true },
      { source: "/about", destination: "/about-us", permanent: true },
      { source: "/contact", destination: "/contact-us", permanent: true },
      { source: "/shop/:path*", destination: "/merchander", permanent: false },
      { source: "/products/:path*", destination: "/merchander", permanent: false },
      { source: "/track/:path*", destination: "/support", permanent: false },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default config;
