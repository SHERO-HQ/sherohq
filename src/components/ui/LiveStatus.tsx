"use client";

import { dispatchStatus, openStatus } from "@/lib/hours";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/cn";

/** "Open now · until 6:00 PM" with the live dot, or when SHERO opens next. */
export function OpenNow({
  className,
  dotClassName = "bg-accent",
  fallback,
}: {
  className?: string;
  /** The dot's "open" colour; pass a lighter emerald on dark backgrounds. */
  dotClassName?: string;
  fallback: string;
}) {
  const now = useNow();
  if (!now) return <span className={className}>{fallback}</span>;

  const status = openStatus(now);
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        aria-hidden="true"
        className={cn("size-1.5 shrink-0 rounded-full", status.open ? dotClassName : "bg-current opacity-60")}
      />
      {status.label}
    </span>
  );
}

/** Same-day dispatch countdown to the 5:00 PM bus-station cut-off. */
export function DispatchCountdown({ className, fallback }: { className?: string; fallback: string }) {
  const now = useNow();
  const label = now ? dispatchStatus(now).label : fallback;
  return <span className={className}>{label}</span>;
}
