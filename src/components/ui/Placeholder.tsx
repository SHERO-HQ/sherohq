import { cn } from "@/lib/cn";

/**
 * Marks content SHERO hasn't supplied yet (photos, screenshots, logos, prices).
 * Mirrors the [bracketed] placeholders in the designs so gaps stay visible and
 * nothing is invented. Search for <Placeholder to find what's still missing.
 */
export function Placeholder({ label, className }: { label: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={`Placeholder: ${label}`}
      className={cn(
        "flex items-center justify-center px-4 text-center font-mono text-xs/4 text-ink-muted",
        className,
      )}
    >
      [{label}]
    </div>
  );
}
