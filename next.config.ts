import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  serverExternalPackages: ["pdfkit"],
  transpilePackages: ["motion"],
  outputFileTracingRoot: process.cwd(),


  // Note: All /api routes are now handled natively by Next.js API Routes.
  // The Express proxy has been decommissioned for performance and stability.

  // Image optimization
  images: {
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
  },

  reactStrictMode: true,

  // Optimise production builds
  productionBrowserSourceMaps: false,

  // Redirect old checkout complete URLs to the new success page
  async redirects() {
    return [
      {
        source: "/checkout/complete",
        destination: "/shop/checkout/success",
        permanent: false,
      },
      {
        source: "/shop/checkout/complete",
        destination: "/shop/checkout/success",
        permanent: false,
      },
    ];
  },

  // Cache headers for static assets and security headers
  async headers() {
    return [

      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://*.vercel-scripts.com https://*.vercel-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https: wss:; frame-ancestors 'none';",
          },
        ],
      },
      {
        // Cache static assets aggressively
        source: "/:path*.(woff2|woff|ttf|otf|ico|svg|png|jpg|jpeg|webp|avif|gif)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
