/**
 * Parses the current hostname to extract the subdomain.
 *
 * Handles:
 * - Localhost: Returns null
 * - IP Addresses: Returns null
 * - Production/Vercel (e.g., admin.sherohq.com): Returns "admin"
 * - Staging (e.g., admin.sherotech.vercel.app): Returns "admin"
 * - Root domains (sherohq.com): Returns null
 * - www subdomain: Ignored (returns null)
 *
 * @returns {string | null} The subdomain or null if none/root
 */
export const getSubdomain = (): string | null => {
  if (typeof globalThis === "undefined" || !globalThis.location) {
    return null;
  }

  const hostname = globalThis.location.hostname;

  // Handle localhost and IP addresses
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.168.")
  ) {
    return null;
  }

  const parts = hostname.split(".");

  // Handle root domains (e.g., sherohq.com -> ["sherohq", "com"])
  if (parts.length <= 2) {
    return null;
  }

  // Handle subdomains
  // e.g., admin.sherohq.com -> ["admin", "sherohq", "com"] -> "admin"
  // e.g., shop.sherotech.vercel.app -> ["shop", "sherotech", "vercel", "app"] -> "shop"

  const subdomain = parts[0].toLowerCase();

  // Explicitly ignore 'www' as a functional subdomain
  if (subdomain === "www") {
    return null;
  }

  return subdomain;
};

/**
 * Generates the correct URL for navigation, handling cross-subdomain links.
 *
 * @param path - The target path (e.g., "/shop", "/about-us")
 * @returns {string} - The absolute URL (prod) or relative path (local)
 */

const getBaseDomain = (hostname: string): string => {
  const parts = hostname.split(".");
  if (parts.length === 2) return hostname;
  if (parts.length >= 3) return parts.slice(1).join(".");
  return hostname;
};

const ROOT_DOMAIN_PATHS = [
  "/about-us",
  "/contact-us",
  "/faq",
  "/partners",
  "/privacy",
  "/terms",
  "/cookies",
  "/solutions",
  "/consultation",
  "/login",
  "/signup",
  "/profile",
];

const getTargetSubdomain = (
  path: string,
): { subdomain: string; path: string } => {
  const lowercasePath = path.toLowerCase();

  // Explicitly keep these on the root domain
  if (ROOT_DOMAIN_PATHS.some((p) => lowercasePath.startsWith(p)) || path === "/") {
    return { subdomain: "www", path };
  }

  // Shop subdomain: All e-commerce related paths
  if (
    lowercasePath.startsWith("/shop") ||
    lowercasePath.startsWith("/products") ||
    lowercasePath.startsWith("/checkout") ||
    lowercasePath.startsWith("/cart") ||
    lowercasePath.startsWith("/wishlist")
  ) {
    let internalPath = "/";

    if (lowercasePath.startsWith("/shop")) {
      internalPath = path.replace(/^\/shop/, "") || "/";
    } else if (lowercasePath.startsWith("/products")) {
      internalPath = path.replace(/^\/products/, "") || "/";
    } else if (lowercasePath.startsWith("/checkout")) {
      internalPath = path; // Maps to shop.sherohq.com/checkout
    } else if (lowercasePath.startsWith("/cart")) {
      internalPath = path;
    } else if (lowercasePath.startsWith("/wishlist")) {
      internalPath = path;
    }

    // Ensure it starts with a slash
    if (!internalPath.startsWith("/")) internalPath = "/" + internalPath;

    return { subdomain: "shop", path: internalPath };
  }

  // Admin subdomain
  if (path.startsWith("/admin")) {
    const cleanPath = path.replace("/admin", "");
    return { subdomain: "admin", path: cleanPath || "/" };
  }

  // Support subdomain
  if (path.startsWith("/support")) {
    return {
      subdomain: "support",
      path: path === "/support" ? "/" : path.replace("/support", ""),
    };
  }

  // Default to root
  return { subdomain: "www", path };
};

export const getAbsoluteUrl = (path: string): string => {
  if (typeof globalThis === "undefined" || !globalThis.location) {
    return path;
  }

  const hostname = globalThis.location.hostname;
  const protocol = globalThis.location.protocol;

  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.168.")
  ) {
    return path;
  }

  const baseDomain = getBaseDomain(hostname);
  const { subdomain, path: targetPath } = getTargetSubdomain(path);

  if (subdomain === "www") {
    return `${protocol}//${baseDomain}${targetPath}`;
  }

  return `${protocol}//${subdomain}.${baseDomain}${targetPath}`;
};
