import { cn } from "@/lib/cn";

export type ReadoutRow = { label: string; value: string; tone?: "done" | "pending" | "neutral" };

const tones = {
  done: "text-emerald-300",
  pending: "text-readout-pending",
  neutral: "text-navy-100",
};

/**
 * A mono "spec sheet" card: the one data moment on a page. Always labelled as
 * an illustration so it's never mistaken for a real client's system.
 */
export function Readout({ title, rows, className }: { title: string; rows: ReadoutRow[]; className?: string }) {
  return (
    <figure
      className={cn(
        "flex flex-col rounded-md border border-inverse-border bg-surface-inverse px-[18px] pt-4 pb-3 font-mono text-xs/4",
        className,
      )}
    >
      <figcaption className="mb-2.5 flex justify-between gap-4">
        <span className="font-medium text-navy-100">{title}</span>
        <span className="text-[11px] text-readout-label">illustration</span>
      </figcaption>
      <dl>
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4 border-t border-inverse-border py-[7px]">
            <dt className="text-readout-label">{row.label}</dt>
            <dd className={cn("font-medium", tones[row.tone ?? "neutral"])}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </figure>
  );
}
