import type { Metadata } from "next";
import Solutions from "@/views/Solutions";

export const metadata: Metadata = {
  title: "Products & Solutions",
  description:
    "Explore our commercial hardware, purposeful software products, and technology solutions built for modern businesses.",
};

export default function ProductsPage() {
  return <Solutions />;
}
