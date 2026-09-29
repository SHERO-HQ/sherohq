import type { MetadataRoute } from "next";
import { projects } from "@/content/work";
import { livePages, routes, siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [...livePages, ...projects.map((project) => `${routes.work}/${project.slug}`)];
  return pages.map((path) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
