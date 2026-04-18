import type { MetadataRoute } from "next";
import { API_BASE } from "@/services/client";
import type { Product } from "@/types/product";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com"
  ).replace(/\/$/, "");
  // For shop specific links, we follow the user's /shop pattern
  const shopSiteUrl = siteUrl.includes("shop.")
    ? siteUrl
    : siteUrl.replace("://", "://shop.");

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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      const res = await fetch(`${API_BASE}/products`, {
        next: { revalidate: 3600 },
        signal: controller.signal,
      });

      if (res.ok) {
        const products: Product[] = await res.json();
        productRoutes = products.map((product) => ({
          url: `${shopSiteUrl}/${product.id}`,
          lastModified: new Date(),
          changeFrequency: "daily" as const,
          priority: 0.7,
        }));
      }
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    // Silently skip dynamic products if API is unavailable during build
    // This is expected during initial deployment when server may not be ready yet
    if (process.env.NODE_ENV === "development") {
      console.debug(
        "Sitemap: Skipping dynamic products (API unavailable)",
        (error as Error)?.message,
      );
    }
  }

  return [...staticRoutes, ...productRoutes];
}
