// The cart is a list of listing ids in a first-party cookie, so the server can
// render the cart and checkout with each device's current price and status.
// Each listing is one specific, checked device, so there are no quantities.

export const CART_COOKIE = "shero_cart";
export const CART_EVENT = "shero:cart";
export const CART_MAX_ITEMS = 20;
/** httpOnly: the order just placed, so its confirmation page can show it. */
export const PLACED_COOKIE = "shero_order";
const CART_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Listing ids from the cookie value, deduplicated; anything malformed is dropped. */
export function parseCart(value: string | undefined | null): string[] {
  if (!value) return [];
  const ids = decodeURIComponent(value)
    .split(".")
    .filter((id) => UUID.test(id));
  return [...new Set(ids)].slice(0, CART_MAX_ITEMS);
}

export function serialiseCart(ids: string[]): string {
  return [...new Set(ids)].slice(0, CART_MAX_ITEMS).join(".");
}

// ── Browser side ─────────────────────────────────────────────────────────────

export function readCart(): string[] {
  if (typeof document === "undefined") return [];
  const match = document.cookie.match(new RegExp(`(?:^|; )${CART_COOKIE}=([^;]*)`));
  return parseCart(match?.[1]);
}

export function writeCart(ids: string[]) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  const value = serialiseCart(ids);
  document.cookie = value
    ? `${CART_COOKIE}=${value}; Max-Age=${CART_MAX_AGE}; Path=/; SameSite=Lax${secure}`
    : `${CART_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new Event(CART_EVENT));
}

export function addToCart(id: string) {
  writeCart([...readCart(), id]);
}

export function removeFromCart(id: string) {
  writeCart(readCart().filter((item) => item !== id));
}

export function subscribeCart(onChange: () => void) {
  window.addEventListener(CART_EVENT, onChange);
  // Another tab may change the cart; pick that up when this one regains focus.
  window.addEventListener("focus", onChange);
  return () => {
    window.removeEventListener(CART_EVENT, onChange);
    window.removeEventListener("focus", onChange);
  };
}

// useSyncExternalStore needs a stable snapshot, so compare by the joined value.
let lastSnapshot: string[] = [];
export function cartSnapshot(): string[] {
  const current = readCart();
  if (current.join(".") !== lastSnapshot.join(".")) lastSnapshot = current;
  return lastSnapshot;
}
const emptyCart: string[] = [];
export const serverCartSnapshot = () => emptyCart;
