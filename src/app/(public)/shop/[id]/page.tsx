import type { Metadata } from "next";
import ProductDetail from "@/views/ProductDetail";
import { formatCurrency } from "@/utils/format";

type Props = { params: Promise<{ id: string }> };

function toAbsoluteBaseUrl(
  value: string | undefined,
  fallback: string,
): string {
  const raw = value?.trim();
  if (!raw) return fallback;

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw.replace(/\/$/, "");
  }

  if (raw.startsWith("/")) {
    return `${fallback}${raw}`.replace(/\/$/, "");
  }

  return `https://${raw}`.replace(/\/$/, "");
}

function getShopSiteUrl(siteUrl: string): string {
  try {
    const parsed = new URL(siteUrl);
    const port = parsed.port ? `:${parsed.port}` : "";

    if (
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname.startsWith("192.168.")
    ) {
      return `${parsed.protocol}//${parsed.hostname}${port}`;
    }

    if (parsed.hostname.startsWith("shop.")) {
      return `${parsed.protocol}//${parsed.hostname}${port}`;
    }

    const rootHost = parsed.hostname.startsWith("www.")
      ? parsed.hostname.slice(4)
      : parsed.hostname;

    return `${parsed.protocol}//shop.${rootHost}${port}`;
  } catch {
    return siteUrl;
  }
}

function getApiBaseUrl(siteUrl: string): string {
  // Use robust logic to ensure absolute URLs on server-side
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
  let base = "";

  if (envUrl) {
    if (envUrl.startsWith("http")) {
      base = envUrl.replace(/\/$/, "");
    } else if (envUrl.startsWith("/")) {
      // If it's a relative path (e.g. /api), we MUST prepend the siteUrl for server-side fetch
      base = `${siteUrl.replace(/\/$/, "")}${envUrl}`.replace(/\/$/, "");
    } else {
      base = `https://${envUrl.replace(/\/$/, "")}`;
    }
  } else {
    // Current primary production API fallback
    base = "https://api.sherohq.com/api";
  }

  // Robustly ensure the /api suffix is present for the fetch call
  if (!base.endsWith("/api") && !base.includes("/api/")) {
    return `${base}/api`;
  }
  return base;
}

/** Resolve a product image path to a fully-qualified URL for social crawlers. */
function resolveOgImage(
  image: string | undefined,
  apiBaseUrl: string,
  shopSiteUrl: string,
): string {
  const fallback = `${shopSiteUrl}/shero.png`;
  if (!image) return fallback;
  if (image.startsWith("data:") || image.startsWith("blob:")) return fallback;
  if (image.startsWith("http")) return image;
  if (image.startsWith("//")) return `https:${image}`;

  // If it's an upload path, it lives on the API server
  if (image.startsWith("/uploads")) {
    const base = apiBaseUrl.replace(/\/api$/, "");
    // Construct absolute URL
    if (base.startsWith("http")) {
      return `${base}${image}`;
    }
    // Fallback to shop site if API base is relative (unlikely with new getApiBaseUrl)
    return `${shopSiteUrl}${image}`;
  }

  const normalizedPath = image.startsWith("/") ? image : `/${image}`;
  return `${shopSiteUrl}${normalizedPath}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const siteUrl = toAbsoluteBaseUrl(
    process.env.NEXT_PUBLIC_SITE_URL,
    "https://sherohq.com",
  );
  const shopSiteUrl = getShopSiteUrl(siteUrl);
  const apiBaseUrl = getApiBaseUrl(siteUrl);
  const pageUrl = `${shopSiteUrl}/shop/${id}`;
  const fallbackImageUrl = `${shopSiteUrl}/shero.png`;

  try {
    const endpoint = `${apiBaseUrl}${apiBaseUrl.endsWith("/") ? "" : "/"}products/${id}`;

    const res = await fetch(endpoint, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("product not found");

    const product = await res.json();
    const primaryImage =
      (Array.isArray(product.images) && product.images[0]) || product.image;
    const imageUrl = resolveOgImage(primaryImage, apiBaseUrl, shopSiteUrl);
    
    const isDiscounted =
      product.originalPrice && product.originalPrice > product.price;
    const priceText = formatCurrency(product.price);

    const title = `${product.name} - ${priceText} | SHERO`;
    const description = `Check out ${
      isDiscounted ? "Discounted " : ""
    }${product.name} - ${priceText} on SHERO`;

    const imageType = imageUrl.toLowerCase().endsWith(".png")
      ? "image/png"
      : imageUrl.toLowerCase().endsWith(".webp")
        ? "image/webp"
        : "image/jpeg";

    return {
      title: { absolute: title },
      description,
      metadataBase: new URL(shopSiteUrl),
      alternates: {
        canonical: pageUrl,
      },
      openGraph: {
        type: "website",
        title,
        description,
        url: pageUrl,
        siteName: "SHERO",
        images: [
          {
            url: imageUrl,
            secureUrl: imageUrl,
            width: 1200,
            height: 630,
            alt: product.name,
            type: imageType,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
      other: {
        image_src: imageUrl, // Legacy tag
        thumbnail: imageUrl,
      },
    };
  } catch (error) {
    console.error(`[Metadata] Failed to fetch product ${id}:`, {
      error,
      endpoint: `${getApiBaseUrl(
        toAbsoluteBaseUrl(
          process.env.NEXT_PUBLIC_SITE_URL,
          "https://sherohq.com",
        ),
      )}/products/${id}`,
    });
    // Fallback metadata if product fetch fails (still include a valid OG image for link previews)
    return {
      title: "Product | SHERO",
      description: "Explore our range of tech solutions at SHERO.",
      metadataBase: new URL(shopSiteUrl),
      alternates: {
        canonical: pageUrl,
      },
      openGraph: {
        type: "website",
        title: "Product | SHERO",
        description: "Explore our range of tech solutions at SHERO.",
        url: pageUrl,
        siteName: "SHERO",
        images: [
          {
            url: fallbackImageUrl,
            secureUrl: fallbackImageUrl,
            width: 1200,
            height: 630,
            alt: "SHERO",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "Product | SHERO",
        description: "Explore our range of tech solutions at SHERO.",
        images: [fallbackImageUrl],
      },
    };
  }
}

export default function ProductDetailPage() {
  return <ProductDetail />;
}
