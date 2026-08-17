import * as React from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type SectionBadgeVariant = "brand" | "primary" | "slate" | "cyan";
export type SectionBadgeSize = "sm" | "md" | "lg";

export interface SectionBadgeProps extends React.HTMLAttributes<HTMLElement> {
  icon?: LucideIcon | React.ComponentType<{ className?: string; [key: string]: any }> | React.ReactNode;
  variant?: SectionBadgeVariant;
  size?: SectionBadgeSize;
  uppercase?: boolean;
  as?: "span" | "div";
  children: React.ReactNode;
}

const variantStyles: Record<SectionBadgeVariant, string> = {
  brand:
    "text-brand-secondary-600 dark:text-brand-secondary-400 bg-brand-secondary-100 dark:bg-brand-secondary-200/20 border-brand-secondary-500/50 dark:border-brand-secondary-800/50",
  primary:
    "text-brand-primary-600 dark:text-brand-primary-400 bg-brand-primary-100 dark:bg-brand-primary-200/20 border-brand-primary-500/50 dark:border-brand-primary-800/50",
  cyan:
    "text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/40 border-cyan-500/40 dark:border-cyan-800/50",
  slate:
    "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700",
};

const sizeStyles: Record<SectionBadgeSize, string> = {
  sm: "px-3 py-0.5 text-[9px] gap-1.5",
  md: "px-4 py-1 text-[10px] gap-2",
  lg: "px-4 py-1.5 text-xs gap-2",
};

const iconSizes: Record<SectionBadgeSize, string> = {
  sm: "size-3.5 shrink-0",
  md: "size-4 shrink-0",
  lg: "size-4 shrink-0",
};

export const SectionBadge = React.forwardRef<HTMLElement, SectionBadgeProps>(
  (
    {
      icon: IconProp,
      variant = "brand",
      size = "md",
      uppercase = true,
      as = "span",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const Component = as;

    const renderIcon = () => {
      if (!IconProp) return null;

      // If IconProp is already a JSX element
      if (React.isValidElement(IconProp)) {
        return IconProp;
      }

      // If IconProp is a component (e.g. LucideIcon function/forwardRef)
      if (
        typeof IconProp === "function" ||
        (typeof IconProp === "object" && IconProp !== null && ("render" in (IconProp as any) || "$$typeof" in (IconProp as any)))
      ) {
        const IconComponent = IconProp as React.ComponentType<{ className?: string }>;
        return <IconComponent className={iconSizes[size]} />;
      }

      return null;
    };

    return (
      <Component
        ref={ref as any}
        className={cn(
          "inline-flex items-center rounded border font-semibold transition-colors duration-300",
          uppercase && "uppercase tracking-wide",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {renderIcon()}
        <span>{children}</span>
      </Component>
    );
  },
);

SectionBadge.displayName = "SectionBadge";

export default SectionBadge;
