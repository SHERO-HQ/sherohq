import localFont from "next/font/local";

/**
 * Typefaces in one place. Swapping the brand font is a change to this file only:
 * components use the `--font-text` and `--font-code` variables via Tailwind.
 */
export const textFont = localFont({
  src: "./InstrumentSans-Variable.woff2",
  weight: "400 700",
  variable: "--font-text",
  display: "swap",
});

export const codeFont = localFont({
  src: [
    { path: "./IBMPlexMono-Regular.woff2", weight: "400" },
    { path: "./IBMPlexMono-Medium.woff2", weight: "500" },
  ],
  variable: "--font-code",
  display: "swap",
});
