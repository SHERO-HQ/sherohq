"use client";
import NavLink from "@/components/common/NavLink";
import { getAbsoluteUrl } from "@/utils/subdomain";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef, useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import dynamic from "next/dynamic";

const ParticleField = dynamic(
  () => import("@/components/common/ParticleField"),
  { ssr: false },
);
import { RocketIcon } from "@/assets/icons/icons";
import {
  ArrowRight,
  ShoppingCart,
  Verified,
  Laptop,
  Gem,
  Plus,
  Eye,
  Server,
  Shield,
  Activity,
  Star,
  Sparkles,
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
    "Hardware, Software, and Managed IT Support \n for Your Business.",
  subHeader:
    "We supply premium hardware, engineer custom software, and manage your entire IT ecosystem under one dependable partner.",
} as const;

const heroBlock = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: [0.23, 1, 0.32, 1],
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
} as const;

const heroItem = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.23, 1, 0.32, 1],
    },
  },
} as const;

const heroPanel = {
  hidden: { opacity: 0, scale: 0.985, y: 18 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.85,
      ease: [0.23, 1, 0.32, 1],
    },
  },
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

  const prefersReducedMotion = useReducedMotion();
  const [heroReady, setHeroReady] = useState(false);
  const [hoveredWindow, setHoveredWindow] = useState<number | null>(null);
  const [focusedWindow, setFocusedWindow] = useState<number | null>(null);
  const [openWindows, setOpenWindows] = useState<boolean[]>([true, true, true]);
  const motionEnabled = heroReady && !prefersReducedMotion;

  const [headlineLead = "", headlineAccent = ""] = HERO_CONTENT.mainHeader
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  useEffect(() => {
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
      onClick={() => setFocusedWindow(null)}
      className="relative min-h-[80dvh] lg:min-h-dvh w-full overflow-hidden
 bg-slate-50 dark:bg-slate-950
 flex items-center"
      role="banner"
      aria-label="Hero section - Company mission statement"
    >
      {/* Subtle patterned depth */}
      <motion.div
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
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-8">
          <motion.div
            variants={heroBlock}
            initial={prefersReducedMotion ? false : "hidden"}
            animate={
              prefersReducedMotion ? undefined : heroReady ? "show" : "hidden"
            }
            className="w-full lg:w-[56%] flex flex-col items-center lg:items-start gap-4 sm:gap-5 text-center lg:text-left"
          >
            <motion.div
              variants={heroItem}
              className="inline-flex items-center gap-2 px-4 py-1 rounded border border-brand-secondary-500/20 bg-brand-secondary-500/5 transition-colors duration-300"
            >
              <RocketIcon className="size-4 text-brand-secondary-500" />
              <span className="text-xs font-semibold uppercase text-brand-secondary-600 dark:text-brand-secondary-400">
                Trusted Technology Partner
              </span>
            </motion.div>

            {/* Headline: Sora Font + Scan line Reveal */}
            <div className="relative overflow-hidden group max-w-3xl">
              <motion.h1
                variants={heroItem}
                className="font-bold leading-[1.01] text-4xl sm:text-5xl md:text-6xl px-2 sm:px-auto tracking-tighter text-slate-900 dark:text-white relative z-10"
              >
                <span>{headlineLead}</span>
                <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary-700 to-brand-secondary-600 dark:from-brand-primary-500 dark:to-brand-secondary-400">
                  {headlineAccent}
                </span>
              </motion.h1>
            </div>

            <motion.p
              variants={heroItem}
              className="sm:text-base text-sm text-slate-600 dark:text-slate-300/95 max-w-xl leading-relaxed"
            >
              {HERO_CONTENT.subHeader}
            </motion.p>

            <motion.div
              variants={heroItem}
              className="flex flex-row items-center gap-2 sm:gap-4 pt-1 w-fit sm:w-auto mb-14 sm:mb-0"
            >
              <Button
                asChild
                variant="brandSecondary"
                size="default"
                className="sm:text-sm font-medium bg-brand-primary w-fit sm:w-auto h-9 px-6 group transition-all hover:-translate-y-0.5 hover:bg-brand-primary-600"
              >
                <NavLink href={getAbsoluteUrl("/shop")}>
                  <span className="text-sm">Products</span>
                  <ShoppingCart className="w-5 h-5" />
                </NavLink>
              </Button>

              <NavLink
                href={getAbsoluteUrl("/solutions")}
                className="group flex items-center justify-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-primary rounded px-8 py-2 h-9 w-fit transition-all glass-surface-md hover:bg-white dark:hover:bg-slate-900 hover:border-primary"
                role="button"
                aria-label="Explore solutions"
              >
                <span>Explore</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </NavLink>
            </motion.div>

            {/* <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.5, duration: 0.8 }}
 className="w-full pt-6 border-t border-slate-200 dark:border-slate-800"
 >
  ...
 </motion.div> */}
          </motion.div>

          <div className="hidden w-full lg:w-[46%] relative h-[480px] sm:h-[540px] sm:flex items-center justify-center lg:py-0 mb-16 sm:mb-0">
            <motion.div
              variants={heroPanel}
              initial={prefersReducedMotion ? false : "hidden"}
              animate={
                prefersReducedMotion ? undefined : heroReady ? "show" : "hidden"
              }
              style={
                motionEnabled ? { x: translateX, y: translateY } : undefined
              }
              className="relative w-full h-full pointer-events-auto"
            >
              {/* Window 1: HP EliteBook (Hardware) */}
              <AnimatePresence>
                {openWindows[0] && (
                  <motion.div
                    key="window-hardware"
                    initial={{ opacity: 0, scale: 0.7, y: 50, rotate: -2 }}
                    animate={heroReady ? { opacity: 1, scale: 1, y: 0, rotate: -1 } : {}}
                    exit={{ opacity: 0, scale: 0.5, y: 30, rotate: -5, transition: { duration: 0.2 } }}
                    whileHover={motionEnabled ? {
                      scale: 1.04,
                      y: -8,
                      rotate: 0,
                      transition: { type: "spring", stiffness: 300, damping: 20 }
                    } : undefined}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 15,
                      delay: 0.15
                    }}
                    onMouseEnter={() => setHoveredWindow(0)}
                    onMouseLeave={() => setHoveredWindow(null)}
                    style={{ zIndex: hoveredWindow === 0 ? 50 : 10 }}
                    className="absolute top-4 left-2 sm:left-4 w-[270px] sm:w-[300px] pointer-events-auto cursor-pointer"
                  >
                    <motion.div
                      animate={{
                        y: motionEnabled ? [0, -6, 0] : 0,
                        rotate: motionEnabled ? [-0.5, 0.5, -0.5] : 0,
                      }}
                      transition={{
                        duration: 5.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="glass-surface-md border border-slate-200/80 dark:border-slate-700/60 rounded-lg shadow-lg overflow-hidden select-none transition-all duration-300 hover:shadow-xl hover:border-blue-500/30 hover:shadow-blue-500/10 dark:hover:shadow-blue-400/5 chrome-sweep"
                    >
                      {/* Title Bar */}
                      <div className="flex items-center justify-between h-7 px-3 border-b border-slate-200/60 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/85">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenWindows(prev => [false, prev[1], prev[2]]);
                            }}
                            className="h-2.5 w-2.5 rounded-full bg-[#ff5f57] opacity-80 hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center group/btn relative border-0 p-0"
                            title="Close"
                            type="button"
                          >
                            <span className="absolute text-[8px] font-bold text-red-950 opacity-0 group-hover/btn:opacity-100 select-none">×</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenWindows(prev => [false, prev[1], prev[2]]);
                            }}
                            className="h-2.5 w-2.5 rounded-full bg-[#febc2e] opacity-80 hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center group/btn relative border-0 p-0"
                            title="Minimize"
                            type="button"
                          >
                            <span className="absolute text-[8px] font-bold text-amber-950 opacity-0 group-hover/btn:opacity-100 select-none">-</span>
                          </button>
                          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840] opacity-80" />
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400">
                          hardware_catalog.dmg
                        </span>
                        <div className="w-8" />
                      </div>
                      {/* Body */}
                      <div className="p-3.5 space-y-3 bg-white/70 dark:bg-slate-900/80">
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 w-11 h-11 rounded-md overflow-hidden bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center shadow-xs relative">
                            <img
                              src="/assets/images/laptop_showcase.png"
                              alt="HP EliteBook 1040 G10"
                              className="w-full h-full object-contain p-1"
                            />
                            <span className="absolute -top-1 -right-1 flex h-3 px-1 items-center justify-center rounded bg-brand-primary text-[6px] font-bold text-white uppercase tracking-wider">
                              HOT
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h5 className="text-[12px] font-semibold text-slate-900 dark:text-white truncate">
                                HP EliteBook 1040
                              </h5>
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-amber-500">
                                <Star className="w-2 h-2 fill-amber-500 stroke-amber-500" />
                                4.9
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              <span>In Stock</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/40 dark:border-slate-800/40">
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                              GH₵5,500
                            </span>
                            <span className="text-[8px] font-semibold text-brand-secondary-600 dark:text-brand-secondary-400 bg-brand-secondary-500/10 px-1 py-0.5 rounded-full">
                              -5%
                            </span>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-blue-600 dark:text-blue-400 p-1 rounded-md hover:bg-blue-500/10 transition-colors"
                            type="button"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Window 2: SmartBoutique POS (Software) */}
              <AnimatePresence>
                {openWindows[1] && (
                  <motion.div
                    key="window-software"
                    initial={{ opacity: 0, scale: 0.7, y: 50, rotate: 2 }}
                    animate={heroReady ? { opacity: 1, scale: 1, y: 0, rotate: 1 } : {}}
                    exit={{ opacity: 0, scale: 0.5, y: 30, rotate: 5, transition: { duration: 0.2 } }}
                    whileHover={motionEnabled ? {
                      scale: 1.04,
                      y: -8,
                      rotate: 0,
                      transition: { type: "spring", stiffness: 300, damping: 20 }
                    } : undefined}
                    whileTap={motionEnabled ? { scale: 0.99 } : undefined}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 15,
                      delay: 0.3
                    }}
                    onMouseEnter={() => setHoveredWindow(1)}
                    onMouseLeave={() => setHoveredWindow(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFocusedWindow(1);
                    }}
                    style={{ zIndex: hoveredWindow === 1 ? 50 : (focusedWindow === 1 ? 45 : 20) }}
                    className="absolute top-32 right-2 sm:right-4 w-[250px] sm:w-[280px] pointer-events-auto cursor-pointer"
                  >
                    <motion.div
                      animate={{
                        y: motionEnabled ? [0, -8, 0] : 0,
                        x: motionEnabled ? [0, 3, 0] : 0,
                      }}
                      transition={{
                        duration: 6.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.2
                      }}
                      className={`glass-surface-md border rounded-lg shadow-lg overflow-hidden select-none transition-all duration-300 chrome-sweep ${focusedWindow === 1
                          ? "border-indigo-500/50 dark:border-indigo-400/50 shadow-xl opacity-100 ring-1 ring-indigo-500/20 scale-[1.01]"
                          : focusedWindow !== null
                            ? "border-slate-200/40 dark:border-slate-800/40 opacity-70 scale-[0.98] blur-[0.2px]"
                            : "border-slate-200/80 dark:border-slate-700/60 shadow-lg hover:shadow-xl hover:border-indigo-500/30 hover:shadow-indigo-500/10 dark:hover:shadow-indigo-400/5"
                        }`}
                    >
                      {/* Title Bar */}
                      <div className="flex items-center justify-between h-7 px-3 border-b border-slate-200/60 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/85">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenWindows(prev => [prev[0], false, prev[2]]);
                            }}
                            className="h-3 w-3 rounded-full bg-[#ff5f57] opacity-90 hover:opacity-100 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center group/btn relative border-0 p-0 shadow-xs"
                            title="Close"
                            type="button"
                          >
                            <span className="absolute text-[9px] font-bold text-red-950 opacity-0 group-hover/btn:opacity-100 select-none">×</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenWindows(prev => [prev[0], false, prev[2]]);
                            }}
                            className="h-3 w-3 rounded-full bg-[#febc2e] opacity-90 hover:opacity-100 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center group/btn relative border-0 p-0 shadow-xs"
                            title="Minimize"
                            type="button"
                          >
                            <span className="absolute text-[9px] font-bold text-amber-950 opacity-0 group-hover/btn:opacity-100 select-none">-</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFocusedWindow(1);
                            }}
                            className="h-3 w-3 rounded-full bg-[#28c840] opacity-90 hover:opacity-100 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center group/btn relative border-0 p-0 shadow-xs"
                            title="Maximize"
                            type="button"
                          >
                            <span className="absolute text-[8px] font-bold text-green-950 opacity-0 group-hover/btn:opacity-100 select-none">+</span>
                          </button>
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400">
                          smartboutique_pos
                        </span>
                        <div className="w-8" />
                      </div>
                      {/* Body */}
                      <div className="p-3.5 space-y-2.5 bg-white/70 dark:bg-slate-900/80">
                        <div className="flex items-start gap-2.5">
                          <div className="shrink-0 w-10 h-10 rounded-md bg-blue-500/10 dark:bg-blue-900/30 flex items-center justify-center border border-blue-500/15 dark:border-blue-900/30 relative">
                            <Gem className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span className="absolute -top-1 -right-1 flex h-3 px-1 items-center justify-center rounded bg-blue-600 text-[6px] font-bold text-white uppercase tracking-wider">
                              NEW
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h5 className="text-[12px] font-semibold text-slate-900 dark:text-white truncate">
                                SmartBoutique POS
                              </h5>
                              <span className="text-[8px] font-mono text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-950/40 px-1 py-0.5 rounded">
                                v2.1
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              Multi-branch retail software
                            </p>
                          </div>
                        </div>
                        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-200/40 dark:border-slate-800/40 pt-2.5">
                          Real-time stock syncing and secure Mobile Money checkout.
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Window 3: Managed IT Support (Support) */}
              <AnimatePresence>
                {openWindows[2] && (
                  <motion.div
                    key="window-support"
                    initial={{ opacity: 0, scale: 0.7, y: 50, rotate: -1.5 }}
                    animate={heroReady ? { opacity: 1, scale: 1, y: 0, rotate: -0.5 } : {}}
                    exit={{ opacity: 0, scale: 0.5, y: 30, rotate: -3, transition: { duration: 0.2 } }}
                    whileHover={motionEnabled ? {
                      scale: 1.04,
                      y: -8,
                      rotate: 0,
                      transition: { type: "spring", stiffness: 300, damping: 20 }
                    } : undefined}
                    whileTap={motionEnabled ? { scale: 0.99 } : undefined}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 15,
                      delay: 0.45
                    }}
                    onMouseEnter={() => setHoveredWindow(2)}
                    onMouseLeave={() => setHoveredWindow(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFocusedWindow(2);
                    }}
                    style={{ zIndex: hoveredWindow === 2 ? 50 : (focusedWindow === 2 ? 45 : 30) }}
                    className="absolute bottom-12 sm:bottom-16 left-4 sm:left-12 w-[250px] sm:w-[280px] pointer-events-auto cursor-pointer"
                  >
                    <motion.div
                      animate={{
                        y: motionEnabled ? [0, -5, 0] : 0,
                        rotate: motionEnabled ? [0, 1, 0] : 0,
                      }}
                      transition={{
                        duration: 4.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.4
                      }}
                      className={`glass-surface-md border rounded-lg shadow-lg overflow-hidden select-none transition-all duration-300 chrome-sweep ${focusedWindow === 2
                          ? "border-emerald-500/50 dark:border-emerald-400/50 shadow-xl opacity-100 ring-1 ring-emerald-500/20 scale-[1.01]"
                          : focusedWindow !== null
                            ? "border-slate-200/40 dark:border-slate-800/40 opacity-70 scale-[0.98] blur-[0.2px]"
                            : "border-slate-200/80 dark:border-slate-700/60 shadow-lg hover:shadow-xl hover:border-emerald-500/30 hover:shadow-emerald-500/10 dark:hover:shadow-emerald-400/5"
                        }`}
                    >
                      {/* Title Bar */}
                      <div className="flex items-center justify-between h-7 px-3 border-b border-slate-200/60 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/85">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenWindows(prev => [prev[0], prev[1], false]);
                            }}
                            className="h-3 w-3 rounded-full bg-[#ff5f57] opacity-90 hover:opacity-100 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center group/btn relative border-0 p-0 shadow-xs"
                            title="Close"
                            type="button"
                          >
                            <span className="absolute text-[9px] font-bold text-red-950 opacity-0 group-hover/btn:opacity-100 select-none">×</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenWindows(prev => [prev[0], prev[1], false]);
                            }}
                            className="h-3 w-3 rounded-full bg-[#febc2e] opacity-90 hover:opacity-100 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center group/btn relative border-0 p-0 shadow-xs"
                            title="Minimize"
                            type="button"
                          >
                            <span className="absolute text-[9px] font-bold text-amber-950 opacity-0 group-hover/btn:opacity-100 select-none">-</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFocusedWindow(2);
                            }}
                            className="h-3 w-3 rounded-full bg-[#28c840] opacity-90 hover:opacity-100 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center group/btn relative border-0 p-0 shadow-xs"
                            title="Maximize"
                            type="button"
                          >
                            <span className="absolute text-[8px] font-bold text-green-950 opacity-0 group-hover/btn:opacity-100 select-none">+</span>
                          </button>
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400">
                          active_sla_monitor
                        </span>
                        <div className="w-8" />
                      </div>
                      {/* Body */}
                      <div className="p-3.5 space-y-2.5 bg-white/70 dark:bg-slate-900/80">
                        <div className="flex items-start gap-2.5">
                          <div className="shrink-0 w-10 h-10 rounded-md bg-emerald-500/10 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-500/15 dark:border-emerald-900/30 relative">
                            <Server className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <span className="absolute -top-1 -right-1 flex h-3 px-1 items-center justify-center rounded bg-emerald-600 text-[7px] font-bold text-white uppercase tracking-wider">
                              24/7
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h5 className="text-[12px] font-semibold text-slate-900 dark:text-white truncate">
                                Managed IT SLA
                              </h5>
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                                <span className="h-1 w-1 rounded-full bg-emerald-500 animate-ping" />
                                Live
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              Enterprise Infrastructure
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/40 dark:border-slate-800/40 text-[10px] text-slate-500 dark:text-slate-400">
                          <span className="font-mono">Uptime: 99.99%</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400">SLA: &lt;15m</span>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* macOS Dock */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 z-40"
              >
                <div className="glass-surface-md px-3.5 py-1.5 rounded flex items-center gap-3 border border-slate-200/40 dark:border-slate-800/80 shadow-lg bg-white/45 dark:bg-slate-900/30 backdrop-blur-md">
                  {/* Hardware Icon */}
                  <motion.button
                    whileHover={{ scale: 1.2, y: -6 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenWindows(prev => {
                        const next = [!prev[0], prev[1], prev[2]];
                        if (next[0]) setFocusedWindow(0);
                        return next;
                      });
                    }}
                    className="relative p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all flex flex-col items-center justify-center group cursor-pointer shadow-xs active:shadow-inner"
                    title={openWindows[0] ? "Hide Hardware Catalog" : "Open Hardware Catalog"}
                    type="button"
                  >
                    <Laptop className={`w-5 h-5 transition-colors duration-300 ${openWindows[0] ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-600'}`} />
                    <span className={`w-1.5 h-1.5 rounded-full absolute bottom-0.5 transition-all duration-300 ${openWindows[0] ? 'bg-blue-500 scale-100' : 'bg-transparent scale-0'}`} />

                    {/* Tooltip */}
                    <span className="absolute -top-10 bg-slate-950/90 dark:bg-slate-905/95 text-white text-[10px] px-2 py-0.5 rounded shadow-md opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none whitespace-nowrap border border-slate-700/30 z-50 font-medium">
                      Hardware Catalog
                    </span>
                  </motion.button>

                  {/* Software Icon */}
                  <motion.button
                    whileHover={{ scale: 1.2, y: -6 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenWindows(prev => {
                        const next = [prev[0], !prev[1], prev[2]];
                        if (next[1]) setFocusedWindow(1);
                        return next;
                      });
                    }}
                    className="relative p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all flex flex-col items-center justify-center group cursor-pointer shadow-xs active:shadow-inner"
                    title={openWindows[1] ? "Hide SmartBoutique POS" : "Open SmartBoutique POS"}
                    type="button"
                  >
                    <Gem className={`w-5 h-5 transition-colors duration-300 ${openWindows[1] ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'}`} />
                    <span className={`w-1.5 h-1.5 rounded-full absolute bottom-0.5 transition-all duration-300 ${openWindows[1] ? 'bg-indigo-500 scale-100' : 'bg-transparent scale-0'}`} />

                    {/* Tooltip */}
                    <span className="absolute -top-10 bg-slate-950/90 dark:bg-slate-905/95 text-white text-[10px] px-2 py-0.5 rounded shadow-md opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none whitespace-nowrap border border-slate-700/30 z-50 font-medium">
                      SmartBoutique POS
                    </span>
                  </motion.button>

                  {/* Support Icon */}
                  <motion.button
                    whileHover={{ scale: 1.2, y: -6 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenWindows(prev => {
                        const next = [prev[0], prev[1], !prev[2]];
                        if (next[2]) setFocusedWindow(2);
                        return next;
                      });
                    }}
                    className="relative p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all flex flex-col items-center justify-center group cursor-pointer shadow-xs active:shadow-inner"
                    title={openWindows[2] ? "Hide Managed IT Support" : "Open Managed IT Support"}
                    type="button"
                  >
                    <Server className={`w-5 h-5 transition-colors duration-300 ${openWindows[2] ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'}`} />
                    <span className={`w-1.5 h-1.5 rounded-full absolute bottom-0.5 transition-all duration-300 ${openWindows[2] ? 'bg-emerald-500 scale-100' : 'bg-transparent scale-0'}`} />

                    {/* Tooltip */}
                    <span className="absolute -top-10 bg-slate-950/90 dark:bg-slate-905/95 text-white text-[10px] px-2 py-0.5 rounded shadow-md opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none whitespace-nowrap border border-slate-700/30 z-50 font-medium">
                      Managed IT Support
                    </span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingHero;
