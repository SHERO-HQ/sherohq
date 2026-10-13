import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { work } from "@/content/work";

const staticRoutes = ["", "/services", "/work", "/merchander", "/pharmasyst", "/about", "/contact", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [...staticRoutes, ...work.map((w) => `/work/${w.slug}`)].map((path) => ({ url: `${site.url}${path}` }));
}
