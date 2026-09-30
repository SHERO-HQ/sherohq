import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { logout } from "@/app/admin/(app)/actions";
import { AdminNavLink } from "@/components/admin/AdminNavLink";
import { Logo } from "@/components/ui/Logo";
import { siteUrl } from "@/lib/site";

export type NavItem = { label: string; href: string; count?: number };
export type NavGroup = { label?: string; items: NavItem[] };

/**
 * The admin frame: a sidebar on large screens, a top bar with the sections in
 * a row on phones. Only built sections are listed; the rest join as they land.
 */
export function AdminShell({ nav, children }: { nav: NavGroup[]; children: React.ReactNode }) {
  const brand = (
    <Link href="/admin" className="flex items-center gap-2.5 rounded-sm">
      <Logo className="h-5 w-auto" />
      <span className="font-mono text-meta text-ink-muted">admin</span>
    </Link>
  );
  const logoutButton = (
    <form action={logout}>
      <button type="submit" className="rounded-sm px-2.5 py-2 text-body-sm text-ink-secondary hover:text-ink">
        Log out
      </button>
    </form>
  );

  return (
    <div className="lg:grid lg:min-h-svh lg:grid-cols-[15rem_1fr]">
      {/* Large screens: the sidebar. */}
      <aside className="hidden border-r border-border bg-surface lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-border px-5">{brand}</div>
        <nav aria-label="Admin" className="flex flex-1 flex-col gap-5 p-3">
          {nav.map((group, i) => (
            <div key={group.label ?? i} className="flex flex-col gap-0.5">
              {group.label && <span className="px-2.5 pb-1 font-mono text-meta text-ink-muted">{group.label}</span>}
              {group.items.map((item) => (
                <AdminNavLink key={item.href} item={item} />
              ))}
            </div>
          ))}
        </nav>
        <div className="border-t border-border p-3">{logoutButton}</div>
      </aside>

      {/* Phones and tablets: a top bar, then the sections in one row. */}
      <div className="border-b border-border bg-surface lg:hidden">
        <div className="flex h-14 items-center justify-between px-gutter">
          {brand}
          <div className="flex items-center gap-1">
            <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="px-2.5 py-2 text-body-sm text-primary">
              View site
            </a>
            {logoutButton}
          </div>
        </div>
        <nav aria-label="Admin sections" className="flex gap-1 overflow-x-auto px-gutter pb-2">
          {nav.flatMap((group) => group.items).map((item) => (
            <AdminNavLink key={item.href} item={item} compact />
          ))}
        </nav>
      </div>

      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** The title bar of each admin page: title, a short fact, and its actions. */
export function AdminHeader({
  title,
  meta,
  badge,
  children,
}: {
  title: string;
  meta?: string;
  badge?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 border-b border-border px-gutter py-4 sm:flex-row sm:items-center sm:justify-between lg:h-16 lg:py-0">
      <div className="flex min-w-0 items-baseline gap-3">
        <h1 className="truncate font-display text-h3 text-heading">{title}</h1>
        {badge}
        {meta && <span className="shrink-0 text-body-sm text-ink-muted">{meta}</span>}
      </div>
      <div className="flex items-center gap-4">
        {children}
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-1 text-label text-primary hover:underline lg:inline-flex"
        >
          View site <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.5} />
        </a>
      </div>
    </header>
  );
}
