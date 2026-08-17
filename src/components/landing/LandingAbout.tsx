"use client";
import Link from "next/link";
import { FadeInView, StaggerContainer, StaggerItem } from "@/components/motion/AnimateSection";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Cpu,
  Globe,
  Globe2} from "lucide-react";
import { SectionBadge } from "@/components/common/SectionBadge";
import { } from "@/components/ui/card";

const LandingAbout = () => {
  const features = [
    "Purpose-Built Ecosystems",
    "Technology that Solves Real Problems",
    "Trusted Hardware & Solution Partners",
  ];

  return (
    <section className="relative w-full py-10 lg:py-12 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Background Ambience */}
      <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-brand-secondary-600/8 to-transparent pointer-events-none" />
      <div className="absolute inset-0 pattern-grid-brand opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
          {/* LEFT COLUMN: Narrative */}
          <FadeInView direction="left" delay={0}>
            <div className="w-full space-y-6">
              <div className="space-y-4">
                <SectionBadge icon={Globe} className="mb-4">
                  Who We Are
                </SectionBadge>

                <h2 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4 leading-tight">
                  Redefining <br />
                  <span className="text-brand-secondary-600">What's Possible</span>
                </h2>

                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl transition-colors duration-300">
                  At SHERO, we believe technology is humanity's greatest enabler
                  of progress. We build software, supply reliable hardware, and 
                  manage the IT infrastructure that businesses need to create 
                  new opportunities and expand their possibilities.
                </p>
              </div>

              {/* Feature List */}
              <StaggerContainer
                as="ul"
                className="space-y-4"
                staggerDelay={0.1}
                delayChildren={0.15}
              >
                {features.map((item) => (
                  <StaggerItem key={item} xOffset={-10} yOffset={0}>
                    <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium transition-colors duration-300">
                      <CheckCircle2 className="w-5 h-5 text-brand-secondary-500" />
                      {item}
                    </li>
                  </StaggerItem>
                ))}
              </StaggerContainer>

              {/* CTA */}
              <div className="pt-2">
                <Link
                  href="/about-us"
                  className="group inline-flex items-center gap-2 text-slate-900 dark:text-white font-semibold border-b-2 border-brand-secondary-600 pb-1 hover:text-brand-secondary-700 dark:hover:text-brand-secondary-300 transition-colors"
                >
                  Discover Our Story
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </FadeInView>

          {/* RIGHT COLUMN: Tech Nexus Visualization */}
          <div className="w-full lg:w-1/2 relative h-125 flex items-center justify-center select-none">
            <div className="absolute inset-0 pattern-dots mask-radial-faded" />

            <div className="relative z-20 w-96 h-96 rounded-full flex items-center justify-center border-2 border-dashed border-brand-secondary-600/20 bg-brand-secondary-500/1">
              {/* Concentric Blueprint Rings */}
              <div className="absolute inset-6 border-2 border-dashed border-brand-secondary-600/35 rounded-full animate-[spin_60s_linear_infinite]" />
              <div className="absolute inset-12 border-2 border-dashed border-brand-secondary-500/20 rounded-full animate-[spin_40s_linear_infinite]" />

              {/* Central Pattern Centerpiece */}
              <div className="relative z-10 w-32 h-32 rounded-full flex items-center justify-center border border-brand-secondary-600/10 overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs">
                {/* Pattern as the 'Glow' */}
                <div className="absolute inset-0 pattern-dots opacity-40 dark:opacity-60 mask-radial-faded scale-150" />

                {/* The Icon itself */}
                <img
                  src="/assets/logo/shero.svg"
                  alt="SHERO"
                  width={64}
                  height={64}
                  className="relative z-20 w-16 h-16 drop-shadow-sm hover:scale-105 transition-transform duration-300"
                  suppressHydrationWarning
                />
              </div>

              {/* Sleek, High-Fidelity Purpose Driven Badge - Positioned Clear of Orbit Path (Strict Brand Palette) */}
              <div className="absolute flex items-center justify-center gap-2 -top-16 sm:-right-12 right-3 bg-white/95 dark:bg-slate-900/90 border border-brand-secondary-500/20 dark:border-brand-secondary-500/30 px-3.5 py-1.5 rounded shadow-md backdrop-blur-xs hover:scale-105 transition-transform duration-300 z-30">
                <p className="text-base font-semibold text-brand-secondary-600 dark:text-brand-secondary-400 tracking-tight font-sora leading-none">
                  Purpose
                </p>
                <p className="text-[9px] text-brand-secondary-700 dark:text-brand-secondary-300 font-mono tracking-widest uppercase font-medium">
                  Driven
                </p>
              </div>

              {/* Multi-layered Concentric Orbits: Synchronized in a resonant 45s spin cycle, cardinally aligned (Globe top, Cpu bottom, Code right) to keep them perfectly in line and clear of overlays */}
              
              {/* 1. Globe2 - Orbiting the Outermost Ring (Radius 192px, Top cardinal start) */}
              <div 
                className="absolute inset-0 z-30 pointer-events-none rounded-full"
                style={{ animation: "spin 45s linear infinite" }}
              >
                <div 
                  className="absolute top-[-16px] left-1/2 -translate-x-1/2 pointer-events-auto"
                  style={{ animation: "spin 45s linear infinite reverse" }}
                >
                  <FloatingCard
                    icon={
                      <Globe2 className="w-4.5 h-4.5 text-brand-primary-700 dark:text-brand-primary-400" />
                    }
                  />
                </div>
              </div>

              {/* 2. Cpu - Orbiting the Middle Ring (Radius 168px / inset-6, Bottom cardinal start) */}
              <div 
                className="absolute inset-6 z-30 pointer-events-none rounded-full"
                style={{ animation: "spin 45s linear infinite" }}
              >
                <div 
                  className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 pointer-events-auto"
                  style={{ animation: "spin 45s linear infinite reverse" }}
                >
                  <FloatingCard
                    icon={
                      <Cpu className="w-4.5 h-4.5 text-brand-secondary-600 dark:text-brand-secondary-400" />
                    }
                  />
                </div>
              </div>

              {/* 3. Code2 - Orbiting the Innermost Ring (Radius 144px / inset-12, Right cardinal start) */}
              <div 
                className="absolute inset-12 z-30 pointer-events-none rounded-full"
                style={{ animation: "spin 45s linear infinite" }}
              >
                <div 
                  className="absolute right-[-16px] top-1/2 -translate-y-1/2 pointer-events-auto"
                  style={{ animation: "spin 45s linear infinite reverse" }}
                >
                  <FloatingCard
                    icon={
                      <Code2 className="w-4.5 h-4.5 text-brand-primary-600 dark:text-brand-primary-300" />
                    }
                  />
                </div>
              </div>
            </div>

            {/* Abstract Background Mesh for Column */}
            <div className="absolute inset-10 pattern-grid-brand opacity-10 dark:opacity-20 mask-radial-faded rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
};

// Helper for floating cards: Lightweight Glassmorphism strictly adhering to the Brand Guide
const FloatingCard = ({
  icon}: {
  icon: React.ReactNode;
}) => (
  <div className="hover:scale-110 transition-transform duration-300">
    <div
      className="flex items-center justify-center p-2 rounded-full bg-white/95 dark:bg-slate-900/90 border border-brand-secondary-500/20 dark:border-brand-secondary-500/35 shadow-md backdrop-blur-xs hover:border-brand-primary-500/40 dark:hover:border-brand-primary-400/40 transition-all duration-300"
    >
      {icon}
    </div>
  </div>
);

export default LandingAbout;
