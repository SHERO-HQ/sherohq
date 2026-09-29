import Link from "next/link";
import { ArrowRight } from "lucide-react";

export type LinkRow = {
  title: string;
  text: string;
  /** Shorter text for phones, where the design trims it. */
  textMobile?: string;
  href: string;
  external?: boolean;
};

/** Big "where to next" rows: title, a line of text and an arrow. */
export function LinkRows({ rows, className }: { rows: LinkRow[]; className?: string }) {
  const rowClass =
    "group grid grid-cols-[1fr_24px] gap-x-3 gap-y-1 border-b border-border py-4 lg:grid-cols-[1fr_1.4fr_24px] lg:items-center lg:gap-8 lg:py-5.5";

  return (
    <ul className={`border-t border-border ${className ?? ""}`}>
      {rows.map((row) => {
        const inner = (
          <>
            <span className="col-start-1 font-display text-body-lg font-semibold text-heading lg:text-h3">
              {row.title}
            </span>
            <span className="col-start-1 text-body text-ink-secondary lg:col-start-2 lg:row-start-1">
              {row.textMobile ? (
                <>
                  <span className="lg:hidden">{row.textMobile}</span>
                  <span className="hidden lg:inline">{row.text}</span>
                </>
              ) : (
                row.text
              )}
            </span>
            <ArrowRight
              aria-hidden="true"
              size={20}
              strokeWidth={1.5}
              className="col-start-2 row-span-2 row-start-1 self-center justify-self-end text-primary transition-transform duration-150 group-hover:translate-x-1 lg:col-start-3 lg:row-span-1"
            />
          </>
        );
        return (
          <li key={row.title}>
            {row.external ? (
              <a href={row.href} target="_blank" rel="noopener noreferrer" className={rowClass}>
                {inner}
              </a>
            ) : (
              <Link href={row.href} className={rowClass}>
                {inner}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
