import type { MetadataRoute } from "next";
import { API_BASE } from "@/services/client";
import type { Product } from "@/types/product";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com").replace(/\/$/, "");
  // For shop specific links, we follow the user's /shop pattern
  const shopSiteUrl = siteUrl.includes("shop.") ? siteUrl : siteUrl.replace("://", "://shop.");

  // Static routes
  const staticRoutes = [
    "",
    "/about-us",
    "/solutions",
    "/contact-us",
    "/support",
    "/faq",
    "/privacy",
    "/terms",
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Dynamic Products from API
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_BASE}/products`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const products: Product[] = await res.json();
      productRoutes = products.map((product) => ({
        url: `${shopSiteUrl}/${product.id}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error("Sitemap generation error:", error);
  }

  return [...staticRoutes, ...productRoutes];
}
