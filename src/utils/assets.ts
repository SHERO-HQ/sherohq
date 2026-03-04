/**
 * Normalize asset imports for Next.js vs Vite compatibility
 *
 * In Vite, static imports return strings (URLs).
 * In Next.js, depending on config and mode, they may return:
 * - StaticImageData objects with .src property
 * - Plain strings (when disableStaticImages: true)
 *
 * This helper ensures consistent string URLs for <img src={} />
 */

export function getAssetUrl(
  asset: string | { src: string } | { default: string },
): string {
  // If already a string, return as-is
  if (typeof asset === "string") {
    return asset;
  }

  // If StaticImageData-like object with .src
  if (asset && typeof asset === "object" && "src" in asset) {
    return asset.src;
  }

  // If ES module default export wrapper
  if (asset && typeof asset === "object" && "default" in asset) {
    return getAssetUrl(asset.default);
  }

  // Fallback empty string (prevents broken img tags)
  console.warn("Unable to resolve asset URL:", asset);
  return "";
}

/**
 * Type guard for asset imports
 */
export type AssetImport = string | { src: string } | { default: string };
