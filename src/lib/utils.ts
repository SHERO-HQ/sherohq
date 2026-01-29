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
    "px-2 py-1",
    "rounded-xs", // Add for better visual consistency
    "transition-colors duration-200 ease-in-out",
    // Focus states (CRITICAL for accessibility)
    "focus:ring-primary",
    "focus:ring-offset-2",
    "dark:focus:ring-offset-slate-900",
  ],
  active: [
    "border-b-2",
    "border-emerald-500",
    "bg-transparent",
    "text-emerald-900 dark:text-emerald-500",
    "font-medium",
    "rounded-none",
    // Hover states for active
    "hover:bg-emerald-500/10",
    "hover:border-secondary",
  ],
  inactive: [
    "border-b-2",
    "border-transparent", // Prevent layout shift
    "text-slate-700 dark:text-slate-400",
    "font-normal",
    // Hover states for inactive
    "hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10",
    "hover:border-emerald-500 dark:hover:border-emerald-700 border-dashed",
    "hover:rounded-none",
    "hover:text-emerald-900 dark:hover:text-emerald-300",
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
        "px-3 py-2",
        "rounded-xs",
        "w-full",
        "transition-colors duration-200",
        "focus:outline-none focus:border-b-2 focus:border-emerald-500",
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
        "focus:outline-none focus:ring-2 focus:ring-emerald-400",
      ],
      active: ["text-emerald-400", "font-medium", "underline"],
      inactive: ["text-slate-200", "hover:text-emerald-400", "hover:underline"],
    },
    mobile: {
      base: [
        "block py-2 px-4",
        "rounded",
        "text-base font-medium",
        "transition-colors duration-200",
      ],
      active: [
        "bg-emerald-50 dark:bg-emerald-900/20",
        "text-emerald-600 dark:text-emerald-400",
      ],
      inactive: [
        "text-slate-700 dark:text-slate-300",
        "hover:bg-slate-50 dark:hover:bg-slate-800",
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
