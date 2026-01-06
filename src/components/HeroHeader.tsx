import { NavLink } from "react-router-dom";
import { motion } from "motion/react";
import { fadeUp } from "../components/motion/heroMotion";
import { useMemo } from "react";
import { Handshake, RocketLaunchIcon } from "@/assets/icons/icons";
import { easeInOut } from "motion/react";
import { Layers, ShieldCheck } from "lucide-react";

// Type Definitions
interface HeroContent {
  mainHeader: string;
  subHeader: string;
}

type SmallText = {
  text: string;
  icon: React.ReactNode;
};

// Constants
const HERO_CONTENT: HeroContent = {
  mainHeader: "Redefine Possible",
  subHeader:
    "Innovative solutions that scale to ELEVATE people, businesses, and communities.",
} as const;

const ANIMATION_TIMINGS = {
  PARAGRAPH_DELAY: 0.15,
  CTA_DELAY: 0.25,
} as const;

const TopText: SmallText = {
  text: "Scalable Innovative Solutions",
  icon: <RocketLaunchIcon />,
};

const HeroHeader: React.FC = () => {
  // Check reduced motion once on mount
  const prefersReducedMotion = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  return (
    <header
      className="relative min-h-[85vh] lg:min-h-screen w-full overflow-hidden
                 bg-gradient-to-b from-slate-50 to-white 
                 dark:from-slate-950 dark:to-slate-900
                 flex items-center justify-center"
      role="banner"
      aria-label="Hero section - Company mission statement"
    >
      {/* Animated Grid Background */}
      <div
        className="absolute inset-0 
                    bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] 
                    bg-[size:40px_40px]
                    [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_100%)]"
      />

      {/* Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/20 dark:bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-10">
        <div className="flex flex-col justify-center items-center gap-10 w-full py-20">
          {/* Top Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            <div className="relative overflow-hidden rounded-full p-[2px] bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500">
              {/* Rotating gradient border */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background:
                    "conic-gradient(from 0deg, #10b981 0%, #0ea5e9 33%, #6366f1 66%, #10b981 100%)",
                }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              {/* Inner content */}
              <div className="relative bg-slate-50 dark:bg-slate-900 px-5 py-2.5 rounded-full">
                <div className="flex items-center gap-2.5">
                  <motion.span
                    animate={{
                      y: [0, -3, 0],
                      x: [0, 3, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: easeInOut,
                    }}
                    className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                  >
                    {TopText.icon}
                  </motion.span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {TopText.text}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            className="space-y-8 mx-auto flex flex-col items-center justify-center w-full max-w-5xl"
          >
            {/* Headline */}
            <motion.h1
              variants={prefersReducedMotion ? {} : fadeUp}
              className="text-center font-sora font-extrabold leading-tight block text-[clamp(2rem,6vw,7rem)] 
                             bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90% 
                             bg-clip-text text-transparent"
            >
              {HERO_CONTENT.mainHeader}
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={prefersReducedMotion ? {} : fadeUp}
              transition={{ delay: ANIMATION_TIMINGS.PARAGRAPH_DELAY }}
              className="text-sm md:text-xl text-slate-600 dark:text-slate-400 
                       text-center max-w-2xl leading-relaxed"
            >
              {HERO_CONTENT.subHeader}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={prefersReducedMotion ? {} : fadeUp}
              transition={{ delay: ANIMATION_TIMINGS.CTA_DELAY }}
              className="flex flex-col sm:flex-row items-center gap-4 pt-4"
            >
              <NavLink
                to="/explore"
                className="group inline-flex items-center justify-center gap-3 
                         text-white bg-emerald-600 dark:bg-emerald-500
                         px-8 py-3 rounded font-semibold text-base
                         hover:bg-emerald-700 dark:hover:bg-emerald-600
                         hover:shadow-2xl hover:shadow-emerald-500/30
                         hover:-translate-y-1
                         transition-all duration-300
                         w-full sm:w-auto"
                aria-label="Explore our potential and services"
              >
                <span>Explore Potential</span>
                <svg
                  aria-hidden="true"
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M5 12H19M19 12L13 6M19 12L13 18"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </NavLink>

              <NavLink
                to="/contact"
                className="group inline-flex items-center justify-center gap-3 
                         text-slate-700 dark:text-slate-300
                         border-2 border-slate-300 dark:border-slate-700
                         bg-transparent
                         px-8 py-3 rounded font-semibold text-base
                         hover:border-emerald-500 dark:hover:border-emerald-500
                         hover:text-emerald-600 dark:hover:text-emerald-400
                         hover:shadow-lg
                         transition-all duration-300
                         w-full sm:w-auto"
              >
                <span>Get in Touch</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </NavLink>
            </motion.div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-slate-600 dark:text-slate-400"
          >
            <div className="flex items-center gap-2">
              {/* <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> */}
              <Layers className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>1500+ Projects Delivered</span>
            </div>
            <div className="flex items-center gap-2">
              {/* <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" /> */}
              <Handshake className="w-4 h-4 text-blue-500 animate-pulse" />

              <span>3+ Partners</span>
            </div>
            <div className="flex items-center gap-2">
              {/* <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" /> */}
              <ShieldCheck className="w-4 h-4 text-indigo-500 animate-pulse" />
              <span>4+ Years Experience</span>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default HeroHeader;
