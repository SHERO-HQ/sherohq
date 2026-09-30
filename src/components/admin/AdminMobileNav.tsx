"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminNavLink } from "@/components/admin/AdminNavLink";
import { MenuIcon } from "@/components/ui/MenuIcon";
import type { NavGroup, NavItem } from "./AdminShell";

/**
 * Phones and tablets: the sections behind the menu button, in the same groups
 * as the sidebar. Escape or choosing a section closes it.
 */
export function AdminMobileNav({
  nav,
  footer,
  brand,
  actions,
}: {
  nav: NavGroup[];
  footer: NavItem[];
  brand: React.ReactNode;
  /** View site and Log out, shown under the sections. */
  actions: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => {
    setOpen(false);
    button.current?.focus();
  }, []);
  const waiting = nav.flatMap((group) => group.items).reduce((sum, item) => sum + (item.count ?? 0), 0);

  // A new page closes the menu.
  const [shownFor, setShownFor] = useState(pathname);
  if (shownFor !== pathname) {
    setShownFor(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <div className="border-b border-border bg-surface lg:hidden">
      <div className="flex h-14 items-center justify-between px-gutter">
        {brand}
        <button
          ref={button}
          type="button"
          aria-label={open ? "Close menu" : waiting > 0 ? `Open menu, ${waiting} waiting` : "Open menu"}
          aria-expanded={open}
          aria-controls="admin-menu"
          onClick={() => (open ? close() : setOpen(true))}
          className="relative -mr-2.5 flex size-11 items-center justify-center rounded-sm text-ink"
        >
          <MenuIcon open={open} />
          {!open && waiting > 0 && <span aria-hidden="true" className="absolute top-2 right-2 size-2 rounded-full bg-primary" />}
        </button>
      </div>
      {open && (
        <div id="admin-menu" className="flex flex-col gap-5 border-t border-border px-gutter pt-4 pb-6">
          <nav aria-label="Admin" className="flex flex-col gap-5">
            {nav.map((group, i) => (
              <div key={group.label ?? i} className="flex flex-col gap-0.5">
                {group.label && <span className="px-2.5 pb-1 font-mono text-meta text-ink-muted">{group.label}</span>}
                {group.items.map((item) => (
                  <AdminNavLink key={item.href} item={item} touch />
                ))}
              </div>
            ))}
            <div className="flex flex-col gap-0.5 border-t border-border pt-3">
              {footer.map((item) => (
                <AdminNavLink key={item.href} item={item} touch />
              ))}
            </div>
          </nav>
          {actions}
        </div>
      )}
    </div>
  );
}
