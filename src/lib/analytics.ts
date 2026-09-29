// Google Analytics and Microsoft Clarity run only after the visitor agrees in
// the cookie notice. The choice is kept in a first-party cookie.

export const CONSENT_COOKIE = "shero_consent";
const CONSENT_MAX_AGE = 60 * 60 * 24 * 182; // about 6 months, then ask again
export const CONSENT_EVENT = "shero:consent";

export type Consent = "granted" | "denied";

export function readConsent(): Consent | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=(granted|denied)`));
  return (match?.[1] as Consent | undefined) ?? null;
}

export function saveConsent(value: Consent) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent<Consent>(CONSENT_EVENT, { detail: value }));
}

/** The key events from the PRD's success measures. */
export type KeyEvent = "consultation_booked" | "order_placed" | "waitlist_joined";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Sends a key event to Google Analytics; a no-op without consent. */
export function trackEvent(name: KeyEvent, params?: Record<string, string | number>) {
  window.gtag?.("event", name, params);
}
