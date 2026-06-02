"use client";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react";
import { ArrowRight, Code, Terminal, Database, Shield, Zap, Server } from "lucide-react";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import HeroBackground from "@/components/common/HeroBackground";

const SolutionsHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse Tracking for Interactive Visuals (tilt entire window stack slightly in 3D perspective)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-4, 4]);

  const prefersReducedMotion = useReducedMotion();
  const [heroReady, setHeroReady] = useState(false);
  const [hoveredWindow, setHoveredWindow] = useState<number | null>(null);
  const [focusedWindow, setFocusedWindow] = useState<number | null>(null);
  const [openWindows, setOpenWindows] = useState<boolean[]>([true, true, true, true]);
  const motionEnabled = heroReady && !prefersReducedMotion;

  useEffect(() => {
    const frame = requestAnimationFrame(() => setHeroReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || prefersReducedMotion) return;
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
      onClick={() => setFocusedWindow(null)}
      className="relative w-full min-h-[75dvh] sm:min-h-dvh lg:h-[80dvh] flex items-start lg:items-center pt-14 sm:pt-24 lg:pt-0 overflow-hidden bg-slate-50 dark:bg-slate-950"
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

            <h1 className="text-3xl md:text-5xl font-semibold font-sora text-slate-900 dark:text-white leading-[1.06] tracking-tighter mb-4 lg:mb-6">
              {["Software", "and", "IT", <br />, "Built", "to", "Scale"].map(
                (word, i) => (
                  <span
                    key={i}
                    className={
                      i === 0 || i === 2 ? "text-brand-secondary-500" : ""
                    }
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

            <div className="grid grid-cols-2 items-center justify-center lg:justify-start gap-3 mb-8 lg:mb-10 w-full max-w-md">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                const isActive = focusedWindow === i;
                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenWindows(prev => {
                        const next = [...prev];
                        next[i] = true;
                        return next;
                      });
                      setFocusedWindow(i);
                    }}
                    type="button"
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded text-left transition-all duration-300 shadow-xs border cursor-pointer ${
                      isActive 
                        ? 'bg-brand-secondary-500/10 border-brand-secondary-500 text-brand-secondary-700 dark:text-brand-secondary-400 ring-1 ring-brand-secondary-500/20' 
                        : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-brand-secondary-500/30'
                    }`}
                  >
                    <Icon className={`size-3.5 ${isActive ? 'text-brand-secondary-500 animate-pulse' : 'text-brand-secondary-500'}`} />
                    <span className="text-xs font-semibold uppercase tracking-tight">
                      {feature.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <Link
              href="/consultation"
              className="group w-fit flex items-center justify-center gap-6 px-6 h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded font-medium tracking-widest text-xs hover:bg-brand-secondary-600 dark:hover:bg-brand-secondary-500 dark:hover:text-white transition shadow shadow-black/20"
            >
              Let's Talk
              <ArrowRight
                size={20}
                className="group-hover:translate-x-2 transition-transform"
              />
            </Link>
          </motion.div>

          {/* Solution Visual Hub (3D perspectives, floating macOS windows, and macOS Dock) */}
          <motion.div
            initial={prefersReducedMotion ? { scale: 1, opacity: 1, rotate: 0 } : { scale: 0.9, opacity: 0, rotate: 5 }}
            animate={prefersReducedMotion ? { scale: 1, opacity: 1, rotate: 0 } : heroReady ? { scale: 1, opacity: 1, rotate: 0 } : {}}
            transition={{
              delay: 0.2,
              duration: 1.2,
              type: "spring",
              damping: 15,
            }}
            style={prefersReducedMotion ? {} : { rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative hidden md:flex items-center justify-center order-1 lg:order-2 w-full lg:w-1/2 h-[480px] sm:h-[540px]"
          >
            {/* Background Ambient Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-brand-secondary-500/4 dark:bg-brand-secondary-500/4 blur-[60px] rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-500/4 dark:bg-blue-500/4 blur-2xl rounded-full pointer-events-none translate-x-10" />

            <div className="relative w-full h-full pointer-events-auto">
              
              {/* Window 1: Custom Software */}
              <AnimatePresence>
                {openWindows[0] && (
                  <motion.div
                    key="solutions-window-software"
                    initial={prefersReducedMotion ? { opacity: 1, scale: 1, y: 0, rotate: -1 } : { opacity: 0, scale: 0.7, y: 50, rotate: -2 }}
                    animate={prefersReducedMotion ? { opacity: 1, scale: 1, y: 0, rotate: -1 } : heroReady ? { opacity: 1, scale: 1, y: 0, rotate: -1 } : {}}
                    exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.5, y: 30, rotate: -5, transition: { duration: 0.2 } }}
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
                      delay: 0.15
                    }}
                    onMouseEnter={() => setHoveredWindow(0)}
                    onMouseLeave={() => setHoveredWindow(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFocusedWindow(0);
                    }}
                    style={{ zIndex: hoveredWindow === 0 ? 50 : (focusedWindow === 0 ? 45 : 10) }}
                    className="absolute top-4 left-2 sm:left-4 w-[240px] sm:w-[270px] pointer-events-auto cursor-pointer"
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
                      className={`glass-surface-md border rounded-lg shadow-lg overflow-hidden select-none transition-all duration-300 chrome-sweep ${
                        focusedWindow === 0
                          ? "border-blue-500/50 dark:border-blue-400/50 shadow-xl opacity-100 ring-1 ring-blue-500/20 scale-[1.01]"
                          : focusedWindow !== null
                          ? "border-slate-200/40 dark:border-slate-800/40 opacity-70 scale-[0.98] blur-[0.2px]"
                          : "border-slate-200/80 dark:border-slate-700/60 shadow-lg hover:shadow-xl hover:border-blue-500/30 hover:shadow-blue-500/10 dark:hover:shadow-blue-400/5"
                      }`}
                    >
                      {/* Title Bar */}
                      <div className="flex items-center justify-between h-7 px-3 border-b border-slate-200/60 dark:border-slate-700/50 bg-slate-100/80 dark:bg-slate-900/85">
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenWindows(prev => [false, prev[1], prev[2], prev[3]]);
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
                              setOpenWindows(prev => [false, prev[1], prev[2], prev[3]]);
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
                              setFocusedWindow(0);
                            }}
                            className="h-3 w-3 rounded-full bg-[#28c840] opacity-90 hover:opacity-100 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center group/btn relative border-0 p-0 shadow-xs"
                            title="Maximize"
                            type="button"
                          >
                            <span className="absolute text-[8px] font-bold text-green-950 opacity-0 group-hover/btn:opacity-100 select-none">+</span>
                          </button>
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400">
                          custom_software.ts
                        </span>
                        <div className="w-8" />
                      </div>
                      {/* Body */}
                      <div className="p-3 bg-slate-950 font-mono text-[9.5px] text-slate-300 leading-normal border-t border-slate-900 overflow-x-auto">
                        <div className="text-slate-500">// Custom Software Engine</div>
                        <div>
                          <span className="text-purple-400">class</span> <span className="text-blue-400">SolutionsEngine</span> &#123;
                        </div>
                        <div className="pl-3">
                          <span className="text-purple-400">async</span> build() &#123;
                        </div>
                        <div className="pl-6">
                          <span className="text-purple-400">const</span> app = <span className="text-purple-400">await</span> init();
                        </div>
                        <div className="pl-6">
                          <span className="text-purple-400">return</span> &#123; status: <span className="text-emerald-400">"active"</span> &#125;;
                        </div>
                        <div className="pl-3">
                          &#125;
                        </div>
                        <div>&#125;</div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Window 2: Cloud Solutions */}
              <AnimatePresence>
                {openWindows[1] && (
                  <motion.div
                    key="solutions-window-cloud"
                    initial={prefersReducedMotion ? { opacity: 1, scale: 1, y: 0, rotate: 1 } : { opacity: 0, scale: 0.7, y: 50, rotate: 2 }}
                    animate={prefersReducedMotion ? { opacity: 1, scale: 1, y: 0, rotate: 1 } : heroReady ? { opacity: 1, scale: 1, y: 0, rotate: 1 } : {}}
                    exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.5, y: 30, rotate: 5, transition: { duration: 0.2 } }}
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
                    className="absolute top-16 right-2 sm:right-4 w-[240px] sm:w-[270px] pointer-events-auto cursor-pointer"
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
                      className={`glass-surface-md border rounded-lg shadow-lg overflow-hidden select-none transition-all duration-300 chrome-sweep ${
                        focusedWindow === 1
                          ? "border-indigo-500/50 dark:border-indigo-400/50 shadow-xl opacity-100 ring-1 ring-indigo-500/20 scale-[1.01]"
                          : focusedWindow !== null
                          ? "border-slate-200/40 dark:border-slate-800/40 opacity-70 scale-[0.98] blur-[0.2px]"
                          : "border-slate-200/80 dark:border-slate-700/60 shadow-lg hover:shadow-xl hover:border-indigo-500/30 hover:shadow-indigo-500/10 dark:hover:shadow-indigo-400/5"
                      }`}
                    >
                      {/* Title Bar */}
                      <div className="flex items-center justify-between h-7 px-3 border-b border-slate-200/60 dark:border-slate-700/50 bg-slate-100/80 dark:bg-slate-900/85">
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenWindows(prev => [prev[0], false, prev[2], prev[3]]);
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
                              setOpenWindows(prev => [prev[0], false, prev[2], prev[3]]);
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
                          cloud_infrastructure.yml
                        </span>
                        <div className="w-8" />
                      </div>
                      {/* Body */}
                      <div className="p-3 bg-slate-950/95 font-mono text-[9px] text-indigo-300 space-y-1 border-t border-slate-900">
                        <div className="text-slate-500"># Cloud Solutions Config</div>
                        <div><span className="text-amber-400">provider</span>: aws</div>
                        <div><span className="text-amber-400">region</span>: eu-west-1</div>
                        <div><span className="text-amber-400">cluster</span>:</div>
                        <div className="pl-3"><span className="text-amber-400">replicas</span>: 5</div>
                        <div className="pl-3"><span className="text-amber-400">autoscaling</span>: true</div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Window 3: Managed IT */}
              <AnimatePresence>
                {openWindows[2] && (
                  <motion.div
                    key="solutions-window-mit"
                    initial={prefersReducedMotion ? { opacity: 1, scale: 1, y: 0, rotate: -0.5 } : { opacity: 0, scale: 0.7, y: 50, rotate: -1.5 }}
                    animate={prefersReducedMotion ? { opacity: 1, scale: 1, y: 0, rotate: -0.5 } : heroReady ? { opacity: 1, scale: 1, y: 0, rotate: -0.5 } : {}}
                    exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.5, y: 30, rotate: -3, transition: { duration: 0.2 } }}
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
                    className="absolute bottom-16 left-4 sm:left-8 w-[240px] sm:w-[270px] pointer-events-auto cursor-pointer"
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
                      className={`glass-surface-md border rounded-lg shadow-lg overflow-hidden select-none transition-all duration-300 chrome-sweep ${
                        focusedWindow === 2
                          ? "border-emerald-500/50 dark:border-emerald-400/50 shadow-xl opacity-100 ring-1 ring-emerald-500/20 scale-[1.01]"
                          : focusedWindow !== null
                          ? "border-slate-200/40 dark:border-slate-800/40 opacity-70 scale-[0.98] blur-[0.2px]"
                          : "border-slate-200/80 dark:border-slate-700/60 shadow-lg hover:shadow-xl hover:border-emerald-500/30 hover:shadow-emerald-500/10 dark:hover:shadow-emerald-400/5"
                      }`}
                    >
                      {/* Title Bar */}
                      <div className="flex items-center justify-between h-7 px-3 border-b border-slate-200/60 dark:border-slate-755/50 bg-slate-100/80 dark:bg-slate-900/85">
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenWindows(prev => [prev[0], prev[1], false, prev[3]]);
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
                              setOpenWindows(prev => [prev[0], prev[1], false, prev[3]]);
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
                          managed_it_sla.json
                        </span>
                        <div className="w-8" />
                      </div>
                      {/* Body */}
                      <div className="p-3 bg-white/70 dark:bg-slate-900/80 space-y-1.5 border-t border-slate-200/40 dark:border-slate-800/40 font-mono text-[9px] text-slate-600 dark:text-slate-300">
                        <div className="text-slate-500">// Managed IT Metrics</div>
                        <div className="flex justify-between">
                          <span>sla_target:</span>
                          <span className="text-emerald-500 font-bold">"99.99%"</span>
                        </div>
                        <div className="flex justify-between">
                          <span>status:</span>
                          <span className="text-emerald-500 font-bold">"Secure"</span>
                        </div>
                        <div className="flex justify-between">
                          <span>active_backup:</span>
                          <span className="text-blue-500">"Synced"</span>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Window 4: API Integrations */}
              <AnimatePresence>
                {openWindows[3] && (
                  <motion.div
                    key="solutions-window-api"
                    initial={prefersReducedMotion ? { opacity: 1, scale: 1, y: 0, rotate: 0.5 } : { opacity: 0, scale: 0.7, y: 50, rotate: 1.5 }}
                    animate={prefersReducedMotion ? { opacity: 1, scale: 1, y: 0, rotate: 0.5 } : heroReady ? { opacity: 1, scale: 1, y: 0, rotate: 0.5 } : {}}
                    exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.5, y: 30, rotate: 3, transition: { duration: 0.2 } }}
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
                    onMouseEnter={() => setHoveredWindow(3)}
                    onMouseLeave={() => setHoveredWindow(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFocusedWindow(3);
                    }}
                    style={{ zIndex: hoveredWindow === 3 ? 50 : (focusedWindow === 3 ? 45 : 40) }}
                    className="absolute bottom-32 right-4 sm:right-8 w-[230px] sm:w-[260px] pointer-events-auto cursor-pointer"
                  >
                    <motion.div
                      animate={{
                        y: motionEnabled ? [0, -5, 0] : 0,
                        rotate: motionEnabled ? [0.5, -0.5, 0.5] : 0,
                      }}
                      transition={{
                        duration: 5.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.3
                      }}
                      className={`glass-surface-md border rounded-lg shadow-lg overflow-hidden select-none transition-all duration-300 chrome-sweep ${
                        focusedWindow === 3
                          ? "border-amber-500/50 dark:border-amber-400/50 shadow-xl opacity-100 ring-1 ring-amber-500/20 scale-[1.01]"
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
                              setOpenWindows(prev => [prev[0], prev[1], prev[2], false]);
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
                              setOpenWindows(prev => [prev[0], prev[1], prev[2], false]);
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
                              setFocusedWindow(3);
                            }}
                            className="h-3 w-3 rounded-full bg-[#28c840] opacity-90 hover:opacity-100 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center group/btn relative border-0 p-0 shadow-xs"
                            title="Maximize"
                            type="button"
                          >
                            <span className="absolute text-[8px] font-bold text-green-950 opacity-0 group-hover/btn:opacity-100 select-none">+</span>
                          </button>
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400">
                          api_integrations.py
                        </span>
                        <div className="w-8" />
                      </div>
                      {/* Body */}
                      <div className="p-3 bg-white/70 dark:bg-slate-900/80 space-y-2 border-t border-slate-200/40 dark:border-slate-800/40">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500 dark:text-slate-400">API Gateway</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">4.2ms latency</span>
                        </div>
                        
                        {/* Live CSS animated bar chart */}
                        <div className="flex items-end justify-between gap-1 h-10 pt-2 border-t border-slate-200/40 dark:border-slate-800/40">
                          <div className={`w-full bg-emerald-500/40 dark:bg-emerald-500/20 rounded-t-sm ${prefersReducedMotion ? "" : "animate-[pulse_1.2s_infinite]"}`} style={{ height: '40%' }} />
                          <div className={`w-full bg-emerald-500/60 dark:bg-emerald-500/40 rounded-t-sm ${prefersReducedMotion ? "" : "animate-[pulse_1.5s_infinite_0.2s]"}`} style={{ height: '70%' }} />
                          <div className={`w-full bg-emerald-500/80 dark:bg-emerald-500/60 rounded-t-sm ${prefersReducedMotion ? "" : "animate-[pulse_1.1s_infinite_0.4s]"}`} style={{ height: '95%' }} />
                          <div className={`w-full bg-emerald-500/70 dark:bg-emerald-500/30 rounded-t-sm ${prefersReducedMotion ? "" : "animate-[pulse_1.6s_infinite_0.1s]"}`} style={{ height: '50%' }} />
                          <div className={`w-full bg-emerald-500/90 dark:bg-emerald-500/50 rounded-t-sm ${prefersReducedMotion ? "" : "animate-[pulse_1.3s_infinite_0.3s]"}`} style={{ height: '80%' }} />
                          <div className={`w-full bg-emerald-500 dark:bg-emerald-400 rounded-t-sm ${prefersReducedMotion ? "" : "animate-[pulse_1.7s_infinite_0.5s]"}`} style={{ height: '60%' }} />
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
                <div className="glass-surface-md px-3.5 py-1.5 rounded-2xl flex items-center gap-3 border border-slate-200/40 dark:border-slate-800/80 shadow-lg bg-white/45 dark:bg-slate-900/30 backdrop-blur-md">
                  {/* Custom Software Icon */}
                  <motion.button
                    whileHover={{ scale: 1.2, y: -6 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenWindows(prev => {
                        const next = [!prev[0], prev[1], prev[2], prev[3]];
                        if (next[0]) setFocusedWindow(0);
                        return next;
                      });
                    }}
                    className="relative p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all flex flex-col items-center justify-center group cursor-pointer shadow-xs active:shadow-inner"
                    title={openWindows[0] ? "Hide Custom Software" : "Open Custom Software"}
                    type="button"
                  >
                    <Code className={`w-5 h-5 transition-colors duration-300 ${openWindows[0] ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-600'}`} />
                    <span className={`w-1.5 h-1.5 rounded-full absolute bottom-0.5 transition-all duration-300 ${openWindows[0] ? 'bg-blue-500 scale-100' : 'bg-transparent scale-0'}`} />
                    
                    {/* Tooltip */}
                    <span className="absolute -top-10 bg-slate-955/90 dark:bg-slate-905/95 text-white text-[10px] px-2 py-0.5 rounded shadow-md opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none whitespace-nowrap border border-slate-700/30 z-50 font-medium">
                      Custom Software
                    </span>
                  </motion.button>

                  {/* Cloud Solutions Icon */}
                  <motion.button
                    whileHover={{ scale: 1.2, y: -6 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenWindows(prev => {
                        const next = [prev[0], !prev[1], prev[2], prev[3]];
                        if (next[1]) setFocusedWindow(1);
                        return next;
                      });
                    }}
                    className="relative p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all flex flex-col items-center justify-center group cursor-pointer shadow-xs active:shadow-inner"
                    title={openWindows[1] ? "Hide Cloud Solutions" : "Open Cloud Solutions"}
                    type="button"
                  >
                    <Server className={`w-5 h-5 transition-colors duration-300 ${openWindows[1] ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'}`} />
                    <span className={`w-1.5 h-1.5 rounded-full absolute bottom-0.5 transition-all duration-300 ${openWindows[1] ? 'bg-indigo-500 scale-100' : 'bg-transparent scale-0'}`} />
                    
                    {/* Tooltip */}
                    <span className="absolute -top-10 bg-slate-955/90 dark:bg-slate-905/95 text-white text-[10px] px-2 py-0.5 rounded shadow-md opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none whitespace-nowrap border border-slate-700/30 z-50 font-medium">
                      Cloud Solutions
                    </span>
                  </motion.button>

                  {/* Managed IT Icon */}
                  <motion.button
                    whileHover={{ scale: 1.2, y: -6 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenWindows(prev => {
                        const next = [prev[0], prev[1], !prev[2], prev[3]];
                        if (next[2]) setFocusedWindow(2);
                        return next;
                      });
                    }}
                    className="relative p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all flex flex-col items-center justify-center group cursor-pointer shadow-xs active:shadow-inner"
                    title={openWindows[2] ? "Hide Managed IT" : "Open Managed IT"}
                    type="button"
                  >
                    <Shield className={`w-5 h-5 transition-colors duration-300 ${openWindows[2] ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'}`} />
                    <span className={`w-1.5 h-1.5 rounded-full absolute bottom-0.5 transition-all duration-300 ${openWindows[2] ? 'bg-emerald-500 scale-100' : 'bg-transparent scale-0'}`} />
                    
                    {/* Tooltip */}
                    <span className="absolute -top-10 bg-slate-955/90 dark:bg-slate-905/95 text-white text-[10px] px-2 py-0.5 rounded shadow-md opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none whitespace-nowrap border border-slate-700/30 z-50 font-medium">
                      Managed IT Support
                    </span>
                  </motion.button>

                  {/* API Integrations Icon */}
                  <motion.button
                    whileHover={{ scale: 1.2, y: -6 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenWindows(prev => {
                        const next = [prev[0], prev[1], prev[2], !prev[3]];
                        if (next[3]) setFocusedWindow(3);
                        return next;
                      });
                    }}
                    className="relative p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all flex flex-col items-center justify-center group cursor-pointer shadow-xs active:shadow-inner"
                    title={openWindows[3] ? "Hide API Integrations" : "Open API Integrations"}
                    type="button"
                  >
                    <Zap className={`w-5 h-5 transition-colors duration-300 ${openWindows[3] ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-600'}`} />
                    <span className={`w-1.5 h-1.5 rounded-full absolute bottom-0.5 transition-all duration-300 ${openWindows[3] ? 'bg-amber-500 scale-100' : 'bg-transparent scale-0'}`} />
                    
                    {/* Tooltip */}
                    <span className="absolute -top-10 bg-slate-955/90 dark:bg-slate-905/95 text-white text-[10px] px-2 py-0.5 rounded shadow-md opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none whitespace-nowrap border border-slate-700/30 z-50 font-medium">
                      API Integrations
                    </span>
                  </motion.button>
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
