"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import type { NavItem } from "@/content/types";

export function MobileMenu({ items, cta }: { items: readonly NavItem[]; cta: NavItem }) {
  const pathname = usePathname();
  // The menu belongs to the page it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (value: boolean) => setOpenOn(value ? pathname : null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen(!open)}
        className="inline-flex size-11 items-center justify-center rounded-control text-ink hover:bg-surface"
      >
        {open ? <X aria-hidden="true" size={20} strokeWidth={1.5} /> : <Menu aria-hidden="true" size={20} strokeWidth={1.5} />}
      </button>
      <nav
        id={menuId}
        aria-label="Mobile"
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-border bg-page px-4 pb-6 shadow-[0_8px_24px_rgba(11,18,32,0.10)]"
      >
        <ul className="flex flex-col">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className="flex min-h-14 items-center border-b border-border text-lg font-medium text-ink"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href={cta.href}
          className="mt-6 flex min-h-12 items-center justify-center rounded-control bg-primary font-medium text-on-primary"
        >
          {cta.label}
        </Link>
      </nav>
    </div>
  );
}
