import type { Metadata } from "next";
import Products from "@/views/Products";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse SHERO's curated collection of premium tech products — laptops, accessories, smart devices, and more.",
};

export default function ShopPage() {
  return <Products />;
}
