import type { Metadata } from "next";
import ProductDetail from "@/views/ProductDetail";

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
  const apiUrl = toAbsoluteBaseUrl(process.env.NEXT_PUBLIC_API_URL, siteUrl);
  return apiUrl.endsWith("/api") ? apiUrl : `${apiUrl}/api`;
}

/** Resolve a product image path to a fully-qualified URL for social crawlers. */
function resolveOgImage(
  image: string | undefined,
  shopSiteUrl: string,
): string {
  const fallback = `${shopSiteUrl}/shero.png`;
  if (!image) return fallback;
  if (image.startsWith("data:") || image.startsWith("blob:")) return fallback;
  if (image.startsWith("http")) return image;
  if (image.startsWith("//")) return `https:${image}`;

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
  const pageUrl = `${shopSiteUrl}/shop/${id}`;
  const fallbackImageUrl = `${shopSiteUrl}/shero.png`;

  try {
    const endpoint = `${getApiBaseUrl(siteUrl)}/products/${id}`;

    const res = await fetch(endpoint, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("product not found");

    const product = await res.json();
    const primaryImage =
      (Array.isArray(product.images) && product.images[0]) || product.image;
    const imageUrl = resolveOgImage(primaryImage, shopSiteUrl);
    const description: string = product.description
      ? String(product.description).slice(0, 160)
      : `${product.name} — GH₵${product.price}`;

    const imageType = imageUrl.toLowerCase().endsWith(".png")
      ? "image/png"
      : imageUrl.toLowerCase().endsWith(".webp")
        ? "image/webp"
        : "image/jpeg";

    return {
      title: product.name,
      description,
      metadataBase: new URL(shopSiteUrl),
      alternates: {
        canonical: pageUrl,
      },
      openGraph: {
        type: "website",
        title: `${product.name} | SHERO`,
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
          {
            // Fallback smaller image for picky crawlers like WhatsApp
            url: fallbackImageUrl,
            width: 400,
            height: 400,
            alt: "SHERO Logo",
            type: "image/png",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} | SHERO`,
        description,
        images: [imageUrl],
      },
      other: {
        image_src: imageUrl, // Legacy tag
        thumbnail: imageUrl,
      },
    };
  } catch {
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
