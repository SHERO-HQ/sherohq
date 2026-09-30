import { cn } from "@/lib/cn";

const tones = {
  done: "bg-secondary-subtle text-secondary",
  todo: "bg-warning-subtle text-warning",
  problem: "bg-danger-subtle text-danger",
  info: "bg-info-subtle text-primary",
  none: "bg-surface text-ink-secondary",
} as const;

export type BadgeTone = keyof typeof tones;

/** A dot and a word: status in the admin tables. */
export function Badge({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex h-6 shrink-0 items-center gap-1.5 rounded-sm px-2 text-body-sm whitespace-nowrap", tones[tone])}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export const listingStatusBadge = {
  draft: { tone: "none", label: "Draft" },
  in_stock: { tone: "done", label: "In stock" },
  reserved: { tone: "info", label: "Reserved" },
  sold: { tone: "none", label: "Sold" },
} as const satisfies Record<string, { tone: BadgeTone; label: string }>;
