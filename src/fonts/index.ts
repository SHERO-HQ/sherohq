import localFont from "next/font/local";

/**
 * Typefaces in one place: the Master Brand's Red Hat family. Components use the
 * `--font-heading`, `--font-text` and `--font-code` variables via Tailwind.
 */
export const headingFont = localFont({
  src: "./RedHatDisplay-Variable.woff2",
  weight: "300 900",
  variable: "--font-heading",
  display: "swap",
});

export const textFont = localFont({
  src: "./RedHatText-Variable.woff2",
  weight: "300 700",
  variable: "--font-text",
  display: "swap",
});

export const codeFont = localFont({
  src: "./RedHatMono-Variable.woff2",
  weight: "300 700",
  variable: "--font-code",
  display: "swap",
});
