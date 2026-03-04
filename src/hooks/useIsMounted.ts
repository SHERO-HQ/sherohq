import { useSyncExternalStore } from "react";

/**
 * Returns `true` only after the component has mounted on the client.
 *
 * Uses useSyncExternalStore so React always reads the correct snapshot
 * without needing a setState-in-effect pattern (which react-hooks v7
 * flags as a lint error).
 *
 * - Server / SSR:   always returns `false`
 * - Client initial: returns `true`  (no extra render cycle needed)
 */

function subscribe() {
  return () => {};
}

export function useIsMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true, // client snapshot
    () => false, // server snapshot
  );
}
