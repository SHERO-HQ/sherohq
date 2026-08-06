"use client";

import React, { useRef, createContext, useContext, type ReactNode } from "react";
import { useInView } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Props {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  fullWidth?: boolean;
  threshold?: number;
  once?: boolean;
  trigger?: "scroll" | "mount";
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
  trigger?: "scroll" | "mount";
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
 * FadeInView: Standard entrance animation for single blocks triggered on client mount.
 */
export const FadeInView = ({
  children,
  delay = 0,
  direction = "up",
  fullWidth = true,
  trigger = "scroll",
}: Props) => {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const scrollInView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const isInView = trigger === "mount" ? isMounted : scrollInView;

  const xOffset = direction === "left" ? 40 : direction === "right" ? -40 : 0;
  const yOffset = direction === "up" ? 40 : direction === "down" ? -40 : 0;

  return (
    <div className={fullWidth ? "w-full" : ""} ref={ref}>
      <div
        className="transition ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transitionDuration: prefersReducedMotion ? "10ms" : "0.75s",
          transitionDelay: `${delay}s`, 
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
 * StaggerContainer: Orchestrates child transitions sequentially triggered immediately on client mount.
 */
export const StaggerContainer = ({
  children,
  as = "div",
  gap = "gap-6",
  className = "",
  staggerDelay = 0.12,
  delayChildren = 0.05,
  trigger = "scroll",
}: ContainerProps) => {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const scrollInView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const isInView = trigger === "mount" ? isMounted : scrollInView;

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
      <Tag ref={ref} className={finalClassNames}>
        {childrenWithIndex}
      </Tag>
    </StaggerContext.Provider>
  );
};

/**
 * StaggerItem: Decoupled nested item that animates sequentially using CSS transition timings.
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
