"use client";
import { useState, useEffect } from "react";

/**
 * Custom Hook: useReducedMotion
 * Detects user's motion preferences from OS system settings.
 * Initialized to false to avoid hydration mismatches between server and client.
 *
 * @returns boolean indicating if user prefers reduced motion
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 * ```
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    } else {
      // Deprecated methods supported by older WebKit versions and in-app webviews
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, []);

  return prefersReducedMotion;
};

