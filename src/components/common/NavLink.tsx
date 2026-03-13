"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkProps extends Omit<
  React.ComponentProps<typeof Link>,
  "className" | "children"
> {
  className?: string | ((props: { isActive: boolean }) => string);
  activeClassName?: string;
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
  end = false,
  children,
  ...props
}: NavLinkProps) => {
  const pathname = usePathname();
  const hrefStr = typeof href === "string" ? href : (href.pathname ?? "");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only compute isActive after hydration to prevent SSR mismatch
  const isActive = useMemo(() => {
    if (!mounted) return false;

    let targetPath = hrefStr;
    
    // If it's an absolute URL, check if it points to the current domain
    if (hrefStr.startsWith("http")) {
      try {
        const url = new URL(hrefStr);
        if (url.hostname === window.location.hostname) {
          targetPath = url.pathname;
        } else {
          return false; // Pointing to a different subdomain or domain
        }
      } catch {
        return false;
      }
    }

    if (end) {
      return pathname === targetPath;
    }
    
    return pathname.startsWith(targetPath) && (targetPath !== "/" || pathname === "/");
  }, [mounted, pathname, hrefStr, end]);

  const finalClassName =
    typeof className === "function"
      ? className({ isActive })
      : cn(className, isActive && activeClassName);

  return (
    <Link href={href} className={finalClassName} {...props}>
      {typeof children === "function" ? children({ isActive }) : children}
    </Link>
  );
};

export default NavLink;
