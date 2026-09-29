"use client";

import Link from "next/link";
import { useEffect } from "react";
import { buttonClass } from "@/components/ui/Button";
import { business, routes } from "@/lib/site";
import { cn } from "@/lib/cn";

type Item = { label: string; href: string; children?: Array<{ label: string; href: string }> };

const items: Item[] = [
  { label: "Services", href: routes.services },
  { label: "Shop", href: routes.shop },
  {
    label: "Products",
    href: routes.products,
    children: [
      { label: "Merchander", href: routes.merchander },
      { label: "Pharmasyst", href: routes.pharmasyst },
    ],
  },
  { label: "Work", href: routes.work },
  { label: "About", href: routes.about },
  { label: "Support", href: routes.support },
  { label: "Track an order", href: routes.track },
];

function isCurrent(pathname: string, href: string) {
  if (href.includes("#")) return false;
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The phone menu: a plain list of links under the header, which stays in
 * place with its menu button turned into a close button. Escape closes it.
 */
export function MobileMenu({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const link = (href: string) =>
    cn("block py-3 text-body font-medium", isCurrent(pathname, href) ? "text-primary" : "text-ink hover:text-primary");

  return (
    <nav
      id="mobile-menu"
      aria-label="Main"
      className="animate-menu-in fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-border bg-page lg:hidden"
    >
      <div className="container-site flex min-h-full flex-col pt-2 pb-8">
        <ul>
          {items.map((item) => (
            <li key={item.href} className="border-b border-border">
              <Link
                href={item.href}
                onClick={onClose}
                aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                className={link(item.href)}
              >
                {item.label}
              </Link>
              {item.children && (
                <ul className="-mt-1 pb-2 pl-4">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        onClick={onClose}
                        aria-current={isCurrent(pathname, child.href) ? "page" : undefined}
                        className={cn(
                          "flex items-baseline gap-2 py-1.5 text-body-sm",
                          isCurrent(pathname, child.href) ? "text-primary" : "text-ink-secondary hover:text-primary",
                        )}
                      >
                        {child.label}
                        {/* Unreleased products are always labelled (CLAUDE.md). */}
                        <span className="text-meta text-ink-muted">In development</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col gap-4">
          <Link href={routes.consultation} onClick={onClose} className={buttonClass({ size: "lg", full: true })}>
            Book a free consultation
          </Link>
          <p className="text-body-sm text-ink-muted">
            <a href={`tel:${business.phoneE164}`} className="hover:text-primary">
              {business.phoneDisplay}
            </a>
            {" · "}
            <a href={`mailto:${business.email}`} className="hover:text-primary">
              {business.email}
            </a>
          </p>
        </div>
      </div>
    </nav>
  );
}
