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
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-4, 4]);
  const translateX = useTransform(smoothX, [-0.5, 0.5], [-7, 7]);
  const translateY = useTransform(smoothY, [-0.5, 0.5], [-7, 7]);

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
        <ParticleField count={6} colorVariant="dual" opacity={0.16} />
      )}

      <div className="absolute top-0 left-0 right-0 h-28 bg-linear-to-b from-primary/8 to-transparent pointer-events-none" />

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
                className="font-sora font-extrabold leading-[1.1] text-4xl sm:text-5xl md:text-6xl lg:text-7xl 
                           text-slate-900 dark:text-white sm:mb-3"
              >
                Software and IT built for{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400">
                  dependable scale
                </span>
              </motion.h1>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-base md:text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-xl"
            >
              From custom platforms to managed infrastructure, we help teams
              ship faster and operate with confidence.
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
                         hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-700
                         hover:-translate-y-1 transition duration-300
                         w-full sm:w-auto text-sm uppercase tracking-wid"
                role="button"
                aria-label="Request a Quote"
              >
                <span>Book Consultation</span>
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#services"
                className="group flex items-center justify-center gap-3 text-foreground font-bold tracking-tight border-2 border-border hover:border-emerald-600/50! rounded px-8 py-2 w-full sm:w-auto transition text-sm uppercase"
                role="button"
                aria-label="Explore Services"
              >
                View Services
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
                {
                  label: "Fast Turnaround",
                  sub: "Launch in weeks, not months",
                  icon: Zap,
                },
                {
                  label: "Security First",
                  sub: "Enterprise-grade protection",
                  icon: Shield,
                },
                {
                  label: "Modern Tech",
                  sub: "Built with the latest tools",
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
              {/* Layer 1: System Architecture Card */}
              <motion.div
                style={{ z: 0 }}
                className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded shadow-lg p-6 sm:p-8 relative overflow-hidden z-10 select-none"
              >
                <div className="absolute inset-0 pattern-dots opacity-5 pointer-events-none" />

                <div className="flex items-center justify-between mb-8 pb-5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center">
                      <Server className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Delivery Capabilities
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        Enterprise-ready
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      label: "Network Infra",
                      desc: "Cloud & On-prem",
                      icon: Globe,
                      color: "text-blue-500",
                    },
                    {
                      label: "Performance",
                      desc: "Optimized Scaling",
                      icon: Cpu,
                      color: "text-emerald-500",
                    },
                    {
                      label: "Data Security",
                      desc: "Zero-trust Protocols",
                      icon: Database,
                      color: "text-indigo-500",
                    },
                    {
                      label: "Uptime SLA",
                      desc: "24/7 Monitoring",
                      icon: Zap,
                      color: "text-amber-500",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="p-3.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.label}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 leading-snug">
                        {item.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Layer 2: Floating Performance Chart */}
              <motion.div
                style={{
                  z: 150,
                  x: useTransform(mouseX, [-0.5, 0.5], [15, -15]),
                  y: useTransform(mouseY, [-0.5, 0.5], [15, 15]),
                  rotate: -8,
                }}
                className="absolute sm:-top-4 -top-5 sm:-left-4 left-2 sm:block w-fit p-4 rounded bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-blue-500/20 shadow-md z-20 pointer-events-none"
              >
                <div className="h-10 flex items-end gap-1.5 mb-2">
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
                      className="bg-emerald-500 rounded-t-sm w-2"
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <p>Efficiency</p>
                </div>
              </motion.div>

              {/* Layer 3: Security Badge */}
              <motion.div
                style={{
                  z: 200,
                  x: useTransform(mouseX, [-0.5, 0.5], [-10, 10]),
                  y: useTransform(mouseY, [-0.5, 0.5], [-10, 10]),
                }}
                className="absolute -bottom-6 -right-2 bg-blue-600 p-4 rounded shadow-lg shadow-blue-500/40 flex flex-col items-center justify-center rotate-12 z-30 pointer-events-none"
              >
                <Shield className="text-white w-5 h-5 mb-1.5 drop-shadow-md" />
                <span className="text-[9px] font-bold text-white uppercase tracking-wider">
                  Secured
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
