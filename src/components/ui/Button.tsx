import Link from "next/link";
import { cn } from "@/lib/cn";

// One set of buttons for the whole site. Primary is navy (one per view),
// secondary is green (WhatsApp and other second actions), outline is neutral.
const variants = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover",
  secondary: "bg-secondary text-on-secondary hover:bg-secondary-hover",
  outline: "border border-border-strong text-ink hover:border-ink",
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
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-sm text-label whitespace-nowrap transition-colors duration-150 disabled:opacity-60",
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
