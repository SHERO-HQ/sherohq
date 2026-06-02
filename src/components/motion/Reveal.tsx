"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

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
 * Reveal: A highly performant scroll-triggered entrance animation component powered by native CSS transitions.
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
  const prefersReducedMotion = useReducedMotion();
  const [isInView, setIsInView] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once && elementRef.current) {
            observer.unobserve(elementRef.current);
          }
        } else if (!once) {
          setIsInView(false);
        }
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -20px 0px",
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [once, prefersReducedMotion]);

  const xOffset = direction === "left" ? distance : direction === "right" ? -distance : 0;
  const yOffset = direction === "up" ? distance : direction === "down" ? -distance : 0;

  return (
    <div
      ref={elementRef}
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
          transitionDelay: prefersReducedMotion ? "0s" : `${delay}s`,
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
