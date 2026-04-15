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

export default function ShopPage() {
  return <Products />;
}
