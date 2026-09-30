// Colour themes a product page can use. Each is defined in globals.css for
// both themes and checked for 4.5:1 contrast by the accessibility tests. The
// admin picks from these; a new colour needs a new entry here and in the CSS.
export const productThemes = [
  { value: "shero", label: "SHERO navy" },
  { value: "merchander", label: "Orange (Merchander)" },
  { value: "pharmasyst", label: "Green and indigo (Pharmasyst)" },
] as const;

export type ProductTheme = (typeof productThemes)[number]["value"];

export function themeClass(theme: string) {
  return productThemes.some((t) => t.value === theme) ? `theme-${theme}` : "theme-shero";
}
