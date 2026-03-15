import type { Metadata } from "next";
import ProductDetail from "@/views/ProductDetail";
import { API_BASE } from "@/services/client";

type Props = { params: Promise<{ id: string }> };

/** Resolve a product image path to a fully-qualified URL for social crawlers. */
function resolveOgImage(
  image: string | undefined,
  shopSiteUrl: string,
): string {
  const fallback = `${shopSiteUrl}/shero.png`;
  if (!image) return fallback;
  if (image.startsWith("http")) return image;

  // Handle both leading slash and non-leading slash paths
  if (image.startsWith("/uploads")) {
    return `${shopSiteUrl}${image}`;
  }
  if (image.startsWith("uploads/")) {
    return `${shopSiteUrl}/${image}`;
  }

  return fallback;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com"
  ).replace(/\/$/, "");
  // If sharing from the shop, the canonical URL for social platforms should be on the shop subdomain
  const shopSiteUrl = (
    siteUrl.includes("shop.") ? siteUrl : siteUrl.replace("://", "://shop.")
  ).replace(/\/$/, "");
  const pageUrl = `${shopSiteUrl}/${id}`;
  const fallbackImageUrl = `${shopSiteUrl}/shero.png`;

  try {
    // Use the reliable API_BASE directly to avoid edge proxy resolution errors
    const endpoint = `${API_BASE}/products/${id}`;

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
