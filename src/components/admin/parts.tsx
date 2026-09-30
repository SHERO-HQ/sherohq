import Link from "next/link";
import { cn } from "@/lib/cn";

// Pieces every admin section shares: cards, fact lists and tabs.

export const adminCard = "flex flex-col gap-4 rounded-md border border-border bg-surface-raised p-5 lg:p-6";
export const adminCardTitle = "font-display text-h3 text-heading";

export function Facts({ rows }: { rows: Array<[string, React.ReactNode]> }) {
  return (
    <dl className="flex flex-col">
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[7rem_1fr] gap-3 border-t border-border py-2.5">
          <dt className="font-mono text-meta text-ink-muted">{label}</dt>
          <dd className="text-body-sm break-words text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Tabs that are links (?status=…), so each can be bookmarked and survives a save. */
export function AdminTabs({
  label,
  tabs,
}: {
  label: string;
  tabs: Array<{ href: string; label: string; count?: number; current: boolean }>;
}) {
  return (
    <nav aria-label={label} className="flex gap-6 overflow-x-auto border-b border-border">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={tab.current ? "page" : undefined}
          className={cn(
            "-mb-px flex items-baseline gap-1.5 border-b-2 pb-2.5 text-body-sm whitespace-nowrap",
            tab.current ? "border-primary font-medium text-heading" : "border-transparent text-ink-secondary hover:text-ink",
          )}
        >
          {tab.label}
          {tab.count !== undefined && <span className="font-mono text-meta text-ink-muted">{tab.count}</span>}
        </Link>
      ))}
    </nav>
  );
}

export const tableHead = "bg-surface font-mono text-meta text-ink-muted";
export const th = "px-4 py-3 font-normal";
export const td = "px-4 py-3 text-body-sm text-ink";
