/**
 * Returns a URL-safe short order identifier (e.g. "D54E53BF").
 * Use this in URLs, API calls, query params, and data storage.
 * For display text with the # prefix, use `displayOrderId()`.
 */
export function toReadableOrderId(orderId: string): string {
  const compact = String(orderId ?? "")
    .trim()
    .replace(/^#/, "")
    .replace(/^ord-/i, "")
    .replace(/[^0-9a-f]/gi, "");
  if (!compact) return "UNKNOWN";
  return compact.slice(0, 8).toUpperCase();
}

/**
 * Returns a display-formatted order ID with # prefix (e.g. "#D54E53BF").
 * Use this ONLY for visible text in the UI — never in URLs or API paths.
 */
export function displayOrderId(orderId: string): string {
  return `#${toReadableOrderId(orderId)}`;
}
