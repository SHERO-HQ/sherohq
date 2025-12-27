import type { Variants } from "framer-motion";
import { useState, useEffect } from "react";

/**
 * Animation Configuration Constants
 * Centralized values for consistent animation timing and offsets
 */
export const ANIMATION_CONFIG = {
  FADE_UP: {
    Y_OFFSET: 12,
    DURATION: 0.8,
  },
  // Add more animation configs here as needed
} as const;

/**
 * Custom easing curves
 * Kept for reference or future use
 */
export const CUSTOM_EASINGS = {
  easeInOut: [0.42, 0, 0.58, 1] as const,
  smoothOut: [0.22, 1, 0.36, 1] as const,
  // Add more custom easing curves here
} as const;

/**
 * Fade Up Animation Variant
 * Used for staggered entry animations in hero sections
 * 
 * @example
 * ```tsx
 * <motion.div
 *   variants={fadeUp}
 *   initial="hidden"
 *   animate="visible"
 * >
 *   Content
 * </motion.div>
 * ```
 */
export const fadeUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: ANIMATION_CONFIG.FADE_UP.Y_OFFSET 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_CONFIG.FADE_UP.DURATION,
      ease: CUSTOM_EASINGS.easeInOut,
    },
  },
};

/**
 * Fade Up with Reduced Motion Support
 * Respects user's motion preferences
 * 
 * @param prefersReducedMotion - Whether user prefers reduced motion
 * @returns Appropriate animation variant
 * 
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 * 
 * <motion.div
 *   variants={fadeUpAccessible(prefersReducedMotion)}
 *   initial="hidden"
 *   animate="visible"
 * >
 *   Content
 * </motion.div>
 * ```
 */
export const fadeUpAccessible = (prefersReducedMotion: boolean): Variants => {
  if (prefersReducedMotion) {
    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration: 0.001, // Near-instant for reduced motion
        },
      },
    };
  }

  return fadeUp;
};

/**
 * Stagger Container Variant
 * Use on parent elements to create staggered animations for children
 * 
 * @example
 * ```tsx
 * <motion.div
 *   variants={staggerContainer}
 *   initial="hidden"
 *   animate="visible"
 * >
 *   <motion.div variants={fadeUp}>Child 1</motion.div>
 *   <motion.div variants={fadeUp}>Child 2</motion.div>
 * </motion.div>
 * ```
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

/**
 * Fade In (No Movement)
 * Simple opacity animation without vertical offset
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: CUSTOM_EASINGS.easeInOut,
    },
  },
};

/**
 * Scale Up Animation
 * Useful for cards, images, and featured content
 */
export const scaleUp: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95 
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: CUSTOM_EASINGS.easeInOut,
    },
  },
};

/**
 * Custom Hook: useReducedMotion
 * Detects user's motion preferences from system settings
 * 
 * @returns boolean indicating if user prefers reduced motion
 * 
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 * const variants = fadeUpAccessible(prefersReducedMotion);
 * ```
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
};

// Note: You'll need to add these imports at the top of the file:
// import { useState, useEffect } from "react";