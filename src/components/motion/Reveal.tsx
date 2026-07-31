"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface RevealProps {
  children: ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  className?: string;
  blur?: boolean;
}

/**
 * Reveal: A highly performant client-mount entrance animation component powered by native CSS transitions.
 */
export const Reveal = ({
  children,
  width = "100%",
  delay = 0,
  duration = 0.8,
  direction = "up",
  distance = 30,
  className = "",
  blur = false,
}: RevealProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInView(true);
    }, prefersReducedMotion ? 0 : delay * 1000);

    return () => clearTimeout(timer);
  }, [delay, prefersReducedMotion]);

  const xOffset = direction === "left" ? distance : direction === "right" ? -distance : 0;
  const yOffset = direction === "up" ? distance : direction === "down" ? -distance : 0;

  return (
    <div
      style={{
        position: "relative",
        width,
        overflow: "visible",
      }}
      className={className}
    >
      <div
        className="transition ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transitionDuration: prefersReducedMotion ? "10ms" : `${duration}s`,
          transitionDelay: "0s",
          transitionProperty: "opacity, transform, filter",
          opacity: prefersReducedMotion ? 1 : isInView ? 1 : 0,
          transform: prefersReducedMotion
            ? "none"
            : isInView
              ? "translate3d(0,0,0)"
              : `translate3d(${xOffset}px, ${yOffset}px, 0)`,
          filter: prefersReducedMotion
            ? "none"
            : blur
              ? isInView ? "blur(0px)" : "blur(10px)"
              : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Reveal;
