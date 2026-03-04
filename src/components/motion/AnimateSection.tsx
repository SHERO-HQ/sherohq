"use client";
import { motion } from "motion/react";
import type { Variants } from "motion/react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  fullWidth?: boolean;
  threshold?: number;
  once?: boolean; // Added to control re-animation on scroll
}

interface ContainerProps {
  children: ReactNode;
  gap?: string;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
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
  const directions = {
    up: { y: 60, x: 0 },
    down: { y: -60, x: 0 },
    left: { x: 60, y: 0 },
    right: { x: -60, y: 0 },
    none: { x: 0, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      // 'amount' determines what % of the element must be in view to start
      viewport={{ once, amount: threshold, margin: "0px 0px -50px 0px" }}
      transition={{
        duration: 0.9,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={fullWidth ? "w-full" : ""}
    >
      {children}
    </motion.div>
  );
};

/**
 * StaggerContainer: Orchestrates children as the parent scrolls into view
 */
export const StaggerContainer = ({
  children,
  gap = "gap-6",
  className = "",
  staggerDelay = 0.15,
  once = true,
}: ContainerProps) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      // Re-trigger children animations based on 'once'
      viewport={{ once, amount: 0.1, margin: "0px 0px -50px 0px" }}
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${gap} ${className}`}
    >
      {children}
    </motion.div>
  );
};

/**
 * StaggerItem: Use inside StaggerContainer
 */
export const StaggerItem = ({ children }: { children: ReactNode }) => {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.94 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return <motion.div variants={itemVariants}>{children}</motion.div>;
};

export default FadeInView;
