import type { Metadata } from "next";
import Products from "@/views/Products";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com"
).replace(/\/$/, "");

const SHOP_SITE_URL = (() => {
  try {
    const parsed = new URL(SITE_URL);
    if (parsed.hostname.startsWith("shop.")) return SITE_URL;

    const rootHost = parsed.hostname.startsWith("www.")
      ? parsed.hostname.slice(4)
      : parsed.hostname;

    return `${parsed.protocol}//shop.${rootHost}`;
  } catch {
    return "https://shop.sherohq.com";
  }
})();

const SHOP_PREVIEW_IMAGE = `${SHOP_SITE_URL}/shero.png`;

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse SHERO's curated collection of premium tech products — laptops, accessories, smart devices, and more.",
  alternates: {
    canonical: `${SHOP_SITE_URL}/shop`,
  },
  openGraph: {
    type: "website",
    title: "Shop | SHERO",
    description:
      "Browse SHERO's curated collection of premium tech products — laptops, accessories, smart devices, and more.",
    url: `${SHOP_SITE_URL}/shop`,
    siteName: "SHERO",
    images: [
      {
        url: SHOP_PREVIEW_IMAGE,
        width: 1200,
        height: 630,
        alt: "SHERO Shop",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop | SHERO",
    description:
      "Browse SHERO's curated collection of premium tech products — laptops, accessories, smart devices, and more.",
    images: [SHOP_PREVIEW_IMAGE],
  },
};

import { Suspense } from "react";

function ShopLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        <div className="h-64 bg-slate-200 dark:bg-slate-900 rounded" />
        <div className="grid lg:grid-cols-[280px_1fr] gap-10">
          <div className="hidden lg:block h-[500px] bg-slate-200 dark:bg-slate-900 rounded" />
          <div className="space-y-6">
            <div className="h-16 bg-slate-200 dark:bg-slate-900 rounded" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 bg-slate-200 dark:bg-slate-900 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopLoadingSkeleton />}>
      <Products />
    </Suspense>
  );
}
