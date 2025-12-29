import { NavLink } from "react-router-dom";
import AnimatedText from "./motion/AnimatedText";
import * as motion from "motion/react-client";
import { fadeUp } from "../components/motion/heroMotion";
// import HeroVisual from "./motion/HeroVisual";
import { useEffect, useState } from "react";
import BlobImage from "./motion/BlobImage";
import { RocketLaunchIcon } from "@/assets/icons/icons";
import { easeInOut } from "motion/react";

// Type Definitions
interface HeroContent {
  mainHeader: string;
  subHeader: string;
  animatedWords: readonly string[];
}

type SmallText = {
  text: string;
  icon: React.ReactNode;
};

// Constants
const HERO_CONTENT: HeroContent = {
  mainHeader: "Redefining What's Possible",
  subHeader:
    "Solutions that empower people, businesses, and communities across technology, finance, innovation, and humanity",
  animatedWords: [
    "Technology.",
    "Finance.",
    "Investment.",
    "Education.",
    "Humanity.",
  ] as const,
} as const;

const ANIMATION_TIMINGS = {
  TEXT_ROTATION_INTERVAL: 3000,
  PARAGRAPH_DELAY: 0.2,
  CTA_DELAY: 0.3,
  VISUAL_DURATION: 1,
} as const;

const TopText: SmallText = {
  text: "Scalable Innovative Solutions",
  icon: <RocketLaunchIcon />,
};

const HeroHeader: React.FC = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return (
    <header
      className={`
    relative min-h-screen lg:min-h-screen w-full overflow-hidden
    bg-slate-200 dark:bg-[#020617]
    /* backdrop-blur-md blur-in-xl */
    flex items-center justify-center
    /* GRID */
    before:content-[''] before:absolute before:inset-0 
    before:bg-[linear-gradient(to_right,#80808012_2px,transparent_2px),linear-gradient(to_bottom,#80808012_2px,transparent_2px)] 
    before:bg-[size:40px_40px]
    before:[mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]
      `}
      role="banner"
      aria-label="Hero section - Company mission statement"
    >
      {/* BLOB IMAGE background */}
      <BlobImage />
      <div className="container lg:w-11/12 w-full mx-auto flex items-center justify-center relative z-10">
        {/* TEXT CONTENT COLUMN */}

        <div
          className="flex flex-col justify-center items-center gap-8 w-full"
          role="main"
        >
          <div className="relative group overflow-hidden rounded-full p-0.5">
            {/* Framer Motion Gradient Layer */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-full h-[800%]"
              // Positioning the oversized square so it centers correctly while spinning
              style={{
                translateX: "-50%",
                translateY: "-50%",
                background:
                  "conic-gradient(from 0deg, #10b981 10%, #0ea5e9 30%, #6366f1 90%, #10b981 100%)",
              }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'linear'
              }}
            />

            {/* Inner Content (The Mask) */}
            <div className="relative smallText text-slate-500 bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-full">
              <div className="flex items-center gap-2">
                {/* Your previous Framer Motion icon animation */}
                <motion.span
                  initial={{ y: 0, x: 0 }}
                  animate={{ y: [0, -3, 0], x: [0, 5, 0] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: easeInOut,
                  }}
                  className="size-4 rounded-full"
                >
                  {TopText.icon}
                </motion.span>
                <span className="lg:text-sm text-xs">{TopText.text}</span>
              </div>
            </div>
          </div>

          <motion.div
            initial="hidden"
            animate="visible"
            className="space-y-6 mx-auto flex flex-col items-center justify-center w-full max-w-11/12"
          >
            {/* HEADLINE */}
            <motion.h1
              variants={prefersReducedMotion ? {} : fadeUp}
              className="
            dark:text-blue-700 text-primary font-mono font-bold w-full
            text-[clamp(1.4rem,5.5vw,4rem)]
            leading-tight text-balance
            text-center
          "
            >
              {HERO_CONTENT.mainHeader}

              <br />

              <span
                className="
              text-secondary inline-flex flex-wrap items-center gap-x-4 mt-5 font-bold
              text-[clamp(1.6rem,8.3vw,5.8rem)]
              leading-tight
            "
              >
                <span className="text-center">Across</span>
                <span className="inline-block w-[10ch] text-left">
                  <AnimatedText
                    words={HERO_CONTENT.animatedWords}
                    interval={
                      prefersReducedMotion
                        ? 0
                        : ANIMATION_TIMINGS.TEXT_ROTATION_INTERVAL
                    }
                    aria-live="polite"
                    aria-atomic
                  />
                </span>
              </span>
            </motion.h1>

            {/* SUBTEXT */}
            <motion.p
              variants={prefersReducedMotion ? {} : fadeUp}
              transition={{ delay: ANIMATION_TIMINGS.PARAGRAPH_DELAY }}
              className="
            text-slate-600 dark:text-slate-400
            text-[clamp(0.9rem,2vw,1.25rem)]
            leading-relaxed md:w-11/12 lg:w-9/12 mx-auto
            text-balance text-center
          "
            >
              {HERO_CONTENT.subHeader}
            </motion.p>
          </motion.div>

          {/* CTA */}
          <motion.div
            variants={prefersReducedMotion ? {} : fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: ANIMATION_TIMINGS.CTA_DELAY }}
            className="flex items-center justify-center w-full max-w-11/12 lg:max-w-8/12 md:max-w-10/12 mx-auto"
          >
            <NavLink
              to="/explore"
              className="
            group inline-flex items-center justify-center gap-3 
            text-white text-base bg-secondary px-8 py-2 rounded 
            transition-all duration-300 
            shadow-lg shadow-secondary/20 hover:shadow-secondary/40
            hover:bg-secondary/90 focus:bg-secondary/90
            active:scale-95
            focus:outline-none focus:ring-4 focus:ring-secondary/30
            w-full md:w-auto
          
          "
              aria-label="Explore our potential and services"
            >
              <span>Explore Potential</span>
              <svg
                aria-hidden="true"
                className="size-5 transform group-hover:translate-x-1 transition-transform"
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
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default HeroHeader;
