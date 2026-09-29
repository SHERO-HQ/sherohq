import type { Metadata } from "next";
import { ProductPage } from "@/components/product/ProductPage";
import { products } from "@/content/products";
import { routes } from "@/lib/site";

const product = products.merchander;

export const metadata: Metadata = {
  title: `Merchander: ${product.title.replace(/\.$/, "")} · In development`,
  description: `${product.problemMobile} Merchander is in development at SHERO. Join the waitlist.`,
  alternates: { canonical: routes.merchander },
};

export default function MerchanderPage() {
  return <ProductPage product={product} />;
}
