import { cva, type VariantProps } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center rounded border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-brand-secondary-200 bg-brand-secondary-50 text-brand-secondary-700 hover:bg-brand-secondary-100 dark:border-brand-secondary-500/30 dark:bg-brand-secondary-500/15 dark:text-brand-secondary-300 dark:hover:bg-brand-secondary-500/20",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        brandSecondary:
          "border-transparent bg-brand-secondary-600 text-white hover:bg-brand-secondary-700 dark:bg-brand-secondary-500 dark:hover:bg-brand-secondary-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;
