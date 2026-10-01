"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { ArrowUpRight, ShoppingCart } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cartSnapshot, serverCartSnapshot, subscribeCart } from "@/lib/cart";
import { mainUrl, routes, shopUrl } from "@/lib/site";
import { cn } from "@/lib/cn";

const linkClass = (current: boolean) =>
  cn(
    "rounded-md px-3 py-1.5 text-label transition-all duration-150",
    current ? "bg-surface font-semibold text-primary" : "text-ink-secondary hover:bg-surface hover:text-primary",
  );

function CartLink({ pathname }: { pathname: string }) {
  const count = useSyncExternalStore(subscribeCart, cartSnapshot, serverCartSnapshot).length;
  return (
    <Link
      href={shopUrl.cart}
      aria-label={count === 0 ? "Cart, empty" : `Cart, ${count} ${count === 1 ? "item" : "items"}`}
      aria-current={pathname === routes.cart ? "page" : undefined}
      className="relative flex size-11 items-center justify-center rounded-sm text-ink-secondary hover:text-primary"
    >
      <ShoppingCart aria-hidden="true" size={20} strokeWidth={1.5} />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-1 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary-fill px-1 font-mono text-meta text-on-secondary-fill"
        >
          {count}
        </span>
      )}
    </Link>
  );
}

/**
 * The shop's own header (shop.sherohq.com): the shop, tracking and the cart,
 * with a way back to SHERO's business site. No consultation button: people
 * here are buying a device.
 */
export function ShopHeader() {
  const pathname = usePathname();
  // On shop.sherohq.com the list is "/" (rewritten to /shop); elsewhere it is /shop.
  const onList = pathname === routes.shop || pathname === "/";
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-page">
      <div className="container-site flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href={shopUrl.home} aria-label="SHERO Shop, all devices" className="flex items-center gap-2.5 rounded-sm">
            <Logo className="h-6 w-auto" />
            <span className="font-mono text-meta text-ink-muted">shop</span>
          </Link>
          <nav aria-label="Shop" className="hidden gap-1 sm:flex">
            <Link href={shopUrl.home} aria-current={onList ? "page" : undefined} className={linkClass(onList)}>
              All devices
            </Link>
            <Link
              href={shopUrl.track}
              aria-current={pathname === routes.track ? "page" : undefined}
              className={linkClass(pathname === routes.track)}
            >
              Track order
            </Link>
          </nav>
        </div>
        <div className="-mr-3 flex items-center gap-1 sm:mr-0">
          <Link
            href={mainUrl(routes.home)}
            className="hidden items-center gap-1 px-3 py-1.5 text-label text-ink-secondary hover:text-primary md:inline-flex"
          >
            SHERO for business <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.5} />
          </Link>
          <Link href={shopUrl.track} className="px-3 py-1.5 text-label text-ink-secondary hover:text-primary sm:hidden">
            Track
          </Link>
          <CartLink pathname={pathname} />
        </div>
      </div>
    </header>
  );
}
