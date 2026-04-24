import Image from "next/image";
import { useState } from "react";

interface AppImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  placeholderText?: string;
}

export default function AppImage({
  src,
  alt,
  fill,
  width,
  height,
  priority = false,
  className = "",
  placeholderText = "No Image",
  sizes,
}: AppImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const fallbackSrc = `https://placehold.co/${width ?? 400}x${height ?? 400}?text=${encodeURIComponent(placeholderText)}`;

  const isRemote = src?.startsWith("http") || fallbackSrc.startsWith("http");

  if (!src || failedSrc === src) {
    return (
      <Image
        src={fallbackSrc}
        alt={alt}
        width={!fill ? (width ?? 400) : undefined}
        height={!fill ? (height ?? 400) : undefined}
        fill={fill}
        sizes={fill ? "100vw" : undefined}
        unoptimized={true}
        className={className}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      fill={fill}
      priority={priority}
      unoptimized={isRemote}
      sizes={
        sizes ||
        (fill
          ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          : undefined)
      }
      className={className}
      onError={() => {
        console.warn(`Image failed to load: ${src}`);
        setFailedSrc(src);
      }}
    />
  );
}
