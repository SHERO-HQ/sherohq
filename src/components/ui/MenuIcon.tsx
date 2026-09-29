import { cn } from "@/lib/cn";

/**
 * SHERO's menu icon, carried over from the old site: three lines of staggered
 * length that turn into a close mark, with a quarter turn, when the menu opens.
 * The one icon that isn't Lucide (owner's request, 29 Sep 2026); same 1.5
 * stroke and currentColor as the rest.
 */
export function MenuIcon({ open = false, size = 24, className }: { open?: boolean; size?: number; className?: string }) {
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
      className={cn("shrink-0 transition-transform duration-300", open && "rotate-90", className)}
    >
      <path d={open ? "M18 6L6 18M6 6L18 18" : "M5 17H13M5 12H19M11 7H19"} />
    </svg>
  );
}
