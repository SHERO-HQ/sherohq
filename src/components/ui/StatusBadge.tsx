import { cn } from "@/lib/cn";

const styles = {
  live: "bg-secondary-subtle text-secondary",
  dev: "bg-warning-subtle text-warning",
  validation: "bg-info-subtle text-primary",
} as const;

const labels = {
  live: "Live",
  dev: "In development",
  validation: "In validation",
} as const;

type StatusBadgeProps = {
  status: keyof typeof styles;
  /** Override the fixed label only where a design uses a shorter one. */
  label?: string;
  size?: "sm" | "md";
  className?: string;
};

/** Honest status label: nothing unreleased looks released. Dot plus words. */
export function StatusBadge({ status, label, size = "md", className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-sm font-mono",
        size === "sm" ? "h-5.5 gap-1.5 px-2 text-meta" : "h-6 gap-1.5 px-2 ",
        styles[status],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("rounded-full bg-current", size === "sm" ? "size-1" : "size-1.5")}
      />
      {label ?? labels[status]}
    </span>
  );
}
