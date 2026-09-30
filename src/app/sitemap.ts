import type { MetadataRoute } from "next";
import { projects } from "@/content/work";
import { getPublishedProducts, productPath } from "@/lib/products";
import { livePages, routes, siteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getPublishedProducts();
  const pages = [
    ...livePages,
    ...products.map((product) => productPath(product.slug)),
    ...projects.map((project) => `${routes.work}/${project.slug}`),
  ];
  return pages.map((path) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
