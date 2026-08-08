"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * useVisibleInterval
 *
 * Combines `setInterval` with `IntersectionObserver` so the callback only
 * fires while the referenced element is visible in the viewport.
 * When the element scrolls out of view the interval is cleared, saving
 * CPU cycles from unnecessary state updates and re-renders.
 *
 * @param callback  Function to call on each tick
 * @param delay     Interval delay in ms (pass `null` to disable)
 * @param ref       React ref to the DOM element to observe
 */
export function useVisibleInterval<T extends HTMLElement>(
  callback: () => void,
  delay: number | null,
  ref: RefObject<T | null>,
): void {
  const savedCallback = useRef(callback);

  // Keep the callback ref fresh without restarting the interval
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const element = ref.current;
    if (!element) {
      // No element to observe — fall back to a normal interval
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (intervalId !== null) return; // already running
      intervalId = setInterval(() => savedCallback.current(), delay);
    };

    const stop = () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    // If IntersectionObserver isn't available, just run the interval
    if (typeof IntersectionObserver === "undefined") {
      start();
      return stop;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          start();
        } else {
          stop();
        }
      },
      { threshold: 0 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      stop();
    };
  }, [delay, ref]);
}
