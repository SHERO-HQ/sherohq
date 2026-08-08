"use client";
import NavLink from "@/components/common/NavLink";
import { getAbsoluteUrl } from "@/utils/subdomain";
import { m, useMotionValue, useSpring, useTransform, useScroll } from "motion/react";
import { useRef, useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useDevicePerformance } from "@/hooks/useDevicePerformance";
import dynamic from "next/dynamic";

const ParticleField = dynamic(
  () => import("@/components/common/ParticleField"),
  { ssr: false },
);
import { RocketIcon } from "@/assets/icons/icons";
import {
  ArrowRight,
  ShoppingCart,
  Server
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Type Definitions
interface HeroContent {
  mainHeader: string;
  subHeader: string;
}

// Constants
const HERO_CONTENT: HeroContent = {
  mainHeader:
    "Software, Hardware & Technology Solutions \nfor Modern Businesses",
  subHeader:
    "We build software, deliver reliable hardware, and provide the technology services businesses need to innovate, operate, and grow."
} as const;

const PARTNERS = [
  { name: "HP", logo: "/assets/images/partners/hp.svg" },
  { name: "Dell", logo: "/assets/images/partners/dell.svg" },
  { name: "Lenovo", logo: "/assets/images/partners/lenovo.svg", logoClassName: "h-5 sm:h-8" },
  { name: "JBL", logo: "/assets/images/partners/jbl.svg" },
  { name: "Apple", logo: "/assets/images/partners/apple.svg", logoDark: "/assets/images/partners/apple-dark.svg" },
  { name: "Samsung", logo: "/assets/images/partners/samsung.svg", logoDark: "/assets/images/partners/samsung-dark.svg", logoClassName: "h-5 sm:h-7" },
  { name: "Nvidia", logo: "/assets/images/partners/nvidia.svg" },
  { name: "Intel", logo: "/assets/images/partners/intel.svg" },
];

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

const heroPanel = {
  hidden: { opacity: 0, scale: 0.985, y: 24 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.85,
      ease: [0.23, 1, 0.32, 1]
    }
  }
} as const;

const LandingHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);

  // Mouse Tracking for Kinetic Effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring physics for smooth movement
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Keep hero motion subtle for a cleaner premium feel.
  const translateX = useTransform(smoothX, [-0.5, 0.5], [-6, 6]);
  const translateY = useTransform(smoothY, [-0.5, 0.5], [-6, 6]);

  // Scroll Parallax
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 500], [0, 150]);
  const parallaxOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const parallaxScale = useTransform(scrollY, [0, 400], [1, 0.95]);

  const prefersReducedMotion = useReducedMotion();
  const { isLowEnd } = useDevicePerformance();
  const [heroReady, setHeroReady] = useState(false);

  // Disable heavy motion if the user prefers reduced motion or is on a low-end device
  // Additionally, disable scroll parallax on mobile entirely
  const [isMobile, setIsMobile] = useState(false);
  const motionEnabled = heroReady && !prefersReducedMotion && !isLowEnd;

  const [headlineLead = "", headlineAccent = ""] = HERO_CONTENT.mainHeader
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const frame = requestAnimationFrame(() => setHeroReady(true));
    return () => cancelAnimationFrame(frame);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!containerRef.current) return;
    rectRef.current = containerRef.current.getBoundingClientRect();

    const handleResize = () => {
      if (containerRef.current) {
        rectRef.current = containerRef.current.getBoundingClientRect();
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
    if (rafRef.current) return; // Skip if a frame update is already requested

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
      {/* Subtle patterned depth */}
      <m.div
        style={
          motionEnabled
            ? { x: translateX, y: translateY, opacity: 0.9 }
            : { opacity: 0.9 }
        }
        animate={motionEnabled ? { opacity: [0.85, 0.95, 0.85] } : undefined}
        transition={
          motionEnabled
            ? { duration: 12, repeat: Infinity, ease: "easeInOut" }
            : undefined
        }
        className="absolute inset-0 pattern-dots pointer-events-none will-change-transform"
      />

      {/* Particle Field — only after mount so server HTML is always null */}
      {heroReady && (
        <ParticleField count={5} colorVariant="single" opacity={0.12} animate />
      )}

      <div className="absolute top-0 left-0 right-0 h-36 bg-linear-to-b from-primary/8 to-transparent pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col items-center">

        {/* TOP SECTION: CENTERED TEXT */}
        <m.div
          style={isMobile ? undefined : { y: parallaxY, opacity: parallaxOpacity, scale: parallaxScale }}
          className="w-full max-w-4xl will-change-transform"
        >
          <m.div
            variants={heroBlock}
            initial={prefersReducedMotion ? false : "hidden"}
            animate={
              prefersReducedMotion ? undefined : heroReady ? "show" : "hidden"
            }
            className="flex flex-col items-center gap-5 sm:gap-6 text-center"
          >
            <m.div
              variants={heroItem}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded text-xs border border-brand-secondary-500/20 bg-brand-secondary-500/5 transition-colors duration-300"
            >
            <RocketIcon className="size-4 text-brand-secondary-600" />
            <span className="text-[.65rem] font-medium uppercase tracking-wide text-brand-secondary-600 dark:text-brand-secondary-400">
              Trusted Technology Partner
            </span>
          </m.div>

          {/* Headline: Sora Font + Scan line Reveal */}
          <div className="relative overflow-hidden group">
            <m.h1
              variants={heroItem}
              className="font-bold leading-[1.15] text-3xl sm:text-5xl md:text-6xl px-2 sm:px-0 tracking-tighter text-slate-900 dark:text-white relative z-10"
            >
              <span>{headlineLead} </span>
              <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary-700 to-brand-secondary-600 dark:from-brand-primary-500 dark:to-brand-secondary-400">
                {headlineAccent}
              </span>
            </m.h1>
          </div>

          <m.p
            variants={heroItem}
            className="sm:text-lg text-base text-slate-600 dark:text-slate-300/95 max-w-2xl leading-relaxed mx-auto"
          >
            {HERO_CONTENT.subHeader}
          </m.p>

          <m.div
            variants={heroItem}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-4 w-full"
          >
            <Button
              asChild
              variant="brandSecondary"
              size="lg"
              className="font-medium w-full text-sm sm:w-auto bg-brand-primary h-11 px-8 group transition-all hover:-translate-y-0.5 hover:bg-brand-primary-600 shadow-xl shadow-brand-primary/20"
            >
              <NavLink href={getAbsoluteUrl("/shop")}>
                <span>View Products</span>
                <ShoppingCart className="w-5 h-5 ml-2" />
              </NavLink>
            </Button>

            <NavLink
              href={getAbsoluteUrl("/solutions")}
              className="group flex items-center justify-center gap-2 w-full text-sm sm:w-auto font-medium text-slate-700 dark:text-slate-200 hover:text-primary rounded px-8 py-2 h-11 transition-all glass-surface-md hover:bg-white dark:hover:bg-slate-900 hover:border-primary shadow-sm"
              role="button"
              aria-label="Explore solutions"
            >
              <span>Explore Services</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </NavLink>
          </m.div>
        </m.div>
        </m.div>
      </div>

      {/* Trusted Brands Grid - Fixed at bottom of hero */}
      <m.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={prefersReducedMotion ? undefined : heroReady ? { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.5 } } : { opacity: 0, y: 10 }}
        className="absolute bottom-6 sm:bottom-15 left-0 right-0 w-full"
      >
        <div className="container max-w-7xl mx-auto px-4">
          <ul className="grid grid-cols-4 md:flex md:flex-wrap justify-center items-center gap-x-6 gap-y-6 sm:gap-x-12 w-full opacity-90 transition-opacity duration-500">
            {PARTNERS.map((partner) => (
              <li key={partner.name} className="flex justify-center items-center transition-transform duration-300 hover:scale-105" title={partner.name}>
                <img
                  src={`${partner.logo}?v=2`}
                  alt={`${partner.name} logo`}
                  className={`w-auto max-w-full object-contain filter grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300 ${partner.logoClassName ?? "h-8 sm:h-10"} ${partner.logoDark ? "dark:hidden" : ""}`}
                  loading="eager"
                />
                {partner.logoDark && (
                  <img
                    src={`${partner.logoDark}?v=2`}
                    alt={`${partner.name} logo`}
                    className={`w-auto max-w-full object-contain filter grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300 ${partner.logoClassName ?? "h-8 sm:h-10"} hidden dark:block`}
                    loading="eager"
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      </m.div>
    </header>
  );
};

export default LandingHero;
