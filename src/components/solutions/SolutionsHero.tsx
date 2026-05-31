"use client";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { ArrowRight, Zap, Shield, Server, Code } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

import HeroBackground from "@/components/common/HeroBackground";

const SolutionsHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse Tracking for Interactive Visuals (redundant with background but needed for specific 3D rotations)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-4, 4]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const features = [
    { label: "Custom Software", icon: Code },
    { label: "Cloud Solutions", icon: Server },
    { label: "Managed IT", icon: Shield },
    { label: "API Integrations", icon: Zap },
  ];

  return (
    <header
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full min-h-[75vh] sm:min-h-screen lg:h-[80vh] flex items-start lg:items-center pt-14 sm:pt-24 lg:pt-0 overflow-hidden bg-slate-50 dark:bg-slate-950"
    >
      <HeroBackground />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-8 items-center">
          {/* Solution Info */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, type: "spring", damping: 20 }}
            className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1 w-full lg:w-1/2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1 mb-4 rounded border border-brand-secondary-500/20 bg-brand-secondary-500/5 transition-colors duration-300">
              <Code className="size-4 text-brand-secondary-500" />
              <span className="text-[10px] font-semibold uppercase text-brand-secondary-600 dark:text-brand-secondary-500">
                Technology That Scales
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-sora text-slate-900 dark:text-white leading-[1.01] tracking-tighter mb-4 lg:mb-6">
              {["Software", "and", "IT", "Built", "to", "Scale"].map(
                (word, i) => (
                  <span
                    key={i}
                    className={i === 0 || i === 2 ? "text-brand-secondary-500" : ""}
                  >
                    {word}{" "}
                  </span>
                ),
              )}
            </h1>

            <p className="text-base text-slate-600 dark:text-slate-400 mb-6 lg:mb-8 max-w-2xl leading-relaxed">
              From high-performance custom platforms to managed enterprise
              infrastructure, we engineer systems that grow with your business.
            </p>

            <div className="grid grid-cols-2 items-center justify-center lg:justify-start gap-3 mb-8 lg:mb-10">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 px-4 py-2 rounded bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm transition-colors hover:border-brand-secondary-500/30"
                >
                  <feature.icon className="size-3.5 text-brand-secondary-500" />
                  <span className="text-xs font-medium uppercase tracking-tight text-slate-600 dark:text-slate-300">
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/consultation"
              className="group w-fit flex items-center justify-center gap-6 px-6 h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded font-medium tracking-widest text-xs hover:bg-brand-secondary-600 dark:hover:bg-brand-secondary-500 dark:hover:text-white transition shadow shadow-black/20"
            >
              Let's Talk
              <ArrowRight
                size={20}
                className="group-hover:translate-x-3 transition-transform"
              />
            </Link>
          </motion.div>

          {/* Solution Visual Hub */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, rotate: 5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{
              delay: 0.2,
              duration: 1.2,
              type: "spring",
              damping: 15,
            }}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative hidden md:flex items-center justify-center order-1 lg:order-2 w-full lg:w-1/2"
          >
            <div className="relative w-full aspect-square max-w-70 sm:max-w-112.5 lg:max-w-137.5 group/visual">
              {/* Background Ambient Glows */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-brand-secondary-500/5 dark:bg-brand-secondary-500/5 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-500/5 dark:bg-blue-500/5 blur-[80px] rounded-full pointer-events-none translate-x-10" />

              {/* Main Visual Card */}
              <div className="relative w-full h-full drop-shadow group-hover/visual:-translate-y-6 transition-transform duration-1000 ease-out flex items-center justify-center">
                <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 pattern-dots opacity-40" />

                  {/* Central Iconography */}
                  <div className="relative z-10 w-32 h-32 sm:w-48 sm:h-48 flex items-center justify-center">
                    <div className="absolute inset-0 bg-brand-secondary-500/20 blur-3xl rounded-full animate-pulse" />
                    <Zap className="size-full text-brand-secondary-500 drop-shadow-sm relative z-10" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default SolutionsHero;
