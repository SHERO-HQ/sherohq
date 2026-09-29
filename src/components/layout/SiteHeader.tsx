"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { business, mainNav, routes } from "@/lib/site";
import { cn } from "@/lib/cn";

const menuNav = [...mainNav, { label: "Support", href: routes.support }];

function isCurrent(pathname: string, href: string) {
  if (href.includes("#")) return false;
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
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
      <div className="container-site flex h-[60px] items-center justify-between !pr-3 lg:h-[76px] lg:!pr-20">
        <div className="flex items-center gap-14">
          <Link href={routes.home} aria-label="SHERO home" className="rounded-sm">
            <Logo className="h-[22px] w-auto lg:h-7" />
          </Link>
          <nav aria-label="Main" className="hidden gap-8 lg:flex">
            {mainNav.map((item) => {
              const current = isCurrent(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "rounded-sm text-[15px]/5 font-medium transition-colors duration-150 hover:text-primary",
                    current ? "text-primary" : "text-ink-secondary",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <Link
          href={routes.consultation}
          className="hidden h-10 items-center whitespace-nowrap rounded-sm border border-primary bg-primary px-[18px] text-[15px]/5 font-medium text-on-primary transition-colors duration-150 hover:border-primary-hover hover:bg-primary-hover lg:inline-flex"
        >
          Book a consultation
        </Link>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(true)}
          className="flex size-11 items-center justify-center rounded-sm text-ink-secondary lg:hidden"
        >
          <Menu size={22} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      {menuOpen && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-page shadow-float lg:hidden"
        >
          <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-border pr-3 pl-5">
            <Link href={routes.home} aria-label="SHERO home" className="rounded-sm">
              <Logo className="h-[22px] w-auto" />
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              autoFocus
              className="flex size-11 items-center justify-center rounded-sm text-ink"
            >
              <X size={22} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Main" className="flex flex-col px-5 pt-3">
            {menuNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                className="flex items-center justify-between border-b border-border py-4"
              >
                <span className="font-display text-[30px]/[34px] font-bold tracking-[-0.02em] text-heading">
                  {item.label}
                </span>
                <ArrowRight aria-hidden="true" size={20} strokeWidth={1.5} className="text-primary" />
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3.5 px-5 py-7">
            <Link
              href={routes.consultation}
              onClick={() => setMenuOpen(false)}
              className="flex h-[52px] items-center justify-center rounded-sm bg-primary text-base/5 font-medium text-on-primary"
            >
              Book a free consultation
            </Link>
            <Link
              href={routes.track}
              onClick={() => setMenuOpen(false)}
              className="flex h-12 items-center justify-center rounded-sm border border-border-strong text-[15px]/5 font-medium text-ink"
            >
              Track an order
            </Link>
          </div>

          <div className="mt-auto flex flex-col gap-1 border-t border-border px-5 pt-6 pb-8 font-mono">
            <a href={`mailto:${business.email}`} className="text-[13px]/[17px] text-ink-secondary">
              {business.email}
            </a>
            <a href={`tel:${business.phoneE164}`} className="text-[13px]/[17px] text-ink-secondary">
              {business.phoneDisplay}
            </a>
            <span className="text-xs/4 text-ink-muted">{business.hoursShort}</span>
          </div>
        </div>
      )}
    </header>
  );
}
