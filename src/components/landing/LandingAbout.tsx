"use client";

import Link from "next/link";
import { FadeInView } from "@/components/motion/AnimateSection";
import { ArrowRight, Compass, Crosshair } from "lucide-react";
import { SectionBadge } from "@/components/common/SectionBadge";

const LandingAbout = () => {
  return (
    <section className="relative w-full py-12 lg:py-16 overflow-hidden bg-white dark:bg-slate-950 transition-colors">
      {/* Background Ambience */}
      <div className="absolute inset-0 pattern-grid-brand opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* LEFT COLUMN: Narrative on Who We Are */}
          <div className="lg:col-span-7">
            <FadeInView direction="left" delay={0}>
              <div className="space-y-6">
                <SectionBadge icon={Compass} className="mb-2">
                  Who We Are
                </SectionBadge>

                <h2 className="text-2xl sm:text-3xl font-bold font-sora text-slate-900 dark:text-slate-100 tracking-tight leading-[1.15]">
                  Redefine{" "}
                  <span className="text-brand-secondary-600 dark:text-brand-secondary-400">
                    Possible
                  </span>
                </h2>

                <div className="space-y-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl transition-colors">
                  <p>
                    SHERO believes technology is humanity&apos;s greatest enabler
                    of progress. We observe, analyze and create solutions that
                    empower people, businesses and communities to expand their possibilities.
                  </p>
                  <p>
                    Our focus is on solutions that are accessible,
                    and grounded in the everyday needs of people and local enterprises.
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    href="/about-us"
                    className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white hover:text-brand-secondary-600 dark:hover:text-brand-secondary-400 transition-colors"
                  >
                    <span>Discover our story</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </FadeInView>
          </div>

          {/* RIGHT COLUMN: Clean Architectural Emblem (Zero Spin, Technical Precision) */}
          <div className="lg:col-span-5 w-full relative h-96 sm:h-110 flex items-center justify-center select-none">
            <FadeInView direction="right" delay={0.1}>
              <div className="relative w-72 h-72 sm:w-88 sm:h-88 flex items-center justify-center">
                {/* Background Ambience Dots */}
                <div className="absolute inset-0 pattern-dots mask-radial-faded opacity-35 dark:opacity-45 pointer-events-none" />

                {/* SVG Precision Technical Blueprint Rings & Cardinal Markers */}
                <svg
                  className="absolute inset-0 w-full h-full text-slate-300 dark:text-slate-800 pointer-events-none"
                  viewBox="0 0 352 352"
                  fill="none"
                >
                  {/* Outer Fine Ring */}
                  <circle
                    cx="176"
                    cy="176"
                    r="160"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="opacity-60 dark:opacity-40"
                  />
                  {/* Dashed Mid Ring */}
                  <circle
                    cx="176"
                    cy="176"
                    r="128"
                    stroke="#05735a"
                    strokeWidth="1"
                    strokeDasharray="4 6"
                    className="opacity-30 dark:opacity-40"
                  />
                  {/* Inner Fine Ring */}
                  <circle
                    cx="176"
                    cy="176"
                    r="96"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="opacity-40 dark:opacity-30"
                  />

                  {/* Cardinal Compass Ticks (Top, Bottom, Left, Right) */}
                  <line x1="176" y1="8" x2="176" y2="24" stroke="currentColor" strokeWidth="1.5" className="opacity-70 dark:opacity-60" />
                  <line x1="176" y1="328" x2="176" y2="344" stroke="currentColor" strokeWidth="1.5" className="opacity-70 dark:opacity-60" />
                  <line x1="8" y1="176" x2="24" y2="176" stroke="currentColor" strokeWidth="1.5" className="opacity-70 dark:opacity-60" />
                  <line x1="328" y1="176" x2="344" y2="176" stroke="currentColor" strokeWidth="1.5" className="opacity-70 dark:opacity-60" />

                  {/* Corner Accent Dots */}
                  <circle cx="63" cy="63" r="2" fill="currentColor" className="opacity-50 dark:opacity-40" />
                  <circle cx="289" cy="63" r="2" fill="currentColor" className="opacity-50 dark:opacity-40" />
                  <circle cx="63" cy="289" r="2" fill="currentColor" className="opacity-50 dark:opacity-40" />
                  <circle cx="289" cy="289" r="2" fill="currentColor" className="opacity-50 dark:opacity-40" />
                </svg>

                {/* Central Nucleus: Glassmorphic Frame with SHERO Emblem */}
                <div className="relative z-10 w-18 h-18 rounded-full flex flex-col items-center justify-center bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 shadow-md backdrop-blur-xs group hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-secondary-500/5 via-transparent to-brand-primary-500/5 rounded-2xl pointer-events-none" />

                  <img
                    src="/assets/logo/shero.svg"
                    alt="SHERO"
                    width={26}
                    height={26}
                    className="relative z-20 w-13 h-13 sm:w-14 sm:h-14 drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
                    suppressHydrationWarning
                  />
                </div>

                {/* Grounded Purpose-Driven Pill Badge */}
                <div className="absolute -top-3 right-4 sm:right-6 z-20 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 shadow-xs backdrop-blur-xs">
                  <Crosshair className="w-4 h-4 rounded-full text-brand-secondary-500" />
                  <span className="text-xs font-semibold text-brand-secondary-600 dark:text-brand-secondary-400 font-sora">
                    Purpose Driven
                  </span>
                </div>
              </div>
            </FadeInView>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingAbout;
