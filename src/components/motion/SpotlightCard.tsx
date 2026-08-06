"use client";

import React, { useRef, useState, ReactNode } from "react";
import { m, useSpring, useTransform } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

export default function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(var(--brand-secondary-rgb), 0.15)",
}: {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const mouseX = useSpring(0, { stiffness: 500, damping: 50 });
  const mouseY = useSpring(0, { stiffness: 500, damping: 50 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (prefersReducedMotion || !ref.current) return;
    const { left, top } = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  }

  function handleMouseEnter() {
    if (prefersReducedMotion) return;
    setIsHovered(true);
  }

  function handleMouseLeave() {
    if (prefersReducedMotion) return;
    setIsHovered(false);
  }

  const background = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `radial-gradient(400px circle at ${x}px ${y}px, ${spotlightColor}, transparent 80%)`
  );

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn("relative overflow-hidden", className)}
    >
      <m.div
        className="pointer-events-none absolute -inset-px z-0 transition-opacity duration-300"
        style={{
          background,
          opacity: isHovered ? 1 : 0,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
