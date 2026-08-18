"use client";
import React from "react";
import NavLink from "@/components/common/NavLink";
import { getAbsoluteUrl } from "@/utils/subdomain";
import { m, MotionValue } from "motion/react";
import { RocketIcon } from "@/assets/icons/icons";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionBadge } from "@/components/common/SectionBadge";

interface HeroContentProps {
  isMobile: boolean;
  parallaxY: MotionValue<number>;
  parallaxOpacity: MotionValue<number>;
  parallaxScale: MotionValue<number>;
  prefersReducedMotion?: boolean;
  headlineLead: string;
  headlineAccent: string;
  subHeader: string;
}

export const HeroContent = ({
  isMobile,
  parallaxY,
  parallaxOpacity,
  parallaxScale,
  headlineLead,
  headlineAccent,
  subHeader,
}: HeroContentProps) => {
  return (
    <m.div
      style={isMobile ? undefined : { y: parallaxY, opacity: parallaxOpacity, scale: parallaxScale }}
      className="w-full max-w-4xl will-change-transform"
    >
      <div className="flex flex-col items-center gap-5 sm:gap-6 text-center">
        {/* Top Badge */}
        <div>
          <SectionBadge icon={RocketIcon}>
            Trusted Technology Partner
          </SectionBadge>
        </div>

        {/* Main Headline */}
        <h1 className="font-bold leading-[1.15] text-3xl sm:text-5xl md:text-6xl px-2 sm:px-0 tracking-tighter text-slate-900 dark:text-white font-sora">
          <span>{headlineLead} </span>
          <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary-700 to-brand-secondary-600 dark:from-brand-primary-500 dark:to-brand-secondary-400">
            {headlineAccent}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="sm:text-base text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed mx-auto">
          {subHeader}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-2 sm:pt-4 w-full">
          <Button
            asChild
            variant="brandSecondary"
            size="lg"
            className="font-medium w-full text-sm sm:w-auto bg-brand-primary h-11 px-8 group transition-all hover:-translate-y-0.5 hover:bg-brand-primary-600 shadow-sm active:scale-95"
          >
            <NavLink href={getAbsoluteUrl("/shop")}>
              <span>View Products</span>
              <ShoppingCart className="w-5 h-5 ml-2" />
            </NavLink>
          </Button>

          <NavLink
            href={getAbsoluteUrl("/solutions")}
            className="group flex items-center justify-center gap-2 w-full text-sm sm:w-auto font-medium text-slate-700 dark:text-slate-200 hover:text-primary rounded px-8 py-2 h-11 transition-all glass-surface-md hover:bg-white dark:hover:bg-slate-900 hover:border-primary shadow-sm active:scale-95"
            role="button"
            aria-label="Explore solutions"
          >
            Explore Solutions
          </NavLink>
        </div>
      </div>
    </m.div>
  );
};
