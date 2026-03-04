import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Use the src/ directory for app router
  // App directory at src/app/

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
    // Disable static image imports (returns StaticImageData objects)
    // so that imported images remain as string URLs like in Vite
    disableStaticImages: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.sherohq.com",
      },
      {
        protocol: "https",
        hostname: "**.vercel.app",
      },
      // Local dev when NEXT_PUBLIC_API_URL points to localhost
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
    ],
  },

  // Alias react-router-dom to our compatibility layer
  // This allows existing components to work without changing imports
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "react-router-dom": path.resolve(__dirname, "src/lib/router-compat.tsx"),
      "react-router": path.resolve(__dirname, "src/lib/router-compat.tsx"),
    };
    return config;
  },

  // Turbopack alias (for next dev --turbopack)
  turbopack: {
    resolveAlias: {
      "react-router-dom": "./src/lib/router-compat.tsx",
      "react-router": "./src/lib/router-compat.tsx",
    },
  },

  // Suppress hydration warnings during migration
  reactStrictMode: true,
};

export default nextConfig;
