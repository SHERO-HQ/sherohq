import type { NextConfig } from "next";

function toAbsoluteUrl(value: string | undefined): string | null {
  const raw = value?.trim();
  if (!raw) return null;

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw.replace(/\/$/, "");
  }

  if (raw.startsWith("/")) {
    return null;
  }

  return `https://${raw}`.replace(/\/$/, "");
}

function resolveApiOrigin(): string {
  const directApi = toAbsoluteUrl(process.env.API_URL);
  if (directApi) return directApi;

  const publicApi = toAbsoluteUrl(process.env.NEXT_PUBLIC_API_URL);
  if (publicApi) return publicApi;

  if (process.env.NODE_ENV === "production" && !directApi && !publicApi) {
    console.warn(
      "⚠️ [NextConfig] Falling back to hardcoded production API origin: https://api.sherohq.com. " +
        "Ensure API_URL or NEXT_PUBLIC_API_URL is set.",
    );
    return "https://api.sherohq.com";
  }

  return "http://127.0.0.1:5000";
}

const nextConfig: NextConfig = {
  compress: true,

  // Proxy API requests to the Express backend
  async rewrites() {
    const apiOrigin = resolveApiOrigin().replace(/\/api$/, "");
    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${apiOrigin}/uploads/:path*`,
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
