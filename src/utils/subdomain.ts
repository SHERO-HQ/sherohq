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

const KNOWN_SUBDOMAINS = ["admin", "shop", "support", "www"];

const getBaseDomain = (hostname: string): string => {
  const parts = hostname.split(".");
  // If we identify a known subdomain at the start, the rest is the base domain
  if (KNOWN_SUBDOMAINS.includes(parts[0].toLowerCase())) {
    return parts.slice(1).join(".");
  }
  // Default fallback: if it looks like a standard domain (e.g., sherohq.com), return as is
  if (parts.length === 2) return hostname;
  // For Vercel/Netlify preview domains (e.g., project-id.vercel.app), treating the whole thing as base
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
    let internalPath = path;

    // We do NOT strip the prefix because the app structure keeps them
    // Example: shop.sherohq.com/shop or shop.sherohq.com/products
    // This matches the src/app/(public) structure where these are subdirectories

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
