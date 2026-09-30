"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import type { NavItem } from "./AdminShell";

export function AdminNavLink({ item, compact }: { item: NavItem; compact?: boolean }) {
  const pathname = usePathname();
  const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
  return (
    <Link
      href={item.href}
      aria-current={current ? "page" : undefined}
      className={cn(
        "flex items-center justify-between gap-3 rounded-sm text-body-sm whitespace-nowrap",
        compact ? "h-9 px-3" : "h-9 px-2.5",
        current
          ? "border border-border bg-surface-raised font-medium text-heading"
          : "border border-transparent text-ink-secondary hover:text-ink",
      )}
    >
      {item.label}
      {item.count !== undefined && item.count > 0 && (
        <span className="rounded-full bg-primary px-1.5 font-mono text-meta text-on-primary">{item.count}</span>
      )}
    </Link>
  );
}
