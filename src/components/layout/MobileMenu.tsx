"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { buttonClass } from "@/components/ui/Button";
import { business, routes } from "@/lib/site";
import { cn } from "@/lib/cn";

/** `inDevelopment`: unreleased products are always labelled (CLAUDE.md). */
export type Child = { label: string; href: string; inDevelopment?: boolean };
type Item = { label: string; href: string; children?: Child[] };

/** The menu, with SHERO's products (from the admin) under Products. */
function menuItems(products: Child[]): Item[] {
  return [
    { label: "Services", href: routes.services },
    { label: "Shop", href: routes.shop },
    products.length > 0
      ? { label: "Products", href: routes.products, children: products }
      : { label: "Products", href: routes.products },
    { label: "Work", href: routes.work },
    { label: "About", href: routes.about },
    { label: "Support", href: routes.support },
    { label: "Track an order", href: routes.track },
  ];
}

function isCurrent(pathname: string, href: string) {
  if (href.includes("#")) return false;
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * A section that opens and closes (Products), so the menu stays short as it
 * grows. Starts open when the visitor is already on one of its pages.
 */
function Group({
  item,
  pathname,
  onClose,
  linkClass,
}: {
  item: Item;
  pathname: string;
  onClose: () => void;
  linkClass: (href: string) => string;
}) {
  const children = item.children ?? [];
  const [open, setOpen] = useState(() => children.some((child) => isCurrent(pathname, child.href)));
  const id = `menu-${item.label.toLowerCase()}`;
  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        className={cn(linkClass(item.href), "flex w-full items-center justify-between text-left")}
      >
        {item.label}
        <ChevronDown
          aria-hidden="true"
          size={18}
          strokeWidth={1.5}
          className={cn("text-ink-muted transition-transform duration-200", open && "rotate-180")}
        />
      </button>
      {open && (
        <ul id={id} className="-mt-1 pb-2 pl-4">
          {[{ label: `All ${item.label.toLowerCase()}`, href: item.href } as Child, ...children].map((child) => (
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
                {child.inDevelopment && <span className="text-meta text-ink-muted">In development</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/**
 * The phone menu: a plain list of links under the header, which stays in
 * place with its menu button turned into a close button. Escape closes it.
 */
export function MobileMenu({
  pathname,
  onClose,
  products,
}: {
  pathname: string;
  onClose: () => void;
  products: Child[];
}) {
  const items = menuItems(products);
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
              {item.children ? (
                <Group item={item} pathname={pathname} onClose={onClose} linkClass={link} />
              ) : (
                <Link
                  href={item.href}
                  onClick={onClose}
                  aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                  className={link(item.href)}
                >
                  {item.label}
                </Link>
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
