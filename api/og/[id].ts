// Vercel types (simplified to avoid needing @vercel/node locally)
interface VercelRequest {
  query: { [key: string]: string | string[] };
  headers: { [key: string]: string | undefined };
}

interface VercelResponse {
  send: (body: string) => void;
  redirect: (statusOrUrl: number | string, url?: string) => void;
  setHeader: (name: string, value: string) => void;
}

// Social media crawler User-Agent patterns
const SOCIAL_CRAWLERS = [
  "facebookexternalhit",
  "Facebot",
  "Twitterbot",
  "LinkedInBot",
  "WhatsApp",
  "TelegramBot",
  "Slackbot",
  "Discordbot",
  "Pinterest",
  "Applebot",
];

// Check if the request is from a social media crawler
function isSocialCrawler(userAgent: string | undefined): boolean {
  if (!userAgent) return false;
  return SOCIAL_CRAWLERS.some((crawler) =>
    userAgent.toLowerCase().includes(crawler.toLowerCase()),
  );
}

// Fetch product data from the backend API
async function fetchProduct(productId: string): Promise<{
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
} | null> {
  try {
    const apiUrl = "https://api.sherohq.com";
    const response = await fetch(`${apiUrl}/products/${productId}`, {
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// Get the full image URL
function getImageUrl(image: string | undefined): string {
  if (!image) return "https://sherohq.com/og-image.png";
  if (image.startsWith("http")) return image;
  if (image.startsWith("/uploads")) {
    return `https://api.sherohq.com${image}`;
  }
  return "https://sherohq.com/og-image.png";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const userAgent = req.headers["user-agent"];
  const productId = Array.isArray(id) ? id[0] : id;

  // If not a social crawler or no product ID, redirect to the SPA
  if (!productId || !isSocialCrawler(userAgent)) {
    return res.redirect(302, `/shop/${productId || ""}`);
  }

  // Fetch product data
  const product = await fetchProduct(productId);

  if (!product) {
    return res.redirect(302, `/shop/${productId}`);
  }

  // Prepare OG data
  const imageUrl = getImageUrl(product.image);
  const description =
    product.description || `${product.name} - GH₵${product.price}`;
  const truncatedDesc =
    description.length > 160 ? description.slice(0, 157) + "..." : description;
  const pageUrl = `https://sherohq.com/shop/${productId}`;

  // Return HTML with OG tags
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");

  return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${product.name} | SHERO</title>
  <meta name="description" content="${truncatedDesc}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="product">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${product.name}">
  <meta property="og:description" content="${truncatedDesc}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="SHERO">
  <meta property="product:price:amount" content="${product.price}">
  <meta property="product:price:currency" content="GHS">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${pageUrl}">
  <meta name="twitter:title" content="${product.name}">
  <meta name="twitter:description" content="${truncatedDesc}">
  <meta name="twitter:image" content="${imageUrl}">
  
  <!-- Redirect regular browsers to the actual page -->
  <meta http-equiv="refresh" content="0; url=${pageUrl}">
</head>
<body>
  <p>Redirecting to <a href="${pageUrl}">${product.name}</a>...</p>
</body>
</html>`);
}
