import { cn } from "@/lib/cn";

/**
 * SHERO's menu icon, carried over from the old site: three lines of staggered
 * length. The one icon that isn't Lucide (owner's request, 29 Sep 2026); same
 * 1.5 stroke and currentColor as the rest.
 */
export function MenuIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
    >
      <path d="M5 17H13M5 12H19M11 7H19" />
    </svg>
  );
}
