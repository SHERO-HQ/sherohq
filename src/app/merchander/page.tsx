import type { Metadata } from "next";
import { ProductPage } from "@/components/product/ProductPage";
import { getProduct } from "@/content/products";

const product = getProduct("merchander");

export const metadata: Metadata = {
  title: product.name,
  description: `${product.name} by SHERO, for ${product.forWho.toLowerCase()} ${product.problem}`,
};

export default function MerchanderPage() {
  return <ProductPage product={product} />;
}
