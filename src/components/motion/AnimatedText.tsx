import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";

// Type Definitions
interface AnimatedTextProps {
  words: readonly string[];
  interval?: number;
  className?: string;
  "aria-live"?: "polite" | "assertive" | "off";
  "aria-atomic"?: boolean;
  pauseOnHover?: boolean;
}

// Constants
const ANIMATION_CONFIG = {
  DURATION: 0.6,
  EASING: [0.16, 1, 0.3, 1] as const,
  DEFAULT_INTERVAL: 4000,
} as const;

const AnimatedText = ({
  words,
  interval = ANIMATION_CONFIG.DEFAULT_INTERVAL,
  className = "",
  "aria-live": ariaLive = "polite",
  "aria-atomic": ariaAtomic = true,
  pauseOnHover = true,
}: AnimatedTextProps) => {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check prefers-reduced-motion once on mount (memoized)
  const prefersReducedMotion = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  // Handle text rotation with pause support
  useEffect(() => {
    // Guard: Empty array or reduced motion or paused
    if (words.length === 0 || prefersReducedMotion || isPaused) return;

    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, interval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [words, interval, isPaused, prefersReducedMotion]);

  // Guard: Return null if no words
  if (words.length === 0) return null;

  // If reduced motion, show first word without animation
  if (prefersReducedMotion) {
    return (
      <span
        className={`inline-flex items-center ${className}`}
        aria-live={ariaLive}
        aria-atomic={ariaAtomic}
        role="status"
      >
        {words[0]}
      </span>
    );
  }

  const handleMouseEnter = () => {
    if (pauseOnHover) setIsPaused(true);
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) setIsPaused(false);
  };

  return (
    <span
      className={`relative inline-grid place-items-start min-w-[0.5em] ${className}`}
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
      role="status"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      tabIndex={0}
      aria-label={`Rotating text: ${words.join(", ")}`}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{
            duration: ANIMATION_CONFIG.DURATION,
            ease: ANIMATION_CONFIG.EASING,
          }}
          className="col-start-1 row-start-1 whitespace-nowrap"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

export default AnimatedText;