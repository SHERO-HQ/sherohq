"use client";
/**
 * ProductImage — Next.js Image wrapper for user-uploaded product/guide images.
 *
 * Responsibilities:
 * - Delegates to next/image so uploads are automatically compressed and
 *   converted to WebP by Vercel's image optimisation layer.
 * - Shows a placeholder on load error (broken upload, missing file, etc.).
 * - Accepts the same `fill` / `width+height` patterns as next/image.
 */
import Image from "next/image";
import { useState } from "react";

interface ProductImageProps {
  src: string;
  alt: string;
  /** Use when the parent container is `position:relative` with known dimensions. */
  fill?: boolean;
  /** Required when fill is false. */
  width?: number;
  /** Required when fill is false. */
  height?: number;
  /**
   * Responsive size hints, e.g. "(max-width: 640px) 50vw, 25vw".
   * Helps the browser fetch the right resolution; always provide when using fill.
   */
  sizes?: string;
  /** Eagerly load above-the-fold images (LCP candidates). */
  priority?: boolean;
  className?: string;
  placeholderText?: string;
}

export default function ProductImage({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  priority = false,
  className = "",
  placeholderText = "No Image",
}: ProductImageProps) {
  const [error, setError] = useState(false);

  const fallbackSrc = `https://placehold.co/${width ?? 400}x${height ?? 400}?text=${encodeURIComponent(placeholderText)}`;

  if (error || !src) {
    // Plain img for the fallback — it is a static external URL so no
    // optimisation needed and it avoids adding the domain to remotePatterns.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={fallbackSrc} alt={alt} className={className} />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setError(true)}
    />
  );
}
