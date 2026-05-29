"use client";

import { motion } from "motion/react";
import type { Variants } from "motion/react";
import type { ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Props {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  fullWidth?: boolean;
  threshold?: number;
  once?: boolean;
}

interface ContainerProps {
  children: ReactNode;
  as?: "div" | "ul" | "ol" | "section" | "nav" | "article" | "aside" | "header" | "footer";
  gap?: string;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
  once?: boolean;
  threshold?: number;
}

interface ItemProps {
  children: ReactNode;
  className?: string;
  yOffset?: number;
  xOffset?: number;
  scale?: number;
  duration?: number;
}

/**
 * FadeInView: Standard "Scroll into View" for single blocks
 */
export const FadeInView = ({
  children,
  delay = 0,
  direction = "up",
  fullWidth = true,
  threshold = 0.1,
  once = true,
}: Props) => {
  const prefersReducedMotion = useReducedMotion();
  const motionEnabled = !prefersReducedMotion;

  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
    none: { x: 0, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount: threshold, margin: "0px 0px -50px 0px" }}
      transition={{
        duration: motionEnabled ? 0.75 : 0.01,
        delay: motionEnabled ? delay : 0,
        ease: [0.16, 1, 0.3, 1] as const,
      }}
      className={fullWidth ? "w-full" : ""}
    >
      {children}
    </motion.div>
  );
};

/**
 * StaggerContainer: Orchestrates child transitions sequentially as this parent scrolls into view.
 * Polymorphic element supporting customizable layout tags and custom CSS classes.
 */
export const StaggerContainer = ({
  children,
  as = "div",
  gap = "gap-6",
  className = "",
  staggerDelay = 0.12,
  delayChildren = 0.05,
  once = true,
  threshold = 0.08,
}: ContainerProps) => {
  const prefersReducedMotion = useReducedMotion();
  const motionEnabled = !prefersReducedMotion;

  // GPU compositing and sequence variants
  const containerVariants: Variants = {
    hidden: {}, // Purely orchestrational variant
    show: {
      transition: {
        staggerChildren: motionEnabled ? staggerDelay : 0,
        delayChildren: motionEnabled ? delayChildren : 0,
      },
    },
  };

  // Polymorphic element dynamic assignment
  const MotionComponent = motion.create(as);

  // Maintain backward compatibility for existing grid declarations if no custom className is specified
  const finalClassNames = className || `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${gap}`;

  return (
    <MotionComponent
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: threshold, margin: "0px 0px -60px 0px" }}
      className={finalClassNames}
    >
      {children}
    </MotionComponent>
  );
};

/**
 * StaggerItem: Nested inside StaggerContainer. Inherits initial and whileInView state triggers
 * organically from the parent. Spawns ZERO redundant scroll viewport observers!
 */
export const StaggerItem = ({
  children,
  className = "",
  yOffset = 35,
  xOffset = 0,
  scale = 0.97,
  duration = 0.65,
}: ItemProps) => {
  const prefersReducedMotion = useReducedMotion();
  const motionEnabled = !prefersReducedMotion;

  const itemVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: motionEnabled ? yOffset : 0, 
      x: motionEnabled ? xOffset : 0, 
      scale: motionEnabled ? scale : 1,
    },
    show: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration: motionEnabled ? duration : 0.01,
        ease: [0.16, 1, 0.3, 1] as const, // Highly premium deceleration ease
      },
    },
  };

  return (
    <motion.div
      variants={itemVariants}
      className={`${className} will-change-transform backface-hidden`}
      style={{ transform: "translateZ(0)" }}
    >
      {children}
    </motion.div>
  );
};

export default FadeInView;
