import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://sherohq.com";
const OUTPUT_FILE = path.join(__dirname, "../public/sitemap.xml");
const PRODUCTS_FILE = path.join(__dirname, "../src/data/products.ts");

const staticRoutes = [
  "/",
  "/products",
  "/solutions",
  "/consultation",
  "/about-us",
  "/partners",
  "/support",
  "/faq",
  "/contact-us",
  "/terms",
  "/privacy",
  "/cookies",
  "/login",
  "/signup",
];

// Fallback IDs if API is not reachable
const FALLBACK_PRODUCT_IDS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

async function getProductIds() {
  try {
    // Try to fetch from local API if server is running
    const response = await fetch("http://localhost:5000/api/products");
    if (response.ok) {
      const products = await response.json();
      const ids = products.map((p) => p.id);
      console.log(`📡 Fetched ${ids.length} products from API`);
      return ids;
    }
  } catch (e) {
    // Server likely not running
  }

  // Fallback: Read from seed file would be complex due to TS, so using hardcoded list
  // which matches the seed data we saw in server/src/db/seed.ts
  console.log("⚠️ API unreachable, using fallback product IDs");
  return FALLBACK_PRODUCT_IDS;
}

async function generateSitemap() {
  const productIds = await getProductIds();
  const currentDate = new Date().toISOString().split("T")[0];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add static routes
  staticRoutes.forEach((route) => {
    xml += "  <url>\n";
    xml += `    <loc>${BASE_URL}${route}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += "    <changefreq>weekly</changefreq>\n";
    xml += "    <priority>0.8</priority>\n";
    xml += "  </url>\n";
  });

  // Add product routes
  productIds.forEach((id) => {
    xml += "  <url>\n";
    xml += `    <loc>${BASE_URL}/products/${id}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += "    <changefreq>daily</changefreq>\n";
    xml += "    <priority>0.9</priority>\n";
    xml += "  </url>\n";
  });

  xml += "</urlset>";

  fs.writeFileSync(OUTPUT_FILE, xml);
  console.log(
    `✅ Sitemap generated at ${OUTPUT_FILE} with ${staticRoutes.length + productIds.length} URLs`,
  );
}

generateSitemap();
