import { cn } from "@/lib/cn";

export type ReadoutRow = { label: string; value: React.ReactNode; tone?: "done" | "pending" | "neutral" };

const tones = {
  done: "text-secondary",
  pending: "text-warning",
  neutral: "text-ink",
};

/**
 * A short record set as label and value rows, such as a listed device's own
 * check results. Only for real data, never decoration.
 */
export function Readout({
  title,
  rows,
  caption,
  className,
}: {
  title: string;
  rows: ReadoutRow[];
  caption?: string;
  className?: string;
}) {
  return (
    <figure className={cn("flex flex-col rounded-md border border-border bg-surface-raised px-5 pt-4 pb-2", className)}>
      <figcaption className="mb-2 flex justify-between gap-4 font-mono text-meta">
        <span className="font-medium text-ink">{title}</span>
        {caption && <span className="text-ink-muted">{caption}</span>}
      </figcaption>
      <dl>
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4 border-t border-border py-2.5 font-mono text-meta">
            <dt className="text-ink-muted">{row.label}</dt>
            <dd className={cn("font-medium", tones[row.tone ?? "neutral"])}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </figure>
  );
}
