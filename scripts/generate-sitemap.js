import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://sherotech.com";
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

function getProductIds() {
  try {
    const content = fs.readFileSync(PRODUCTS_FILE, "utf8");
    // Simple regex to find "id: "1"," or 'id: "1",' style entries
    const regex = /id:\s*["']([^"']+)["']/g;
    const ids = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      ids.push(match[1]);
    }
    return ids;
  } catch (error) {
    console.warn(
      "Warning: Could not read products file for sitemap generation.",
      error,
    );
    return [];
  }
}

function generateSitemap() {
  const productIds = getProductIds();
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
