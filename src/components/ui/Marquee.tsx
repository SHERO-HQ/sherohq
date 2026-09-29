import { cn } from "@/lib/cn";

/**
 * A slow, endless row (the client strip). The moving copies are hidden from
 * screen readers, which get the list once; with reduced motion it's a still
 * row showing each item once. Styles: .marquee in globals.css.
 */
export function Marquee({ items, className }: { items: string[]; className?: string }) {
  // Four copies, moved by half their width, so the loop never shows a seam.
  const copies = [0, 1, 2, 3];
  return (
    <div className={cn("marquee", className)}>
      <ul className="sr-only">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="marquee-track" aria-hidden="true">
        {copies.map((copy) => (
          <ul key={copy} className={cn("flex shrink-0", copy > 0 && "marquee-copy")}>
            {items.map((item) => (
              <li key={item} className="px-8 font-display text-h3 whitespace-nowrap text-ink-secondary">
                {item}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
