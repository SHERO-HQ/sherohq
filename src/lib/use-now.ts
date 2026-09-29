"use client";

import { useSyncExternalStore } from "react";

// One shared minute ticker for every live-time component on the page.
let now: Date | null = null;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | undefined;

function tick() {
  now = new Date();
  listeners.forEach((listener) => listener());
  // Re-align to the start of each minute so countdowns change on the minute.
  timer = setTimeout(tick, 60_000 - (Date.now() % 60_000));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) tick();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) clearTimeout(timer);
  };
}

/**
 * The current time, updated every minute. Null during server rendering and
 * hydration, so time-dependent text never mismatches the static HTML.
 */
export function useNow(): Date | null {
  return useSyncExternalStore(
    subscribe,
    () => now,
    () => null,
  );
}
