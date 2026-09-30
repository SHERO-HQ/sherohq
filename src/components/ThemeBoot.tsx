"use client";

import { themeBootScript } from "@/lib/theme";

/**
 * Applies a saved theme before first paint. Rendered on the server only: the
 * browser runs it from the HTML, and React never creates it again on the
 * client (a script it creates wouldn't run, and React warns about it, e.g.
 * when an error page re-renders the whole document). React skips the extra
 * tag in <head> when it hydrates.
 */
export function ThemeBoot() {
  if (typeof window !== "undefined") return null;
  return <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />;
}
