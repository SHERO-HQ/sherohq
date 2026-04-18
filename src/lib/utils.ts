import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Navigation link styling configuration
 * Centralized for consistency and maintainability
 */
const NAV_LINK_STYLES = {
  base: [
    "px-3 py-1.5",
    "rounded",
    "transition-all duration-300 ease-in-out",
    // Focus states
    // "focus:ring-2 focus:ring-brand-secondary-500/50",
    "focus:outline-none",
  ],
  active: ["text-brand-secondary-600 dark:text-brand-secondary-400", "font-semibold"],
  inactive: [
    "bg-transparent",
    "text-slate-600 dark:text-slate-400",
    "font-normal",
    // Hover states
    "hover:text-slate-900 dark:hover:text-white",
    "hover:bg-slate-500/10 dark:hover:bg-white/5",
  ],
} as const;

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Generates Tailwind CSS classes for navigation links
 *
 * Includes:
 * - Active/inactive states with clear visual distinction
 * - Keyboard focus indicators (WCAG 2.4.7 compliant)
 * - Hover states with smooth transitions
 * - Dark mode support
 * - Consistent spacing and layout
 *
 * @param isActive - Whether the link represents the current page
 * @returns Combined CSS class string
 *
 * @example
 * ```tsx
 * <NavLink
 *   to="/about"
 *   className={({ isActive }) => navLinkClass(isActive)}
 *   aria-current={isActive ? "page" : undefined}
 * >
 *   About
 * </NavLink>
 * ```
 */
export function navLinkClass(isActive: boolean): string {
  return cn(
    ...NAV_LINK_STYLES.base,
    isActive ? NAV_LINK_STYLES.active : NAV_LINK_STYLES.inactive,
  );
}

// ============================================================================
// ALTERNATIVE: VARIANT-BASED APPROACH
// ============================================================================

/**
 * Alternative implementation with variant support
 * Use this if you need multiple nav link styles
 */
export type NavLinkVariant = "default" | "sidebar" | "footer" | "mobile";

export function navLinkClassVariant(
  isActive: boolean,
  variant: NavLinkVariant = "default",
): string {
  const variantStyles = {
    default: NAV_LINK_STYLES,
    sidebar: {
      base: [
        "px-2 py-1",
        "rounded",
        "w-full",
        "transition-colors duration-200",
        "focus:outline-none focus:border-b-2 focus:border-brand-secondary-500",
      ],
      active: ["bg-primary", "text-white", "font-semibold"],
      inactive: [
        "text-slate-700 dark:text-slate-400",
        "hover:bg-slate-200 dark:hover:bg-slate-800",
        "hover:text-slate-900 dark:hover:text-slate-100",
      ],
    },
    footer: {
      base: [
        "px-2 py-1",
        "text-sm",
        "transition-colors duration-200",
        "focus:outline-none focus:ring-2 focus:ring-brand-secondary-400",
      ],
      active: ["text-brand-secondary-400", "font-medium", "underline"],
      inactive: ["text-slate-200", "hover:text-brand-secondary-400", "hover:underline"],
    },
    mobile: {
      base: [
        "relative block py-2.5 px-4",
        "rounded",
        "text-base font-medium",
        "transition-all duration-300",
      ],
      active: [
        "bg-brand-secondary-500/10",
        "text-brand-secondary-600 dark:text-brand-secondary-400",
        "font-bold",
        "shadow-xs",
      ],
      inactive: [
        "bg-transparent",
        "text-slate-700 dark:text-slate-300",
        "hover:bg-slate-50 dark:hover:bg-slate-900/50",
      ],
    },
  };

  const styles = variantStyles[variant];
  return cn(...styles.base, isActive ? styles.active : styles.inactive);
}

// ============================================================================
// UTILITY: Ensure proper ARIA attributes
// ============================================================================

/**
 * Helper to get proper ARIA attributes for navigation links
 *
 * @param isActive - Whether the link is active
 * @returns Object with ARIA attributes
 *
 * @example
 * ```tsx
 * <NavLink
 *   to="/about"
 *   className={navLinkClass(isActive)}
 *   {...getNavLinkAria(isActive)}
 * >
 *   About
 * </NavLink>
 * ```
 */
export function getNavLinkAria(isActive: boolean) {
  return {
    "aria-current": isActive ? ("page" as const) : undefined,
    role: "link" as const,
  };
}
