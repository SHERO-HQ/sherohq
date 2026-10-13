import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * Reads a browser-only value (the clock, time zone, URL) without a hydration
 * mismatch: the server render and first client render see `null`.
 * `read` must return the same primitive while nothing has changed.
 */
export function useClientValue<T extends string | number>(read: () => T): T | null {
  return useSyncExternalStore<T | null>(noop, read, () => null);
}
