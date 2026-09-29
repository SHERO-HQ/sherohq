import type { MetadataRoute } from "next";
import { livePages, siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return livePages.map((path) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
