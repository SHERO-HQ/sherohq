/* eslint-disable @next/next/no-img-element -- static SVG logos, no optimisation needed */
import Link from "next/link";

/** The SHERO logo. Fixed artwork: the right file is chosen per theme, never recoloured. */
export function Logo({ height = 28 }: { height?: number }) {
  const width = Math.round((height * 335) / 130);
  return (
    <Link href="/" aria-label="SHERO home" className="inline-flex items-center">
      <img src="/brand/shero-full.svg" alt="" width={width} height={height} className="light-only" />
      <img src="/brand/shero-ondark.svg" alt="" width={width} height={height} className="dark-only" />
    </Link>
  );
}
