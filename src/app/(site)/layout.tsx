import { Analytics } from "@/components/analytics/Analytics";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getPublishedProducts, productMenuLinks } from "@/lib/products";

/** Public website chrome. The admin gets its own layout. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const products = await getPublishedProducts();
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-sm focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
      >
        Skip to content
      </a>
      <SiteHeader products={productMenuLinks(products)} />
      <main id="main">{children}</main>
      <SiteFooter products={products} />
      <Analytics />
    </>
  );
}
