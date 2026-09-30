"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { Child } from "@/components/layout/MobileMenu";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/cn";

/**
 * Products in the desktop header: a small menu of SHERO's own products (from
 * the admin), like the phone menu, rather than a jump to a section of Home.
 * Escape, a click elsewhere or choosing one closes it.
 */
export function ProductsMenu({
  products,
  pathname,
  linkClass,
}: {
  products: Child[];
  pathname: string;
  linkClass: (current: boolean) => string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const current = products.some((p) => pathname === p.href);

  // A new page closes the menu.
  const [shownFor, setShownFor] = useState(pathname);
  if (shownFor !== pathname) {
    setShownFor(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onClick = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls="products-menu"
        onClick={() => setOpen(!open)}
        className={cn(linkClass(current), "inline-flex items-center gap-1")}
      >
        Products
        <ChevronDown
          aria-hidden="true"
          size={14}
          strokeWidth={1.5}
          className={cn("transition-transform duration-150", open && "rotate-180")}
        />
      </button>
      {open && (
        <ul
          id="products-menu"
          className="absolute top-full left-0 mt-2 flex w-72 flex-col rounded-md border border-border bg-surface-raised p-1.5 shadow"
        >
          {products.map((product) => (
            <li key={product.href}>
              <Link
                href={product.href}
                aria-current={pathname === product.href ? "page" : undefined}
                className="flex items-center justify-between gap-3 rounded-sm px-3 py-2.5 text-label text-ink hover:bg-surface hover:text-primary"
              >
                {product.label}
                {product.inDevelopment && <StatusBadge status="dev" size="sm" />}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
