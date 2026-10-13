import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "inverse";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-5 text-[15px] font-medium leading-none transition-colors duration-150";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover",
  secondary: "border border-border-strong text-ink hover:border-ink hover:bg-surface",
  inverse: "border border-ink-inverse-muted text-ink-inverse hover:border-ink-inverse",
};

type Props = {
  href: string;
  variant?: Variant;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"a">, "href">;

/** A link styled as a button. Every button on the site navigates somewhere. */
export function ButtonLink({ href, variant = "primary", className, children, ...props }: Props) {
  const classes = cn(base, variants[variant], className);
  const isExternal = /^(https?:|mailto:|tel:)/.test(href);
  if (isExternal) {
    return (
      <a href={href} className={classes} rel="noopener noreferrer" target="_blank" {...props}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  );
}
