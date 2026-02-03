import { NavLink } from "react-router-dom";
import { getAbsoluteUrl } from "@/utils/subdomain";
import { cn } from "@/lib/utils";

interface UniversalLinkProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "className" | "children"
> {
  to: string;
  className?: string | ((props: { isActive: boolean }) => string);
  activeClassName?: string;
  end?: boolean; // For NavLink exact matching
  children:
    | React.ReactNode
    | ((props: { isActive: boolean }) => React.ReactNode);
}

const UniversalLink = ({
  to,
  className,
  activeClassName,
  end = false,
  children,
  ...props
}: UniversalLinkProps) => {
  const href = getAbsoluteUrl(to);
  // Safe origin check
  const currentOrigin =
    typeof globalThis !== "undefined" && globalThis.location
      ? globalThis.location.origin
      : "";

  const isInternal = href.startsWith(currentOrigin) || href.startsWith("/");

  // Determine if active (simple check for external links, NavLink handles internal)
  const isExternalActive =
    typeof globalThis !== "undefined" &&
    !isInternal &&
    globalThis.location.href.startsWith(href);

  if (isInternal) {
    // Extract relative path if absolute
    const relativePath = href.startsWith("http")
      ? href.replace(currentOrigin, "")
      : href;

    return (
      <NavLink
        to={relativePath}
        end={end}
        className={({ isActive }) =>
          typeof className === "function"
            ? className({ isActive })
            : cn(className, isActive && activeClassName)
        }
        {...props}
      >
        {({ isActive }) =>
          typeof children === "function" ? children({ isActive }) : children
        }
      </NavLink>
    );
  }

  // Common styling for external links (simulating NavLink isActive behavior)
  const finalClassName =
    typeof className === "function"
      ? className({ isActive: isExternalActive })
      : cn(className, isExternalActive && activeClassName);

  return (
    <a href={href} className={finalClassName} {...props}>
      {typeof children === "function"
        ? children({ isActive: isExternalActive })
        : children}
    </a>
  );
};

export default UniversalLink;
