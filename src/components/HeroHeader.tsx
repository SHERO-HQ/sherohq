import { NavLink } from "react-router-dom";
import AnimatedText from "./motion/AnimatedText";
import * as motion from "motion/react-client";
import { fadeUp } from "../components/motion/heroMotion";
import HeroVisual from "./motion/HeroVisual";
import { useEffect, useState } from "react";

// Type Definitions
interface HeroContent {
  mainHeader: string;
  subHeader: string;
  animatedWords: readonly string[];
}

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
      className="
        relative min-h-[90vh] lg:min-h-screen w-full overflow-hidden
        bg-slate-50 dark:bg-[#020617] flex items-center
        bg-[url(/element.svg)] bg-no-repeat bg-cover bg-center
        before:content-[''] before:absolute before:inset-0 
        before:bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] 
        before:bg-[size:40px_40px] 
        before:[mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]
        pt-20 lg:pt-0
      "
      role="banner"
      aria-label="Hero section - Company mission statement"
    >
      {/* Decorative Background Glow */}
      <div
        className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-secondary/5 blur-[120px] rounded-full -z-10 hidden lg:block pointer-events-none"
        aria-hidden="true"
      />

      <div className="container lg:max-w-[85%] w-full mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-12 px-6">
        {/* TEXT CONTENT COLUMN */}
        <div className="flex flex-col gap-8 w-full z-10" role="main">
          <motion.div
            initial="hidden"
            animate="visible"
            className="w-full space-y-6"
          >
            <motion.h1
              variants={prefersReducedMotion ? {} : fadeUp}
              className="text-primary font-header font-extrabold text-4xl md:text-5xl lg:text-6xl leading-[1.1]"
            >
              {HERO_CONTENT.mainHeader} <br />
              <span className="text-secondary inline-flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-5xl md:text-6xl lg:text-7xl">
                <span className="opacity-90">Across</span>
                <AnimatedText
                  words={HERO_CONTENT.animatedWords}
                  interval={
                    prefersReducedMotion
                      ? 0
                      : ANIMATION_TIMINGS.TEXT_ROTATION_INTERVAL
                  }
                  aria-live="polite"
                  aria-atomic={true}
                />
              </span>
            </motion.h1>

            <motion.p
              variants={prefersReducedMotion ? {} : fadeUp}
              transition={{ delay: ANIMATION_TIMINGS.PARAGRAPH_DELAY }}
              className="max-w-xl text-slate-600 dark:text-slate-400 text-base lg:text-lg leading-relaxed"
            >
              {HERO_CONTENT.subHeader}
            </motion.p>
          </motion.div>

          {/* CTA SECTION */}
          <motion.div
            variants={prefersReducedMotion ? {} : fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: ANIMATION_TIMINGS.CTA_DELAY }}
            className="flex items-center"
          >
            <NavLink
              to="/explore"
              className="
                group inline-flex items-center justify-center gap-3 
                text-white bg-secondary px-8 py-4 rounded-lg 
                hover:bg-secondary/90 focus:bg-secondary/90
                transition-all duration-300 
                shadow-lg shadow-secondary/20 hover:shadow-secondary/40
                focus:shadow-secondary/40
                w-full md:w-auto font-semibold active:scale-95
                focus:outline-none focus:ring-4 focus:ring-secondary/30
              "
              aria-label="Explore our potential and services"
            >
              <span>Explore Potential</span>
              <svg
                aria-hidden="true"
                focusable="false"
                className="size-5 transform group-hover:translate-x-1 transition-transform"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                xmlns="http://www.w3.org/2000/svg"
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

        {/* VISUAL COLUMN */}
        <motion.div
          initial={
            prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 }
          }
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: prefersReducedMotion
              ? 0
              : ANIMATION_TIMINGS.VISUAL_DURATION,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative"
          aria-hidden="true"
        >
          <div className="w-full hidden lg:flex items-center justify-center p-4">
            <HeroVisual />
          </div>
        </motion.div>
      </div>
    </header>
  );
};

export default HeroHeader;
