"use client";
import UniversalLink from "@/components/common/UniversalLink";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { fadeUp } from "@/components/motion/heroMotion";
import { useRef, useState, useEffect } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import dynamic from "next/dynamic";

const ParticleField = dynamic(
  () => import("@/components/common/ParticleField"),
  { ssr: false },
);
import { RocketIcon } from "@/assets/icons/icons";
import {
  CircleCheckBig,
  Clock,
  HeartHandshake,
  Layers,
  MessageSquareDot,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Type Definitions
interface HeroContent {
  mainHeader: string;
  subHeader: string;
}

// Constants
const HERO_CONTENT: HeroContent = {
  mainHeader: "Redefine \n Possible",
  subHeader:
    "Built for efficiency, scalability, and innovation. Crafted Hardware and Software solutions to redefine the future of possibilities.",
} as const;

const LandingHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse Tracking for Kinetic Effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring physics for smooth movement
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Transform values for parallax and 3D - Subdued
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-5, 5]);
  const translateX = useTransform(smoothX, [-0.5, 0.5], [-10, 10]);
  const translateY = useTransform(smoothY, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const prefersReducedMotion = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[90vh] lg:min-h-screen w-full overflow-hidden
                 bg-slate-50 dark:bg-slate-950
                 flex items-center md:pt-26"
      role="banner"
      aria-label="Hero section - Company mission statement"
    >
      {/* KINETIC BACKGROUND LAYERS */}
      <motion.div
        style={{ x: translateX, y: translateY, opacity: 0.9 }}
        className="absolute inset-0 pattern-dots pointer-events-none"
      />

      {/* Particle Field — only after mount so server HTML is always null */}
      {mounted && <ParticleField count={8} colorVariant="single" opacity={0.2} />}

      {/* Scanning Line Effect (Horizontal) */}
      <div className="absolute inset-y-0 left-0 w-px bg-emerald-500/30 hidden md:block" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 lg:py-0">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-8">
          {/* LEFT: Content (60%) */}
          <div className="w-full lg:w-[60%] flex flex-col items-start space-y-2 text-left">
            {/* Top Badge: Mono Font */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm"
            >
              <RocketIcon className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] md:text-xs font-mono font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
                Innovation at Scale
              </span>
            </motion.div>

            {/* Headline: Sora Font + Scan line Reveal */}
            <div className="relative overflow-hidden group">
              <motion.h1
                initial="hidden"
                animate="visible"
                variants={prefersReducedMotion ? {} : fadeUp}
                className="font-sora font-extrabold leading-[1.1] text-5xl sm:text-6xl md:text-7xl lg:text-8xl 
                           text-slate-900 dark:text-white relative z-10"
              >
                {HERO_CONTENT.mainHeader.split(" ").map((word, i) =>
                  word === "\n" ? (
                    <br key={`line-br-${i}-${word}`} />
                  ) : (
                    <span
                      key={`${word}-${i}-${word}`}
                      className={
                        word === "Possible"
                          ? "text-transparent bg-clip-text bg-linear-to-r from-primary to-blue-600 dark:from-primary dark:to-blue-400"
                          : ""
                      }
                    >
                      {word}{" "}
                    </span>
                  ),
                )}
              </motion.h1>
            </div>

            {/* Subheading */}
            <motion.p
              initial="hidden"
              animate="visible"
              variants={prefersReducedMotion ? {} : fadeUp}
              transition={{ delay: 0.15 }}
              className="text-sm  text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed"
            >
              {HERO_CONTENT.subHeader}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={prefersReducedMotion ? {} : fadeUp}
              transition={{ delay: 0.25 }}
              className="flex flex-col sm:flex-row items-center gap-6 pt-4 w-full sm:w-auto"
            >
              <Button
                asChild
                variant="brand"
                size="lg"
                className="w-full sm:w-auto h-9 px-8 text-sm shadow-2xl shadow-emerald-500/20 group"
              >
                <UniversalLink to="/solutions">
                  <span>Explore Solutions</span>
                  <Layers className="w-5 h-5 transition-transform group-hover:rotate-12" />
                </UniversalLink>
              </Button>

              <UniversalLink
                to="/consultation"
                className="group flex items-center justify-center gap-3 font-mono text-sm font-bold text-primary tracking-tight border-2  hover:border-primary/50! rounded px-4 py-2 h-10 w-full border-border pb-1 transition-all"
                role="button"
                aria-label="Request a Quote"
              >
                Request a Quote
                <MessageSquareDot className="w-5 h-5 text-primary" />
              </UniversalLink>
            </motion.div>

            {/* Trust Indicators: Simplified Mono */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex flex-wrap items-center gap-5 pt-5 border-t border-slate-200 dark:border-slate-900 w-full"
            >
              <div className="flex flex-col gap-1">
                <span className="text-xs inline-flex items-center gap-1 font-sora font-bold text-slate-900 dark:text-white">
                  <Users className="w-4 h-4 text-primary" />
                  1500+
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                  Delivered
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs inline-flex items-center gap-1 font-sora font-bold text-slate-900 dark:text-white">
                  <HeartHandshake className="w-4 h-4 text-destructive" />
                  2+
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                  Partners
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs inline-flex items-center gap-1 font-sora font-bold text-slate-900 dark:text-white">
                  <Clock className="w-4 h-4 text-blue-500" />
                  4+
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                  Years Exp
                </span>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Kinetic Possibility Hub (40%) */}
          <div className="w-full lg:w-[40%] relative aspect-square flex items-center justify-center perspective-distant py-12 lg:py-0">
            {/* Parallax Container */}
            <motion.div
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              className="relative w-full max-w-md h-100 flex items-center justify-center"
            >
              {/* Layer 1: Main Capability Table */}
              <motion.div
                style={{ z: 0 }}
                className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border border-slate-200 dark:border-slate-800 rounded shadow-2xl p-4 sm:p-6 relative overflow-hidden z-10 select-none"
              >
                <div className="absolute inset-0 pattern-dots opacity-5 pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center">
                      <img
                        src="/assets/logo/shero.svg"
                        alt="SHERO"
                        width={40}
                        height={40}
                        fetchPriority="high"
                        decoding="async"
                        className="sm:w-10 sm:h-10 w-8 h-8"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-sora text-slate-900 dark:text-white">
                        Possibilities Hub
                      </h4>
                      <p className="text-[10px] font-mono text-slate-500">
                        v4.0.0_STABLE
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[9px] font-mono font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">
                      SYSTEMS_ACTIVE
                    </span>
                    <span className="text-[8px] font-mono text-slate-400">
                      LATENCY: 14ms
                    </span>
                  </div>
                </div>

                {/* Service Matrix */}
                <div className="space-y-4">
                  {[
                    {
                      service: "HARDWARE_ACCESSORIES",
                      status: "STABLE",
                      color: "bg-emerald-500",
                      desc: "High quality and performance",
                    },
                    {
                      service: "SOFTWARE_SOLUTIONS",
                      status: "OPTIMIZED",
                      color: "bg-blue-500",
                      desc: "Custom and high performance software",
                    },
                    {
                      service: "SECURITY_PROTOCOL",
                      status: "LOCKED",
                      color: "bg-blue-600",
                      desc: "Zero-Trust architecture",
                    },
                    {
                      service: "IT_TECHNICAL",
                      status: "PROCESSING",
                      color: "bg-amber-500",
                      desc: "Reliable and fast technical support",
                    },
                  ].map((item) => (
                    <div
                      key={item.service}
                      className="group flex items-start justify-between p-3 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 tracking-wider">
                          {item.service}
                        </span>
                        <span className="text-[8px] text-slate-500">
                          {item.desc}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${item.color} animate-pulse`}
                        />
                        <span className="text-[9px] font-mono font-bold text-slate-900 dark:text-white">
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Layer 2: Floating Performance Card (Extreme Front) */}
              <motion.div
                style={{
                  z: 150,
                  x: useTransform(smoothX, [-0.5, 0.5], [12, -12]),
                  y: useTransform(smoothY, [-0.5, 0.5], [12, 12]),
                  rotate: 15,
                }}
                className="absolute -bottom-10 left-3 w-32 sm:w-44 p-3 sm:p-4 rounded bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl border border-emerald-500/20 shadow z-20 select-none pointer-events-none scale-75 sm:scale-100"
              >
                <div className="text-[10px] font-mono text-slate-500 mb-1">
                  GLOBAL_REACH
                </div>
                <div className="text-2xl font-bold font-sora text-slate-900 dark:text-white mb-2">
                  99.9%
                </div>
                <div className="w-full h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "99.9%" }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="h-full bg-primary"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[8px] font-mono text-emerald-600 dark:text-emerald-400">
                    UPTIME
                  </span>
                  <span className="text-[8px] font-mono text-slate-500">
                    24/7 MONITOR
                  </span>
                </div>
              </motion.div>

              {/* Layer 3: Floating Network Badge (Extreme Front) */}
              <motion.div
                style={{
                  z: 200,
                  x: useTransform(smoothX, [-0.5, 0.5], [-5, 5]),
                  y: useTransform(smoothY, [-0.5, 0.5], [5, 5]),
                }}
                className="absolute -top-10 right-4 bg-blue-500 p-3 sm:p-4 rounded shadow-blue-500/30 shadow flex-col items-center justify-center rotate-6 z-30 select-none pointer-events-none scale-75 sm:scale-100 hidden sm:flex"
              >
                <div className="flex -space-x-2 mb-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-blue-100/30 bg-blue-500/20 backdrop-blur-sm"
                    >
                      <CircleCheckBig className="text-slate-100 w-4 h-4" />
                    </div>
                  ))}
                </div>
                <span className="text-[9px] font-bold text-white uppercase tracking-widest">
                  +12 RESOLVED
                </span>
              </motion.div>

              {/* Background Aura */}
              <div className="absolute inset-0 bg-radial-gradient from-emerald-500/5 to-transparent blur-3xl rounded-full scale-150 pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingHero;
