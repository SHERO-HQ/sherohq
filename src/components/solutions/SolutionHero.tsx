"use client";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import {
  Code,
  Zap,
  Shield,
  ArrowRight,
  Server,
  Globe,
  Cpu,
  Database,
} from "lucide-react";
import { useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMounted } from "@/hooks/useIsMounted";
import dynamic from "next/dynamic";

const ParticleField = dynamic(
  () => import("@/components/common/ParticleField"),
  { ssr: false },
);

const SolutionsHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse Tracking for Kinetic Effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring physics
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Parallax transforms - Subdued for professional feel
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

  const prefersReducedMotion = useReducedMotion();
  const mounted = useIsMounted();

  return (
    <header
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full min-h-[90vh] lg:min-h-screen flex items-center py-20 lg:py-24 overflow-hidden
                 bg-slate-50 dark:bg-slate-950"
      role="banner"
    >
      {/* KINETIC BACKGROUND LAYERS */}
      <motion.div
        style={{ x: translateX, y: translateY, opacity: 0.6 }}
        className="absolute inset-0 pattern-dots pointer-events-none"
      />

      {/* Particle Field — ssr:false ensures Math.random() never runs on server */}
      {mounted && (
        <ParticleField count={12} colorVariant="dual" opacity={0.3} />
      )}

      {/* Scanning Line Effect */}
      <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500/20 hidden md:block" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-8">
          {/* LEFT: Content (60%) */}
          <div className="w-full lg:w-[60%] flex flex-col items-start space-y-2">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm mb-4"
            >
              <Code className="size-4 text-emerald-500" />
              <span className="text-[10px] md:text-xs font-mono font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
                Software & IT Solutions
              </span>
            </motion.div>

            {/* Main Heading */}
            <div className="relative">
              <motion.h1
                initial={
                  prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 30 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 0.8, ease: "easeOut" }
                }
                className="font-sora font-extrabold leading-[1.1] text-5xl md:text-5xl lg:text-6xl 
                           text-slate-900 dark:text-white sm:mb-3"
              >
                Performance{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400">
                  Driven
                </span>
              </motion.h1>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm md:text-base text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-xl"
            >
              Bridging the gap between digital strategy and physical
              infrastructure.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center gap-6"
            >
              <a
                href="/consultation"
                className="inline-flex items-center justify-center gap-3 px-10 py-2 rounded
                         bg-emerald-600 text-white font-bold
                         hover:bg-emerald-700 hover:shadow-2xl hover:shadow-emerald-700
                         hover:-translate-y-1 transition-all duration-300
                         w-full sm:w-auto text-sm uppercase tracking-wid"
                role="button"
                aria-label="Request a Quote"
              >
                <span>Request a Quote</span>
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#services"
                className="group flex items-center justify-center gap-3 text-foreground font-bold tracking-tight border-2 border-border hover:border-emerald-600/50! rounded px-8 py-2 w-full sm:w-auto transition-all text-sm uppercase"
                role="button"
                aria-label="Explore Services"
              >
                Explore Services
                <Zap className="w-5 h-5 text-emerald-600 group-hover:rotate-12 transition-transform" />
              </a>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-8 mt-16 pt-6 border-t border-slate-200 dark:border-slate-800 w-full"
            >
              {[
                { label: "ULTRA_FAST", sub: "Service Delivery", icon: Zap },
                {
                  label: "SECURE_BY_DESIGN",
                  sub: "Zero-Trust Ready",
                  icon: Shield,
                },
                {
                  label: "MODERN_STACK",
                  sub: "Edge Implementation",
                  icon: Code,
                },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                    <item.icon className="w-4 h-4" />
                    <span className="text-xs font-bold font-sora text-slate-900 dark:text-white">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                    {item.sub}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT: Kinetic Visual Hub (40%) */}
          <div className="w-full lg:w-[40%] relative aspect-square md:flex items-center justify-center perspective-distant py-12 lg:py-0 hidden">
            <motion.div
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              className="relative w-full max-w-md h-100 flex items-center justify-center"
            >
              {/* Layer 1: System Analytics Card */}
              <motion.div
                style={{ z: 0 }}
                className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border border-slate-200 dark:border-slate-800 rounded shadow-2xl p-6 relative overflow-hidden z-10 select-none"
              >
                <div className="absolute inset-0 pattern-dots opacity-5 pointer-events-none" />

                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800 font-mono">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center">
                      <Server className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tighter">
                        Solution Node
                      </h4>
                      <p className="text-[9px] text-slate-500 tracking-widest">
                        v2.4.1_STABLE
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-emerald-500 font-bold px-2 py-0.5 rounded bg-emerald-500/10 mb-1">
                      OPTIMIZED
                    </div>
                    <div className="text-[8px] text-slate-400">LOAD: 12.4%</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      label: "NET_INFRA",
                      val: "99.9%",
                      icon: Globe,
                      status: "Connected",
                    },
                    {
                      label: "CPU_UTIL",
                      val: "14.2%",
                      icon: Cpu,
                      status: "Optimal",
                    },
                    {
                      label: "STORAGE",
                      val: "2.1TB",
                      icon: Database,
                      status: "Secured",
                    },
                    {
                      label: "UPTIME",
                      val: "365D",
                      icon: Zap,
                      status: "Ready",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="p-3 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <item.icon className="w-3 h-3 text-blue-500" />
                        <span className="text-[8px] font-mono text-slate-400 tracking-tighter uppercase">
                          {item.label}
                        </span>
                      </div>
                      <div className="text-sm font-bold font-sora text-slate-900 dark:text-white leading-none mb-1">
                        {item.val}
                      </div>
                      <div className="text-[8px] font-mono text-emerald-500 flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        {item.status}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Layer 2: Floating Performance Card */}
              <motion.div
                style={{
                  z: 150,
                  x: useTransform(mouseX, [-0.5, 0.5], [15, -15]),
                  y: useTransform(mouseY, [-0.5, 0.5], [15, 15]),
                  rotate: -8,
                }}
                className="absolute sm:top-2 -top-5 sm:left-2 left-2  sm:block w-fit p-4 rounded bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl border border-blue-500/30 shadow-2xl z-20 pointer-events-none"
              >
                <div className="h-8 flex items-end gap-1 mb-2">
                  {[
                    { h: 0.4, id: "h1" },
                    { h: 0.7, id: "h2" },
                    { h: 0.5, id: "h3" },
                    { h: 0.9, id: "h4" },
                    { h: 0.6, id: "h5" },
                    { h: 0.8, id: "h6" },
                    { h: 0.95, id: "h7" },
                  ].map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ height: 0 }}
                      animate={{ height: `${item.h * 100}%` }}
                      transition={{
                        delay: Number(item.id.slice(1)) * 0.1,
                        duration: 1,
                      }}
                      className="bg-linear-to-t from-blue-600 to-cyan-400 rounded-t-sm w-2"
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center text-[8px] font-bold text-slate-900 dark:text-white">
                  <p>
                    SYSTEM{"_"}
                    <span className="text-emerald-500 ml-1">PERFORMANCE</span>
                  </p>
                </div>
              </motion.div>

              {/* Layer 3: Security Badge */}
              <motion.div
                style={{
                  z: 200,
                  x: useTransform(mouseX, [-0.5, 0.5], [-10, 10]),
                  y: useTransform(mouseY, [-0.5, 0.5], [-10, 10]),
                }}
                className="absolute bottom-10 right-0 bg-blue-600 p-3 rounded shadow-2xl shadow-blue-500/50 flex flex-col items-center justify-center rotate-12 z-30 pointer-events-none"
              >
                <Shield className="text-white w-4 h-4 mb-2 drop-shadow-lg" />
                <span className="text-[8px] font-bold text-white uppercase tracking-[0.2em] leading-none">
                  Encrypted_v2
                </span>
              </motion.div>

              {/* Background Aura */}
              <div className="absolute inset-0 bg-radial-gradient from-emerald-500/10 to-transparent blur-3xl rounded-full scale-150 pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SolutionsHero;
