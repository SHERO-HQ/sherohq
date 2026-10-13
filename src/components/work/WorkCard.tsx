import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { WorkItem } from "@/content/types";
import { workSummary } from "@/content/work";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { WorkImage } from "./WorkImage";

/** A client project as a card. The whole card links to its case study. */
export function WorkCard({ item, headingLevel = "h3" }: { item: WorkItem; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article className="group relative flex w-full flex-col overflow-hidden rounded-card border border-border bg-surface-raised transition-colors hover:border-border-strong">
      <WorkImage
        item={item}
        sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
        className="aspect-[16/10] border-b border-border"
      />
      <div className="flex flex-1 flex-col p-6">
        <p className="text-sm text-ink-muted">
          {item.category} · For {item.client}
        </p>
        <Heading className="mt-2 flex items-center justify-between gap-3 text-2xl tracking-[-0.015em]">
          <Link href={`/work/${item.slug}`} className="after:absolute after:inset-0 after:rounded-card">
            {item.name}
          </Link>
          <ArrowUpRight
            aria-hidden="true"
            size={20}
            strokeWidth={1.75}
            className="shrink-0 text-ink-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-link"
          />
        </Heading>
        <p className="mt-3 line-clamp-3 text-ink-secondary">{workSummary(item)}</p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
          <StatusBadge status={item.status} />
          {item.stack.slice(0, 2).map((t) => (
            <span key={t} className="rounded-md border border-border px-2 py-0.5 text-xs text-ink-muted">
              {t}
            </span>
          ))}
          {item.stack.length > 2 && <span className="text-xs text-ink-muted">+{item.stack.length - 2}</span>}
        </div>
      </div>
    </article>
  );
}
