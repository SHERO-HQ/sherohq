"use client";
import { ArrowRight, Code, Shield, Zap } from "lucide-react";
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
  { label: "IT Setup & Support", icon: Shield },
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
      className="relative w-full flex flex-col items-center justify-center  py-24 overflow-hidden bg-slate-50 dark:bg-slate-950"
    >
      <HeroBackground />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col items-center">

        {/* CENTERED TEXT SECTION */}
        <div
          className="w-full max-w-4xl flex flex-col items-center gap-5 sm:gap-6 text-center"
        >
          <div className="">
            <SectionBadge icon={Code}>
              Products and Solutions
            </SectionBadge>
          </div>

          <div className="relative overflow-hidden group ">
            <h1
              className="font-bold font-sora leading-[1.1] text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] px-2 sm:px-0 tracking-tighter text-slate-900 dark:text-white relative z-10"
            >
              <span>Software and IT</span>
              <br />
              <span className="text-brand-secondary-600 dark:text-brand-secondary-400">
                Built to Scale
              </span>
            </h1>
          </div>

          <p
            className="sm:text-lg text-base text-slate-600 dark:text-slate-300/95 max-w-2xl leading-relaxed mx-auto "
          >
            Custom software and practical IT help for growing businesses.
            Support hours: Mon–Fri, 8:00 AM–6:00 PM.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-4 w-full "
          >
            <Link
              href="/consultation"
              className="group flex items-center justify-center gap-2 w-full text-sm sm:w-auto font-medium bg-brand-primary text-white hover:bg-brand-primary-600 rounded px-8 py-2 h-11 transition-all shadow-sm hover:-translate-y-0.5 active:scale-95"
            >
              <span>Let's Talk</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

         

        </div>
      </div>
    </header>
  );
};

export default SolutionsHero;
