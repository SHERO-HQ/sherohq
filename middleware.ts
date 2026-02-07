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
function isSocialCrawler(userAgent: string | null): boolean {
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
    const apiUrl = "https://sherotech.onrender.com/api";
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
    return `https://sherotech.onrender.com${image}`;
  }
  return "https://sherohq.com/og-image.png";
}

// Generate HTML with proper OG meta tags
function generateOgHtml(
  product: {
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
  },
  url: string,
): string {
  const imageUrl = getImageUrl(product.image);
  const description =
    product.description || `${product.name} - GH₵${product.price}`;
  const truncatedDesc =
    description.length > 160 ? description.slice(0, 157) + "..." : description;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${product.name} | SHERO</title>
  <meta name="description" content="${truncatedDesc}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="product">
  <meta property="og:url" content="${url}">
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
  <meta name="twitter:url" content="${url}">
  <meta name="twitter:title" content="${product.name}">
  <meta name="twitter:description" content="${truncatedDesc}">
  <meta name="twitter:image" content="${imageUrl}">
  
  <!-- Redirect regular browsers to the actual page -->
  <meta http-equiv="refresh" content="0; url=${url}">
</head>
<body>
  <p>Redirecting to <a href="${url}">${product.name}</a>...</p>
</body>
</html>`;
}

export default async function middleware(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const userAgent = request.headers.get("user-agent");

  // Only intercept product pages for social crawlers
  if (!pathname.startsWith("/shop/") && !pathname.startsWith("/product/")) {
    // Pass through to the origin
    return fetch(request);
  }

  // Check if this is a social media crawler
  if (!isSocialCrawler(userAgent)) {
    return fetch(request);
  }

  // Extract product ID from the URL
  const pathParts = pathname.split("/");
  const productId = pathParts[pathParts.length - 1];

  if (!productId || productId === "shop" || productId === "product") {
    return fetch(request);
  }

  // Fetch product data
  const product = await fetchProduct(productId);

  if (!product) {
    return fetch(request);
  }

  // Generate HTML with OG tags
  const html = generateOgHtml(product, request.url);

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600", // Cache for 1 hour
    },
  });
}

// Vercel Edge Config
export const config = {
  matcher: ["/shop/:path*", "/product/:path*"],
};
