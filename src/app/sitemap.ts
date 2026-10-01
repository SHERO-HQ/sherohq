import type { MetadataRoute } from "next";
import { getPublishedProducts, productPath } from "@/lib/products";
import { absoluteUrl, livePages, routes, shopUrl, siteUrl } from "@/lib/site";
import { getPublishedProjects } from "@/lib/work";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, projects] = await Promise.all([getPublishedProducts(), getPublishedProjects()]);
  const pages = [
    ...livePages,
    ...products.map((product) => productPath(product.slug)),
    ...projects.map((project) => `${routes.work}/${project.slug}`),
  ];
  // Shop pages carry the shop's own address once it's live (both hosts verified in Search Console).
  const shopPages: Record<string, string> = { [routes.shop]: shopUrl.home, [routes.track]: shopUrl.track };
  return pages.map((path) => ({
    url: shopPages[path] ? absoluteUrl(shopPages[path]) : `${siteUrl}${path === "/" ? "" : path}`,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
