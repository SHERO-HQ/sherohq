import type { ReactNode, SVGProps } from "react";
import { cn } from "@/lib/utils";
import { tone } from "./tone";

/**
 * Building blocks for SHERO's illustrations. Every colour comes from the
 * theme tokens, so each drawing follows light and dark mode on its own.
 * The recurring motif is the slanted band from the SHERO mark.
 */

export function Art({
  viewBox,
  className,
  children,
}: {
  viewBox: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox={viewBox}
      aria-hidden="true"
      focusable="false"
      className={cn("h-auto w-full", className)}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

/** A slanted band, like one stroke of the SHERO mark. `slant` is the horizontal lean. */
export function Band({
  x,
  y,
  w,
  h,
  slant = h * 0.6,
  className,
  ...props
}: { x: number; y: number; w: number; h: number; slant?: number } & SVGProps<SVGPathElement>) {
  return (
    <path d={`M${x + slant} ${y}h${w}l${-slant} ${h}h${-w}z`} className={className} {...props} />
  );
}

/** A rounded panel with a border, used for cards, screens and windows. */
export function Panel({
  x,
  y,
  w,
  h,
  r = 10,
  className = tone.card,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  r?: number;
  className?: string;
}) {
  return <rect x={x} y={y} width={w} height={h} rx={r} className={className} />;
}

/** A placeholder line of text. */
export function TextLine({
  x,
  y,
  w,
  className = tone.line,
}: {
  x: number;
  y: number;
  w: number;
  className?: string;
}) {
  return <rect x={x} y={y} width={w} height={6} rx={3} className={className} />;
}

/** A filled circle with a tick, the "done" mark used across the set. */
export function Tick({ cx, cy, r = 12 }: { cx: number; cy: number; r?: number }) {
  const s = r / 12;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} className={tone.accent} />
      <path
        d={`M${cx - 5 * s} ${cy}l${3.5 * s} ${3.5 * s}l${6.5 * s} ${-7 * s}`}
        className={tone.strokeOnPrimary}
        strokeWidth={2.25 * s}
      />
    </g>
  );
}
