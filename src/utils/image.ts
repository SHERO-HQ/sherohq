/**
 * Resolve an image source that may be either a string URL (Vite)
 * or a StaticImageData object (Next.js).
 *
 * Usage: <img src={resolveImageSrc(importedImage)} />
 */
export function resolveImageSrc(
  src: string | { src: string; [key: string]: unknown },
): string {
  if (typeof src === "string") return src;
  if (src && typeof src === "object" && "src" in src) return src.src;
  return String(src);
}
