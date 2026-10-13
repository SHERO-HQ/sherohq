import type { ProductStatus } from "@/content/types";
import { statusLabel } from "@/content/products";
import { cn } from "@/lib/cn";

const tone: Record<ProductStatus, string> = {
  "in-development": "bg-warning-subtle text-warning",
  "in-validation": "bg-surface text-primary",
  live: "bg-accent-subtle text-accent",
};

/** Status is always text plus a dot, never colour alone. */
export function StatusBadge({ status, className }: { status: ProductStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-2.5 py-1 font-mono text-xs",
        tone[status],
        className,
      )}
    >
      <span aria-hidden="true" className="size-2 rounded-full bg-current" />
      {statusLabel[status]}
    </span>
  );
}
