import type { Metadata } from "next";
import ProductDetail from "@/views/ProductDetail";
import { formatCurrency } from "@/utils/format";
import type { Product } from "@/types/product";
import { headers } from "next/headers";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const headerList = await headers();
  const host = headerList.get("host") || "shop.sherohq.com";
  const protocol = host.includes("localhost") ? "http" : "https";

  try {
    const { db } = await import("@/lib/db");
    const { sql } = await import("drizzle-orm");
    const res = await db.execute(sql`
      SELECT id, name, price, "originalPrice", image, images, description FROM products WHERE id = ${id} OR slug = ${id} OR sku = ${id}
    `);

    if (!res.rows || res.rows.length === 0) {
      throw new Error(`Product not found in DB`);
    }

    const product = res.rows[0] as any as Product;

    // Parse price to number if it comes back as a string from numeric column
    if (typeof product.price === "string")
      product.price = parseFloat(product.price);
    if (typeof product.originalPrice === "string")
      product.originalPrice = parseFloat(product.originalPrice);

    return generateProductMetadata(product, host, id);
  } catch (error) {
    console.error(`[Metadata] Failed to fetch product ${id} from DB:`, error);
    const siteUrl = `${protocol}://${host}`;
    const pageUrl = `${siteUrl}/shop/${id}`;

    // Provide a rich fallback to ensure social sharing works even if API fails
    return {
      title: { absolute: "SHERO | Technology Solutions" },
      description:
        "Premium technology solutions, hardware, and software services.",
      metadataBase: new URL(siteUrl),
      alternates: { canonical: pageUrl },
      openGraph: {
        type: "website",
        title: "SHERO | Technology Solutions",
        description:
          "Premium technology solutions, hardware, and software services.",
        url: pageUrl,
        siteName: "SHERO",
        images: [
          {
            url: `${siteUrl}/shero.png`,
            width: 1200,
            height: 630,
            alt: "SHERO",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "SHERO | Technology Solutions",
        description:
          "Premium technology solutions, hardware, and software services.",
        images: [`${siteUrl}/shero.png`],
      },
    };
  }
}

function generateProductMetadata(
  product: Product,
  host: string,
  id: string,
): Metadata {
  const protocol = host.includes("localhost") ? "http" : "https";
  const siteUrl = `${protocol}://${host}`;
  const pageUrl = `${siteUrl}/shop/${id}`;

  const primaryImage =
    (Array.isArray(product.images) && product.images[0]) || product.image;
  let imageUrl = `${siteUrl}/shero.png`; // Fallback image
  if (primaryImage) {
    imageUrl = primaryImage.startsWith("http")
      ? primaryImage
      : `${siteUrl}${primaryImage.startsWith("/") ? "" : "/"}${primaryImage}`;
  }

  const isDiscounted =
    product.originalPrice && product.originalPrice > product.price;
  const priceText = formatCurrency(product.price);

  const title = `${product.name} - ${priceText} | SHERO`;
  const description = product.description
    ? product.description.substring(0, 160)
    : `Check out ${isDiscounted ? "Discounted " : ""}${product.name} - ${priceText} on SHERO`;

  return {
    title: { absolute: title },
    description,
    metadataBase: new URL(siteUrl),
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "website",
      title,
      description,
      url: pageUrl,
      siteName: "SHERO",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default function ProductDetailPage() {
  return <ProductDetail />;
}
