import Link from "next/link";
import type { WorkItem } from "@/content/types";

/** Rows of client work. Missing owner text shows as an explicit placeholder. */
export function WorkList({ items }: { items: readonly WorkItem[] }) {
  return (
    <ul className="border-b border-border">
      {items.map((w) => (
        <li key={w.slug} className="border-t border-border">
          <Link
            href={`/work/${w.slug}`}
            className="group grid gap-x-8 gap-y-1 py-6 sm:grid-cols-[minmax(0,14rem)_minmax(0,10rem)_1fr] sm:items-baseline"
          >
            <span className="font-display text-2xl font-semibold text-heading group-hover:underline group-hover:underline-offset-4">
              {w.name}
            </span>
            <span className="font-mono text-xs text-ink-muted">{w.client ? `for ${w.client}` : "Client project"}</span>
            <span className="text-ink-secondary">{w.summary ?? "[One line on the project, from SHERO]"}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
