export function toReadableOrderId(orderId: string): string {
  const compact = String(orderId ?? "")
    .trim()
    .replace(/^ord-/i, "")
    .replace(/[^0-9a-f]/gi, "");
  if (!compact) return "#UNKNOWN";
  return `#${compact.slice(0, 8).toUpperCase()}`;
}
