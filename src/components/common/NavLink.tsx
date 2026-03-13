"use client";
import { useState, useEffect } from "react";
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
  const isActive = mounted
    ? end
      ? pathname === hrefStr
      : pathname.startsWith(hrefStr) && (hrefStr !== "/" || pathname === "/")
    : false;

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
