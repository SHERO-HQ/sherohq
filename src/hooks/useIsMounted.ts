import { useState, useEffect } from "react";

/**
 * Returns `true` only after the component has mounted on the client.
 *
 * Uses the standard useEffect pattern to ensure the initial client render
 * matches the server render, preventing hydration mismatches that cause
 * Next.js to force-reload the page.
 */
export function useIsMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return mounted;
}
