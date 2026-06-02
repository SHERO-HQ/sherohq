"use client";

import React, { useState, useEffect, useRef, createContext, useContext, type ReactNode } from "react";
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

const StaggerContext = createContext({ isInView: false, staggerDelay: 0.12, delayChildren: 0.05 });

/**
 * FadeInView: Standard "Scroll into View" for single blocks powered by native CSS transitions.
 */
export const FadeInView = ({
  children,
  delay = 0,
  direction = "up",
  fullWidth = true,
  threshold = 0.05,
  once = true,
}: Props) => {
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
        threshold,
        rootMargin: "0px 0px -20px 0px",
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold, once, prefersReducedMotion]);

  const xOffset = direction === "left" ? 40 : direction === "right" ? -40 : 0;
  const yOffset = direction === "up" ? 40 : direction === "down" ? -40 : 0;

  return (
    <div
      ref={elementRef}
      className={fullWidth ? "w-full" : ""}
    >
      <div
        className="transition ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transitionDuration: prefersReducedMotion ? "10ms" : "0.75s",
          transitionDelay: prefersReducedMotion ? "0s" : `${delay}s`,
          transitionProperty: "opacity, transform",
          opacity: prefersReducedMotion ? 1 : isInView ? 1 : 0,
          transform: prefersReducedMotion
            ? "none"
            : isInView
              ? "translate3d(0,0,0)"
              : `translate3d(${xOffset}px, ${yOffset}px, 0)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * StaggerContainer: Orchestrates child transitions sequentially driven by a single native Intersection Observer.
 */
export const StaggerContainer = ({
  children,
  as = "div",
  gap = "gap-6",
  className = "",
  staggerDelay = 0.12,
  delayChildren = 0.05,
  once = true,
  threshold = 0.05,
}: ContainerProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [isInView, setIsInView] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

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
        threshold,
        rootMargin: "0px 0px -20px 0px",
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold, once, prefersReducedMotion]);

  const Tag = as as any;
  const finalClassNames = className || `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${gap}`;

  // Automatically inject child indices so markup remains perfectly clean using React.cloneElement (React 19 compatible)
  const childrenWithIndex = typeof children === "object"
    ? React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { index } as any);
        }
        return child;
      })
    : children;

  return (
    <StaggerContext.Provider value={{ isInView, staggerDelay, delayChildren }}>
      <Tag ref={elementRef} className={finalClassNames}>
        {childrenWithIndex}
      </Tag>
    </StaggerContext.Provider>
  );
};

/**
 * StaggerItem: Decoupled nested item that animates sequentially using CSS transform matrices.
 */
export const StaggerItem = ({
  children,
  className = "",
  yOffset = 35,
  xOffset = 0,
  scale = 0.97,
  duration = 0.65,
  ...props
}: ItemProps & { index?: number }) => {
  const prefersReducedMotion = useReducedMotion();
  const { isInView, staggerDelay, delayChildren } = useContext(StaggerContext);
  
  const index = (props as any).index || 0;
  const delay = delayChildren + (index * staggerDelay);

  return (
    <div
      className={`${className} transition ease-[cubic-bezier(0.16,1,0.3,1)]`}
      style={{
        transitionDuration: prefersReducedMotion ? "10ms" : `${duration}s`,
        transitionDelay: prefersReducedMotion ? "0s" : `${delay}s`,
        transitionProperty: "opacity, transform",
        opacity: prefersReducedMotion ? 1 : isInView ? 1 : 0,
        transform: prefersReducedMotion
          ? "none"
          : isInView
            ? "translate3d(0,0,0) scale(1)"
            : `translate3d(${xOffset}px, ${yOffset}px, 0) scale(${scale})`,
      }}
    >
      {children}
    </div>
  );
};

export default FadeInView;
