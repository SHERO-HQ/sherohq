import Link from "next/link";
import { cn } from "@/lib/cn";

// One set of buttons for the whole site. Primary is navy (one per view),
// secondary is green (WhatsApp and other second actions), outline is neutral.
const variants = {
  primary: "bg-primary text-on-primary shadow-xs hover:bg-primary-hover hover:shadow active-press",
  secondary: "bg-secondary text-on-secondary shadow-xs hover:bg-secondary-hover hover:shadow active-press",
  outline: "border border-border-strong bg-surface-raised text-ink shadow-xs hover:border-ink hover:bg-surface active-press",
  /** Destructive actions in the admin, such as deleting a draft. */
  danger: "border border-border-strong bg-surface-raised text-danger shadow-xs hover:border-danger hover:bg-danger-subtle active-press",
} as const;

const sizes = {
  md: "h-9 px-3.5",
  lg: "h-10 px-5",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export function buttonClass({
  variant = "primary",
  size = "md",
  full,
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; full?: boolean; className?: string } = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-label whitespace-nowrap transition-all duration-150 disabled:opacity-60",
    variants[variant],
    sizes[size],
    full && "w-full",
    className,
  );
}

type ButtonLinkProps = {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  /** Opens in a new tab (WhatsApp, external sites). */
  external?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function ButtonLink({ href, variant, size, full, external, className, children }: ButtonLinkProps) {
  const classes = buttonClass({ variant, size, full, className });
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
