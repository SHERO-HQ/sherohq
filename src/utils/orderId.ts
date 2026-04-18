export function toReadableOrderId(orderId: string): string {
  const compact = String(orderId ?? "")
    .replaceAll("-", "")
    .trim();
  if (!compact) return "ORD-UNKNOWN";
  return `ORD-${compact.slice(0, 8).toUpperCase()}`;
}
