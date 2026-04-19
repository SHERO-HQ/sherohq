"use client";
import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkProps extends Omit<
  React.ComponentProps<typeof Link>,
  "className" | "children"
> {
  className?: string | ((props: { isActive: boolean }) => string);
  activeClassName?: string;
  isActive?: boolean; // Manual override for active state
  end?: boolean;
  children:
    | React.ReactNode
    | ((props: { isActive: boolean }) => React.ReactNode);
}

/**
 * A thin wrapper around next/link that provides `isActive` detection
 * via `usePathname()`.
 *
 * `isActive` is deferred to after hydration to prevent SSR mismatch —
 * on the server and first client render, `isActive` is always `false`.
 */
const NavLink = ({
  href,
  className,
  activeClassName,
  isActive: propIsActive,
  end = false,
  children,
  ...props
}: NavLinkProps) => {
  const pathname = usePathname();
  const hrefStr = typeof href === "string" ? href : (href.pathname ?? "");
  // Hydration-safe mounted flag without setState-in-effect.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Only compute isActive after hydration to prevent SSR mismatch
  const isActive = useMemo(() => {
    if (propIsActive !== undefined) return propIsActive;
    if (!mounted) return false;

    let targetPath = hrefStr;

    // If it's an absolute URL, check if it points to the current domain or a subdomain
    if (hrefStr.startsWith("http")) {
      try {
        const url = new URL(hrefStr);
        const currentHost = window.location.hostname;
        
        // Simple base domain check: if both hostnames end with the same primary domain
        // (This handles sherohq.com, shop.sherohq.com, etc.)
        const getBase = (host: string) => {
          const parts = host.split('.');
          return parts.slice(-2).join('.');
        };
        
        if (getBase(url.hostname) === getBase(currentHost)) {
          targetPath = url.pathname;
        } else {
          return false; // Truly a different domain
        }
      } catch {
        return false;
      }
    }

    if (end) {
      return pathname === targetPath;
    }

    return targetPath === "/"
      ? pathname === "/"
      : pathname === targetPath || pathname.startsWith(targetPath + "/");
  }, [mounted, pathname, hrefStr, end, propIsActive]);

  const finalClassName =
    typeof className === "function"
      ? className({ isActive })
      : cn(className, isActive && activeClassName);

  const isCrossOrigin = useMemo(() => {
    if (!mounted || !hrefStr.startsWith("http")) return false;
    try {
      const url = new URL(hrefStr);
      // Ensure we only use window.location if we are fully mounted
      return (
        typeof window !== "undefined" && url.origin !== window.location.origin
      );
    } catch {
      return false;
    }
  }, [mounted, hrefStr]);

  // To truly prevent hydration mismatch, we must render the identical element tree.
  // We can always render `<Link>` on the server, and only switch to `<a>` 
  // after hydration if cross-origin.
  if (mounted && isCrossOrigin) {
    return (
      <a href={hrefStr} className={finalClassName} {...props}>
        {typeof children === "function" ? children({ isActive }) : children}
      </a>
    );
  }

  return (
    <Link href={href} className={finalClassName} {...props}>
      {typeof children === "function" ? children({ isActive }) : children}
    </Link>
  );
};

export default NavLink;
