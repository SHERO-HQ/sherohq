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
  return map[orderId] || null;
}

export function clearOrderAccessToken(orderId: string): void {
  if (!orderId || typeof window === "undefined") return;

  const map = readOrderAccessMap();
  delete map[orderId];
  writeOrderAccessMap(map);
}
