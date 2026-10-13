import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { work } from "@/content/work";

const staticRoutes = [
  "",
  "/solutions",
  "/work",
  "/consultation",
  "/about-us",
  "/contact-us",
  "/careers",
  "/partners",
  "/support",
  "/faq",
  "/feedback",
  "/merchander",
  "/pharmasyst",
  "/privacy",
  "/terms",
  "/cookies",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [...staticRoutes, ...work.map((w) => `/work/${w.slug}`)].map((path) => ({ url: `${site.url}${path}` }));
}
