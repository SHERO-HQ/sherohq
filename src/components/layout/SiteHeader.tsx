"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { MobileMenu, type Child } from "@/components/layout/MobileMenu";
import { ProductsMenu } from "@/components/layout/ProductsMenu";
import { MenuIcon } from "@/components/ui/MenuIcon";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { mainNav, routes, shopUrl } from "@/lib/site";
import { cn } from "@/lib/cn";

function isCurrent(pathname: string, href: string) {
  if (href.includes("#")) return false;
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

const navLinkClass = (current: boolean) =>
  cn(
    "rounded-md px-3 py-1.5 text-label transition-all duration-150",
    current ? "bg-surface font-semibold text-primary" : "text-ink-secondary hover:bg-surface hover:text-primary",
  );

export function SiteHeader({ products }: { products: Child[] }) {
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
        <div className="flex items-center gap-8">
          <Link
            href={routes.home}
            aria-label="SHERO home"
            className="rounded-sm transition-opacity hover:opacity-90 active-press"
          >
            <Logo className="h-6 w-auto" />
          </Link>
          <nav aria-label="Main" className="hidden gap-1 lg:flex">
            {mainNav.map((item) => {
              if (item.href === routes.products && products.length > 0) {
                return (
                  <ProductsMenu key={item.href} products={products} pathname={pathname} linkClass={navLinkClass} />
                );
              }
              const current = isCurrent(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  className={navLinkClass(current)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="-mr-3 flex items-center lg:mr-0 lg:gap-1.5">
          {/* The shop is its own site: set apart from the business sections. */}
          <Link
            href={shopUrl.home}
            className="hidden items-center gap-1 rounded-md px-3 py-1.5 text-label text-ink-secondary transition-all duration-150 hover:bg-surface hover:text-primary lg:inline-flex"
          >
            Shop <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.5} />
          </Link>
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
            className="flex size-11 items-center justify-center rounded-md text-ink transition-colors duration-150 hover:bg-surface active-press lg:hidden"
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </div>

      {menuOpen && <MobileMenu pathname={pathname} onClose={closeMenu} products={products} />}
    </header>
  );
}
