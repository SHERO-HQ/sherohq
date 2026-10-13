import { cn } from "@/lib/cn";

type Props = {
  /** What the illustration will show. Used as the placeholder label. */
  label: string;
  className?: string;
};

/**
 * Reserved space for SHERO's custom illustrations. Decorative until the
 * real artwork lands, so it is hidden from assistive technology.
 */
export function IllustrationSlot({ label, className }: Props) {
  return (
    <div
      aria-hidden="true"
      data-illustration={label}
      className={cn(
        "flex items-center justify-center rounded-card border border-dashed border-placeholder bg-surface p-6 text-center font-mono text-xs text-ink-muted",
        className,
      )}
    >
      [Illustration: {label}]
    </div>
  );
}
