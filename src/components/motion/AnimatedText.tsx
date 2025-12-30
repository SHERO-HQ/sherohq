import { useState, useEffect, useRef } from "react";
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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Handle text rotation with pause support
  useEffect(() => {
    // Guard: Empty array
    if (words.length === 0) return;

    // If reduced motion, stop rotation
    if (prefersReducedMotion) return;

    // If paused, don't start timer
    if (isPaused) return;

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
  if (words.length === 0) {
    return null;
  }

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
    if (pauseOnHover) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      setIsPaused(false);
    }
  };

  return (
    <span
      className={`
        relative inline-grid place-items-start
        
        min-w-[0.5em] 
        ${className}
      `}
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
          className="col-start-1 row-start-1 whitespace-nowrap bg-linear-to-r from-secondary from-10% via-blue-500 via-30% to-indigo-500 bg-clip-text text-transparent"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

export default AnimatedText;
