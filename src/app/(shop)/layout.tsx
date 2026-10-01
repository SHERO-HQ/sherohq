import { Analytics } from "@/components/analytics/Analytics";
import { ShopFooter } from "@/components/shop/ShopFooter";
import { ShopHeader } from "@/components/shop/ShopHeader";

/**
 * The shop's own site (shop.sherohq.com in production): its own header and
 * footer, same design system, same admin. The business site is (site).
 */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-sm focus:bg-primary-fill focus:px-4 focus:py-2 focus:text-on-primary-fill"
      >
        Skip to content
      </a>
      <ShopHeader />
      <main id="main">{children}</main>
      <ShopFooter />
      <Analytics />
    </>
  );
}
