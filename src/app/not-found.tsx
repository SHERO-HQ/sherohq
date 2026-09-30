import type { Metadata } from "next";
import { Analytics } from "@/components/analytics/Analytics";
import { NotFoundContent, notFoundClass } from "@/components/layout/NotFoundContent";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getPublishedProducts, productMenuLinks } from "@/lib/products";

export const metadata: Metadata = { title: "Page not found" };

// Addresses that match no route render outside the (site) group, so the header
// and footer are added here. Pages inside it that call notFound() (an unknown
// product, laptop or case study) use (site)/not-found.tsx instead.
export default async function NotFound() {
  const products = await getPublishedProducts();
  return (
    <>
      <SiteHeader products={productMenuLinks(products)} />
      <main id="main" className={notFoundClass}>
        <NotFoundContent />
      </main>
      <SiteFooter products={products} />
      <Analytics />
    </>
  );
}
