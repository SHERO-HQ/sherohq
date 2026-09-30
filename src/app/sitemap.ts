import type { MetadataRoute } from "next";
import { getPublishedProducts, productPath } from "@/lib/products";
import { livePages, routes, siteUrl } from "@/lib/site";
import { getPublishedProjects } from "@/lib/work";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, projects] = await Promise.all([getPublishedProducts(), getPublishedProjects()]);
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
