/**
 * Content SHERO hasn't supplied yet. Renders as the design's [bracketed] text
 * so the gap stays visible and nothing gets invented. Search for `missing(`.
 */
export type Missing = { missing: string };
export type Content = string | Missing;

export const missing = (placeholder: string): Missing => ({ missing: placeholder });

export function isMissing(value: Content | null | undefined): value is Missing {
  return typeof value === "object" && value !== null && "missing" in value;
}
