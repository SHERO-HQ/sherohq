"use client";
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

  const isActive = end
    ? pathname === hrefStr
    : pathname.startsWith(hrefStr) && (hrefStr !== "/" || pathname === "/");

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
