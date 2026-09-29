"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ArrowRight, ShoppingCart, X } from "lucide-react";
import { MenuIcon } from "@/components/ui/MenuIcon";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ButtonLink, buttonClass } from "@/components/ui/Button";
import { cartSnapshot, serverCartSnapshot, subscribeCart } from "@/lib/cart";
import { business, mainNav, routes } from "@/lib/site";
import { cn } from "@/lib/cn";

const menuNav = [...mainNav, { label: "Support", href: routes.support }];

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

  // Stop the page scrolling behind the open menu. Menu links close it on click.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

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
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
            className="flex size-11 items-center justify-center rounded-sm text-ink-secondary lg:hidden"
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-page shadow-float lg:hidden"
        >
          <div className="container-site flex h-16 shrink-0 items-center justify-between border-b border-border">
            <Link href={routes.home} aria-label="SHERO home" className="rounded-sm">
              <Logo className="h-6 w-auto" />
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              autoFocus
              className="-mr-3 flex size-11 items-center justify-center rounded-sm text-ink"
            >
              <X size={22} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Main" className="container-site flex flex-col pt-3">
            {menuNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                className="flex items-center justify-between border-b border-border py-4"
              >
                <span className="font-display text-h2 text-heading">
                  {item.label}
                </span>
                <ArrowRight aria-hidden="true" size={20} strokeWidth={1.5} className="text-primary" />
              </Link>
            ))}
          </nav>

          <div className="container-site flex flex-col gap-3 py-8">
            <Link
              href={routes.consultation}
              onClick={() => setMenuOpen(false)}
              className={buttonClass({ size: "lg", full: true })}
            >
              Book a free consultation
            </Link>
            <Link
              href={routes.track}
              onClick={() => setMenuOpen(false)}
              className={buttonClass({ variant: "outline", size: "lg", full: true })}
            >
              Track an order
            </Link>
          </div>

          <div className="container-site mt-auto flex flex-col gap-1 border-t border-border pt-6 pb-8 font-mono text-meta">
            <a href={`mailto:${business.email}`} className="text-ink-secondary">
              {business.email}
            </a>
            <a href={`tel:${business.phoneE164}`} className="text-ink-secondary">
              {business.phoneDisplay}
            </a>
            <span className="text-ink-muted">{business.hoursShort}</span>
          </div>
        </div>
      )}
    </header>
  );
}
