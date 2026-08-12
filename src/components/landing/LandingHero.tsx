"use client";
import React, { useRef, useEffect, useState } from "react";
import { useMotionValue, useSpring, useTransform, useScroll } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useDevicePerformance } from "@/hooks/useDevicePerformance";

import { HeroBackground } from "./hero/HeroBackground";
import { HeroContent as HeroContentComponent } from "./hero/HeroContent";
import { PartnerGrid } from "./hero/PartnerGrid";

interface HeroContentDef {
  mainHeader: string;
  subHeader: string;
}

const HERO_CONTENT: HeroContentDef = {
  mainHeader:
    "Software, Hardware & Technology Solutions \nfor Modern Businesses",
  subHeader:
    "We build software, deliver reliable hardware, and provide the technology services businesses need to innovate, operate, and grow."
} as const;

const LandingHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 120 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const translateX = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);
  const translateY = useTransform(smoothY, [-0.5, 0.5], [-8, 8]);

  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 350], [0, -35]);
  const parallaxOpacity = useTransform(scrollY, [0, 300], [1, 0.1]);
  const parallaxScale = useTransform(scrollY, [0, 350], [1, 0.98]);

  const prefersReducedMotion = useReducedMotion();
  const { isLowEnd } = useDevicePerformance();
  const [isMobile, setIsMobile] = useState(false);

  const motionEnabled = !prefersReducedMotion && !isLowEnd;

  const [headlineLead = "", headlineAccent = ""] = HERO_CONTENT.mainHeader
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    rectRef.current = containerRef.current.getBoundingClientRect();

    const handleResize = () => {
      if (containerRef.current) {
        rectRef.current = containerRef.current.getBoundingClientRect();
        setIsMobile(window.innerWidth < 768);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!rectRef.current || !motionEnabled) return;
    if (rafRef.current) return;

    const clientX = e.clientX;
    const clientY = e.clientY;

    rafRef.current = requestAnimationFrame(() => {
      if (rectRef.current) {
        const x =
          (clientX - rectRef.current.left) / rectRef.current.width - 0.5;
        const y =
          (clientY - rectRef.current.top) / rectRef.current.height - 0.5;
        mouseX.set(x);
        mouseY.set(y);
      }
      rafRef.current = null;
    });
  };

  return (
    <header
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[85dvh] lg:min-h-[83dvh] w-full overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center pt-24 sm:pt-0 pb-48 md:pb-44 lg:pb-16"
      role="banner"
      aria-label="Hero section - Company mission statement"
    >
      <HeroBackground 
        motionEnabled={motionEnabled} 
        translateX={translateX} 
        translateY={translateY} 
      />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col items-center">
        <HeroContentComponent 
          isMobile={isMobile}
          parallaxY={parallaxY}
          parallaxOpacity={parallaxOpacity}
          parallaxScale={parallaxScale}
          prefersReducedMotion={prefersReducedMotion}
          headlineLead={headlineLead}
          headlineAccent={headlineAccent}
          subHeader={HERO_CONTENT.subHeader}
        />
      </div>

      <PartnerGrid prefersReducedMotion={prefersReducedMotion} />
    </header>
  );
};

export default LandingHero;
