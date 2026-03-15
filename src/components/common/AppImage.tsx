"use client";
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
}: AppImageProps) {
 const [error, setError] = useState(false);

 const fallbackSrc = `https://placehold.co/${width ?? 400}x${height ?? 400}?text=${encodeURIComponent(placeholderText)}`;

 if (error || !src) {
 return (
 /* eslint-disable-next-line @next/next/no-img-element */
 <img src={fallbackSrc} alt={alt} className={className} />
 );
 }

 return (
 /* eslint-disable-next-line @next/next/no-img-element */
 <img
 src={src}
 alt={alt}
 width={!fill ? width : undefined}
 height={!fill ? height : undefined}
 loading={priority ? "eager" : "lazy"}
 decoding="async"
 className={className}
 onError={() => setError(true)}
 />
 );
}
