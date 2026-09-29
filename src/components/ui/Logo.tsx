/* eslint-disable @next/next/no-img-element -- SVG logo, nothing to optimise */

type LogoProps = {
  /** "auto" follows the colour scheme; "light" is for dark backgrounds only. */
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

  return (
    <picture>
      <source srcSet={LIGHT} media="(prefers-color-scheme: dark)" />
      <img src={FULL_COLOUR} alt="SHERO" width={163} height={57} className={className} />
    </picture>
  );
}
