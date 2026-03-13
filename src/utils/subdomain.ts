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

const getTargetSubdomain = (
  path: string,
): { subdomain: string; path: string } => {
  const lowercasePath = path.toLowerCase();
  
  // Shop subdomain: All e-commerce related paths
  if (
    lowercasePath.startsWith("/shop") ||
    lowercasePath.startsWith("/products") ||
    lowercasePath.startsWith("/checkout") ||
    lowercasePath.startsWith("/cart") ||
    lowercasePath.startsWith("/wishlist")
  ) {
    const cleanPath = path.replace(/^\/shop|^\/products|^\/checkout|^\/cart|^\/wishlist/, "");
    const finalPath =
      !cleanPath || cleanPath === "/"
        ? "/"
        : cleanPath.startsWith("/")
          ? cleanPath
          : "/" + cleanPath;

    // Preserve the prefix for paths that are part of the shop app's internal routing
    let shopPath = finalPath;
    if (path.startsWith("/checkout")) shopPath = "/checkout" + finalPath;
    if (path.startsWith("/cart")) shopPath = "/cart" + finalPath;
    if (path.startsWith("/wishlist")) shopPath = "/wishlist" + finalPath;
    if (path.startsWith("/products")) shopPath = "/products" + finalPath;

    return { subdomain: "shop", path: shopPath };
  }

  // Admin subdomain
  if (path.startsWith("/admin")) {
    const cleanPath = path.replace("/admin", "");
    if (!cleanPath || cleanPath === "/")
      return { subdomain: "admin", path: "/" };

    const finalPath = cleanPath.startsWith("/") ? cleanPath : "/" + cleanPath;
    return { subdomain: "admin", path: finalPath };
  }

  // Support subdomain
  if (path.startsWith("/support")) {
    return {
      subdomain: "support",
      path: path === "/support" ? "/" : path.replace("/support", ""),
    };
  }

  // Everything else goes to the root domain (represented by 'www' in our utility)
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
