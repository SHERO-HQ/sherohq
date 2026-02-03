import { useNavigate } from "react-router-dom";
import type { NavigateOptions, To } from "react-router-dom";
import { getAbsoluteUrl } from "@/utils/subdomain";

/**
 * A hook that provides a navigation function aware of subdomains.
 * If the target URL is on a different subdomain/origin, it perform a full page reload (window.location.href).
 * If the target URL is on the current origin, it uses react-router's navigate().
 */
export const useUniversalNavigate = () => {
  const navigate = useNavigate();

  const universalNavigate = (to: To | number, options?: NavigateOptions) => {
    if (typeof to === "number") {
      navigate(to);
      return;
    }

    const path = typeof to === "string" ? to : to.pathname || "";
    const absoluteUrl = getAbsoluteUrl(path);

    // Current origin check
    const currentOrigin =
      typeof globalThis !== "undefined" && globalThis.location
        ? globalThis.location.origin
        : "";

    if (absoluteUrl.startsWith(currentOrigin) || absoluteUrl.startsWith("/")) {
      // Internal navigation
      const relativePath = absoluteUrl.startsWith("http")
        ? absoluteUrl.replace(currentOrigin, "")
        : absoluteUrl;

      navigate(relativePath, options);
    } else if (options?.replace) {
      // Cross-subdomain or external navigation - replace history
      globalThis.location.replace(absoluteUrl);
    } else {
      // Cross-subdomain or external navigation - push history
      globalThis.location.href = absoluteUrl;
    }
  };

  return universalNavigate;
};
