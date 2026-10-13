import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Container } from "./Container";

type Tone = "page" | "surface";

type Props = {
  id?: string;
  title?: string;
  intro?: ReactNode;
  action?: ReactNode;
  tone?: Tone;
  children?: ReactNode;
  className?: string;
};

/** A page band with an optional heading block. Owns vertical rhythm. */
export function Section({ id, title, intro, action, tone = "page", children, className }: Props) {
  const headingId = id && title ? `${id}-title` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        "scroll-mt-20 py-12 sm:py-24",
        tone === "surface" && "border-y border-border bg-surface",
        className,
      )}
    >
      <Container>
        {(title || action) && (
          <div className="mb-8 flex flex-wrap items-end justify-between gap-6 sm:mb-12">
            <div className="max-w-measure">
              {title && (
                <h2 id={headingId} className="text-[26px] leading-tight tracking-[-0.015em] sm:text-4xl">
                  {title}
                </h2>
              )}
              {intro && <div className="mt-3 text-lg text-ink-secondary">{intro}</div>}
            </div>
            {action}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
