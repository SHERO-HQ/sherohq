"use client";
import type { ReactNode } from "react";
import { motion } from "motion/react";

interface RevealProps {
  children: ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  once?: boolean;
  className?: string;
  blur?: boolean;
}

/**
 * Reveal: A versatile scroll-triggered entrance animation component.
 * Supports direction, delay, distance, blur, and custom durations.
 */
export const Reveal = ({
  children,
  width = "100%",
  delay = 0,
  duration = 0.8,
  direction = "up",
  distance = 30,
  once = true,
  className = "",
  blur = false,
}: RevealProps) => {
  const directions = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
    none: { x: 0, y: 0 },
  };

  return (
    <div
      style={{ position: "relative", width, overflow: "visible" }}
      className={className}
    >
      <motion.div
        initial={{
          opacity: 0,
          ...directions[direction],
          filter: blur ? "blur(10px)" : "none",
        }}
        whileInView={{
          opacity: 1,
          x: 0,
          y: 0,
          filter: "blur(0px)",
        }}
        viewport={{ once, amount: 0.2, margin: "0px 0px -50px 0px" }}
        transition={{
          duration,
          delay,
          ease: [0.16, 1, 0.3, 1], // Custom smooth ease-out
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default Reveal;
