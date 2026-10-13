/** Theme classes for the illustrations, so each drawing follows light and dark mode. */
export const tone = {
  frame: "fill-background stroke-border",
  card: "fill-card stroke-border",
  primary: "fill-brand-primary-700 dark:fill-brand-primary-500",
  accent: "fill-brand-secondary-600 dark:fill-brand-secondary-400",
  accentSoft: "fill-brand-secondary-100 dark:fill-brand-secondary-900/40",
  line: "fill-slate-200 dark:fill-slate-700",
  ink: "fill-slate-400 dark:fill-slate-500",
  onPrimary: "fill-white",
  warning: "fill-amber-500",
  stroke: "fill-none stroke-slate-300 dark:stroke-slate-600",
  strokeMuted: "fill-none stroke-slate-400 dark:stroke-slate-500",
  strokePrimary: "fill-none stroke-brand-primary-700 dark:stroke-brand-primary-400",
  strokeAccent: "fill-none stroke-brand-secondary-600 dark:stroke-brand-secondary-400",
  strokeOnPrimary: "fill-none stroke-white",
} as const;
