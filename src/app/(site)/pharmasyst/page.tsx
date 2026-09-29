import type { Metadata } from "next";
import { ProductPage } from "@/components/product/ProductPage";
import { products } from "@/content/products";
import { routes } from "@/lib/site";

const product = products.pharmasyst;

export const metadata: Metadata = {
  title: `Pharmasyst: ${product.title.replace(/\.$/, "")} · In development`,
  description: `${product.problemMobile} Pharmasyst is in development at SHERO. Join the waitlist.`,
  alternates: { canonical: routes.pharmasyst },
};

export default function PharmasystPage() {
  return <ProductPage product={product} />;
}
