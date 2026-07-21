const ORDER_ACCESS_KEY = "sherotech_order_access_tokens";

type OrderAccessMap = Record<string, string>;

function readOrderAccessMap(): OrderAccessMap {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(ORDER_ACCESS_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as OrderAccessMap;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function writeOrderAccessMap(map: OrderAccessMap): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ORDER_ACCESS_KEY, JSON.stringify(map));
}

export function saveOrderAccessToken(orderId: string, token: string): void {
  if (!orderId || !token || typeof window === "undefined") return;

  const map = readOrderAccessMap();
  map[orderId] = token;
  writeOrderAccessMap(map);
}

export function getOrderAccessToken(orderId: string): string | null {
  if (!orderId) return null;

  const map = readOrderAccessMap();
  const directToken = map[orderId];
  if (directToken) return directToken;

  // Payment providers return the safe, readable `ORD-XXXXXXXX` reference.
  // Tokens are stored against the canonical UUID, so resolve that reference
  // locally only when it identifies exactly one of this browser's orders.
  const compactReference = String(orderId)
    .trim()
    .replace(/^ord-/i, "")
    .replace(/[^0-9a-f]/gi, "")
    .toLowerCase();

  if (compactReference.length < 8) return null;

  const matchingTokens = Object.entries(map).filter(([storedOrderId]) =>
    storedOrderId.replace(/[^0-9a-f]/gi, "").toLowerCase()
      .startsWith(compactReference),
  );

  return matchingTokens.length === 1 ? matchingTokens[0][1] : null;
}

export function clearOrderAccessToken(orderId: string): void {
  if (!orderId || typeof window === "undefined") return;

  const map = readOrderAccessMap();
  delete map[orderId];
  writeOrderAccessMap(map);
}
