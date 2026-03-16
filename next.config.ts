import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,

  // Proxy API requests to the Express backend
  async rewrites() {
    const apiUrl = process.env.API_URL || "http://127.0.0.1:5000";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${apiUrl}/uploads/:path*`,
      },
    ];
  },

  // Image optimization
  images: {
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
    ],
  },

  reactStrictMode: true,

  // Optimise production builds
  productionBrowserSourceMaps: false,

  // Cache headers for static assets
  async headers() {
    return [
      {
        // Cache static assets aggressively (fonts, images, JS/CSS chunks)
        source:
          "/:path*.(woff2|woff|ttf|otf|ico|svg|png|jpg|jpeg|webp|avif|gif)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
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
