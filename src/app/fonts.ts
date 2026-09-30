import localFont from "next/font/local";

// Red Hat, self-hosted from the @fontsource-variable packages. next/font
// preloads them and sizes a matching system fallback, so text doesn't jump
// when the fonts arrive. Latin only: every page is in English.

export const display = localFont({
  src: "../../node_modules/@fontsource-variable/red-hat-display/files/red-hat-display-latin-wght-normal.woff2",
  weight: "300 900",
  variable: "--font-red-hat-display",
  fallback: ["system-ui", "sans-serif"],
});

export const text = localFont({
  src: "../../node_modules/@fontsource-variable/red-hat-text/files/red-hat-text-latin-wght-normal.woff2",
  weight: "300 700",
  variable: "--font-red-hat-text",
  fallback: ["system-ui", "sans-serif"],
});

export const mono = localFont({
  src: "../../node_modules/@fontsource-variable/red-hat-mono/files/red-hat-mono-latin-wght-normal.woff2",
  weight: "300 700",
  variable: "--font-red-hat-mono",
  fallback: ["ui-monospace", "monospace"],
  // Arial-based fallback metrics don't suit a monospace face.
  adjustFontFallback: false,
  // Only small labels, prices and specs use it; not preloading it leaves the
  // bandwidth to the heading and body fonts, which the largest text waits for.
  preload: false,
});
