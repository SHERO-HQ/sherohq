import { isMissing, type Content } from "@/lib/content";
import { cn } from "@/lib/cn";

/** Shows real content, or its [bracketed] placeholder in muted mono. */
export function Fill({ value, scale = 0.8, className }: { value: Content; scale?: number; className?: string }) {
  if (isMissing(value)) {
    return (
      <span className={cn("font-mono font-normal tracking-normal text-ink-muted", className)} style={{ fontSize: `${scale}em` }}>
        [{value.missing}]
      </span>
    );
  }
  return <>{value}</>;
}
