import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPage } from "@/components/product/ProductPage";
import { getPublishedProduct, getPublishedProducts, productPath } from "@/lib/products";

// SHERO's own products, one page each at /<slug>, from the admin. Pages are
// built ahead for the products known at deploy time and refreshed when the
// admin saves one; a product published later is built on first visit.
export const revalidate = 3600;

type Props = { params: Promise<{ product: string }> };

export async function generateStaticParams() {
  return (await getPublishedProducts()).map((product) => ({ product: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getPublishedProduct((await params).product);
  if (!product) return {};
  const inDevelopment = product.status === "in_development";
  return {
    title: `${product.name}: ${product.title.replace(/\.$/, "")}${inDevelopment ? " · In development" : ""}`,
    description: inDevelopment
      ? `${product.summary} ${product.name} is in development at SHERO. Join the waitlist.`
      : `${product.summary} ${product.name}, by SHERO.`,
    alternates: { canonical: productPath(product.slug) },
  };
}

export default async function ProductRoute({ params }: Props) {
  const product = await getPublishedProduct((await params).product);
  if (!product) notFound();
  return <ProductPage product={product} />;
}
