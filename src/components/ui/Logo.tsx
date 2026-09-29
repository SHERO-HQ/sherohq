/* eslint-disable @next/next/no-img-element -- SVG logo, nothing to optimise */
import { cn } from "@/lib/cn";

type LogoProps = {
  /** "auto" follows the theme; "light" is for dark backgrounds only. */
  variant?: "auto" | "light";
  className?: string;
};

const FULL_COLOUR = "/assets/logo/shero-dark.svg";
const LIGHT = "/assets/logo/shero-light.svg";

/** The SHERO logo. Never redrawn or recoloured: only the supplied files. */
export function Logo({ variant = "auto", className }: LogoProps) {
  if (variant === "light") {
    return <img src={LIGHT} alt="SHERO" width={163} height={57} className={className} />;
  }

  // Both files render; CSS shows the one that matches the theme, including a
  // theme picked with the toggle (which a <picture> media query can't see).
  return (
    <>
      <img src={FULL_COLOUR} alt="SHERO" width={163} height={57} className={cn("only-light", className)} />
      <img src={LIGHT} alt="SHERO" width={163} height={57} className={cn("only-dark", className)} />
    </>
  );
}
