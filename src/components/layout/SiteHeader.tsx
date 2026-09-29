"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { ShoppingCart } from "lucide-react";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { MenuIcon } from "@/components/ui/MenuIcon";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ButtonLink } from "@/components/ui/Button";
import { cartSnapshot, serverCartSnapshot, subscribeCart } from "@/lib/cart";
import { mainNav, routes } from "@/lib/site";
import { cn } from "@/lib/cn";

function isCurrent(pathname: string, href: string) {
  if (href.includes("#")) return false;
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

const shopPaths = [routes.shop, routes.cart, routes.checkout];

/** Shown on shop pages, or anywhere once something is in the cart (CLAUDE.md). */
function CartLink({ pathname }: { pathname: string }) {
  const count = useSyncExternalStore(subscribeCart, cartSnapshot, serverCartSnapshot).length;
  const onShop = shopPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  if (!onShop && count === 0) return null;
  return (
    <Link
      href={routes.cart}
      aria-label={count === 0 ? "Cart, empty" : `Cart, ${count} ${count === 1 ? "item" : "items"}`}
      aria-current={pathname === routes.cart ? "page" : undefined}
      className="relative flex size-11 items-center justify-center rounded-sm text-ink-secondary hover:text-primary"
    >
      <ShoppingCart aria-hidden="true" size={20} strokeWidth={1.5} />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-1 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 font-mono text-meta text-on-secondary"
        >
          {count}
        </span>
      )}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    menuButton.current?.focus();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-page">
      <div className="container-site flex h-16 items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href={routes.home} aria-label="SHERO home" className="rounded-sm">
            <Logo className="h-6 w-auto" />
          </Link>
          <nav aria-label="Main" className="hidden gap-6 lg:flex">
            {mainNav.map((item) => {
              const current = isCurrent(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "rounded-sm text-label transition-colors duration-150 hover:text-primary",
                    current ? "text-primary" : "text-ink-secondary",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="-mr-3 flex items-center lg:mr-0 lg:gap-1">
          <CartLink pathname={pathname} />
          <ThemeToggle />
          <span className="ml-2 hidden lg:contents">
            <ButtonLink href={routes.consultation}>Book a consultation</ButtonLink>
          </span>

          <button
            ref={menuButton}
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
            className="flex size-11 items-center justify-center rounded-sm text-ink lg:hidden"
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </div>

      {menuOpen && <MobileMenu pathname={pathname} onClose={closeMenu} />}
    </header>
  );
}
