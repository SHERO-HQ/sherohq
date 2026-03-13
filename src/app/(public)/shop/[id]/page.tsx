import type { Metadata } from "next";
import ProductDetail from "@/views/ProductDetail";

type Props = { params: Promise<{ id: string }> };

/** Resolve a product image path to a fully-qualified URL for social crawlers. */
function resolveOgImage(image: string | undefined): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com";
  const fallback = `${siteUrl}/shero.png`;
  if (!image) return fallback;
  if (image.startsWith("http")) return image;

  const apiRoot = (
    process.env.NEXT_PUBLIC_API_URL || "https://api.sherohq.com"
  ).replace(/\/api$/, "");

  // Handle both leading slash and non-leading slash paths
  if (image.startsWith("/uploads")) {
    return `${apiRoot}${image}`;
  }
  if (image.startsWith("uploads/")) {
    return `${apiRoot}/${image}`;
  }

  return fallback;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com";
  // If sharing from the shop, the canonical URL for social platforms should be on the shop subdomain
  const shopSiteUrl = siteUrl.includes("shop.") ? siteUrl : siteUrl.replace("://", "://shop.");

  try {
    const apiBase = (
      process.env.NEXT_PUBLIC_API_URL || "https://api.sherohq.com"
    ).replace(/\/?$/, "");
    const endpoint = apiBase.endsWith("/api")
      ? `${apiBase}/products/${id}`
      : `${apiBase}/api/products/${id}`;

    const res = await fetch(endpoint, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("product not found");

    const product = await res.json();
    const imageUrl = resolveOgImage(product.image);
    const description: string = product.description
      ? String(product.description).slice(0, 160)
      : `${product.name} — GH₵${product.price}`;

    const cacheBustedImageUrl = `${imageUrl}${imageUrl.includes("?") ? "&" : "?"}v=whatsapp-v2`;

    return {
      title: product.name,
      description,
      metadataBase: new URL(shopSiteUrl),
      alternates: {
        canonical: `${shopSiteUrl}/${id}`,
      },
      openGraph: {
        type: "website",
        title: `${product.name} | SHERO`,
        description,
        url: `${shopSiteUrl}/${id}`,
        siteName: "SHERO",
        images: [
          {
            url: cacheBustedImageUrl,
            secureUrl: cacheBustedImageUrl,
            width: 1200,
            height: 630,
            alt: product.name,
          },
          {
            // Fallback smaller image for picky crawlers like WhatsApp
            url: `${siteUrl}/shero.png`,
            width: 400,
            height: 400,
            alt: "SHERO Logo",
          }
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} | SHERO`,
        description,
        images: [cacheBustedImageUrl],
      },
      other: {
        "image_src": cacheBustedImageUrl, // Legacy tag
        "thumbnail": cacheBustedImageUrl,
      }
    };
  } catch {
    // Fallback metadata if product fetch fails
    return {
      title: "Product | SHERO",
      description: "Explore our range of tech solutions at SHERO.",
    };
  }
}

export default function ProductDetailPage() {
  return <ProductDetail />;
}
