"use client";
import { m } from "motion/react";
import { ArrowRight, Code, Shield, Zap, Server } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import HeroBackground from "@/components/common/HeroBackground";
import { SectionBadge } from "@/components/common/SectionBadge";

const heroBlock = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: [0.23, 1, 0.32, 1],
      staggerChildren: 0.08,
      delayChildren: 0.08
    }
  }
} as const;

const heroItem = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.23, 1, 0.32, 1]
    }
  }
} as const;

const features = [
  { label: "Custom Software", icon: Code },
  { label: "Cloud Solutions", icon: Server },
  { label: "Managed IT", icon: Shield },
  { label: "API Integrations", icon: Zap },
];

const SolutionsHero = () => {
  const prefersReducedMotion = useReducedMotion();
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setHeroReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <header
      className="relative w-full min-h-fit lg:min-h-dvh flex flex-col items-center justify-center pt-12 sm:pt-0 pb-16 lg:pb-0 overflow-hidden bg-slate-50 dark:bg-slate-950"
    >
      <HeroBackground />

      <div className="absolute top-0 left-0 right-0 h-36 bg-linear-to-b from-primary/8 to-transparent pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col items-center">

        {/* CENTERED TEXT SECTION */}
        <m.div
          variants={heroBlock}
          initial={prefersReducedMotion ? false : "hidden"}
          animate={
            prefersReducedMotion ? undefined : heroReady ? "show" : "hidden"
          }
          className="w-full max-w-4xl flex flex-col items-center gap-5 sm:gap-6 text-center"
        >
          <m.div variants={heroItem}>
            <SectionBadge icon={Code}>
              Technology That Scales
            </SectionBadge>
          </m.div>

          <div className="relative overflow-hidden group">
            <m.h1
              variants={heroItem}
              className="font-bold font-sora leading-[1.1] text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] px-2 sm:px-0 tracking-tighter text-slate-900 dark:text-white relative z-10"
            >
              <span>Software and IT</span>
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-secondary-600 to-brand-primary-700 dark:from-brand-secondary-400 dark:to-brand-primary-500">
                Built to Scale
              </span>
            </m.h1>
          </div>

          <m.p
            variants={heroItem}
            className="sm:text-lg text-base text-slate-600 dark:text-slate-300/95 max-w-2xl leading-relaxed mx-auto"
          >
            From high-performance custom platforms to managed enterprise
            infrastructure, we engineer systems that grow with your business.
          </m.p>

          <m.div
            variants={heroItem}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-4 w-full"
          >
            <Link
              href="/consultation"
              className="group flex items-center justify-center gap-2 w-full text-sm sm:w-auto font-medium bg-brand-primary text-white hover:bg-brand-primary-600 rounded px-8 py-2 h-11 transition-all shadow-xl shadow-brand-primary/20 hover:-translate-y-0.5"
            >
              <span>Let's Talk</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </m.div>

          {/* Features Grid below buttons */}
          <m.div
            variants={heroItem}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 lg:mt-12 w-full max-w-3xl"
          >
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row items-center justify-center gap-2 p-3 rounded bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm"
                >
                  <Icon className="size-5 text-brand-secondary-500" />
                  <span className="text-xs font-semibold uppercase tracking-tight text-slate-700 dark:text-slate-300 text-center sm:text-left">
                    {feature.label}
                  </span>
                </div>
              );
            })}
          </m.div>

        </m.div>
      </div>
    </header>
  );
};

export default SolutionsHero;
