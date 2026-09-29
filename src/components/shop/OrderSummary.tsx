import { cn } from "@/lib/cn";

/** The summary box on cart and checkout: rows, then the total. */
export function SummaryRow({
  label,
  value,
  tone,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  tone?: "free" | "muted";
}) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <dt className="text-[15px]/[22px] text-ink-secondary">{label}</dt>
      <dd
        className={cn(
          "text-right font-mono text-[15px]/[22px] font-medium",
          tone === "free" ? "text-accent" : tone === "muted" ? "font-sans font-normal text-ink-secondary" : "text-ink",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

export function SummaryTotal({ value }: { value: React.ReactNode }) {
  return (
    <div className="mt-1 mb-3 flex items-baseline justify-between gap-4 border-t border-rule-strong py-4">
      <dt className="text-[17px]/6 font-semibold text-ink">Total</dt>
      <dd className="font-mono text-[22px]/[26px] font-semibold text-ink">{value}</dd>
    </div>
  );
}
