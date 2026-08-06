"use client";

import { useRef, useState, ReactNode } from "react";
import { m, useSpring } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function Magnetic({
  children,
  strength = 0.5,
}: {
  children: ReactNode;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
  
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !ref.current) return;
    
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    
    x.set(middleX * strength);
    y.set(middleY * strength);
  };

  const handleMouseLeave = () => {
    if (prefersReducedMotion) return;
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const handleMouseEnter = () => {
    if (prefersReducedMotion) return;
    setIsHovered(true);
  };

  return (
    <m.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{
        x,
        y,
        display: "inline-flex",
        zIndex: isHovered ? 50 : 1,
      }}
    >
      {children}
    </m.div>
  );
}
