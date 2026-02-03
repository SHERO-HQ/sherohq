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
