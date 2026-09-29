import { cn } from "@/lib/cn";

/**
 * A page section: container, design-system section spacing and an optional
 * surface band. Every section on the site is one of these.
 */
export function Section({
  tone = "page",
  divider,
  className,
  children,
  ...rest
}: {
  tone?: "page" | "surface";
  /** A hairline above the section, for two page-toned sections in a row. */
  divider?: boolean;
  className?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, "className" | "children">) {
  return (
    <section
      className={cn(
        "py-section",
        tone === "surface" && "border-y border-border bg-surface",
        divider && "border-t border-border",
      )}
      {...rest}
    >
      <div className={cn("container-site", className)}>{children}</div>
    </section>
  );
}

/** Short label above a heading: green, mono, lowercase. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("font-mono text-eyebrow text-secondary", className)}>{children}</p>;
}

/** Label, heading, intro and an optional action on the right. */
export function SectionHeader({
  id,
  eyebrow,
  title,
  intro,
  action,
  as: Heading = "h2",
  className,
}: {
  id?: string;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  intro?: React.ReactNode;
  action?: React.ReactNode;
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div className={cn("mb-8 flex flex-col gap-4 lg:mb-12 lg:flex-row lg:items-end lg:justify-between lg:gap-10", className)}>
      <div className="flex max-w-measure flex-col gap-3">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <Heading id={id} className={Heading === "h1" ? "text-h1" : "text-h2"}>
          {title}
        </Heading>
        {intro && <p className="text-body-lg text-ink-secondary">{intro}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
