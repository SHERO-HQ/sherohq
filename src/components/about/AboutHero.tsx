"use client";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import {
  ShieldCheck,
  SmartphoneCharging,
  Lightbulb,
  Target,
  Star,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const AboutHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse Tracking for Kinetic Effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Particle State — deferred to useEffect to avoid Math.random() hydration mismatch
  const [particles, setParticles] = useState<
    { id: number; x: string; y: string; opacity: number; duration: number }[]
  >([]);

  useEffect(() => {
    queueMicrotask(() => {
      setParticles(
        Array.from({ length: 8 }, (_, idx) => ({
          id: idx,
          x: Math.random() * 100 + "%",
          y: Math.random() * 100 + "%",
          opacity: Math.random() * 0.12 + 0.08,
          duration: Math.random() * 20 + 30,
        })),
      );
    });
  }, []);

  // Spring physics
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Parallax transforms - Reduced for subtler motion
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

  return (
    <header
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full min-h-[80vh] lg:min-h-screen flex items-center py-12 lg:py-16 overflow-hidden
 bg-slate-50 dark:bg-slate-950"
      role="banner"
    >
      {/* KINETIC BACKGROUND LAYERS */}
      <motion.div
        style={{ x: translateX, y: translateY, opacity: 0.9 }}
        className="absolute inset-0 pattern-dots pointer-events-none"
      />

      {/* Particle Field - intentionally subtle */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: p.x, y: p.y, opacity: p.opacity }}
            animate={{
              y: [null, "-18%"],
              opacity: [0, p.opacity, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute w-1 h-1 bg-brand-secondary-500 rounded-full"
          />
        ))}
      </div>

      <div className="absolute top-0 left-0 right-0 h-28 bg-linear-to-b from-primary/8 to-transparent pointer-events-none" />

      {/* Gradient Orbs */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
 <motion.div
 style={{ x: translateX, y: translateY }}
 className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-secondary-500/5 dark:bg-brand-secondary-600/10 rounded-full blur-[120px]"
 />
 <motion.div
 style={{
 x: useTransform(smoothX, [-0.5, 0.5], [15, -15]),
 y: useTransform(smoothY, [-0.5, 0.5], [15, -15]),
 }}
 className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-[120px]"
 />
 </div> */}

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
          {/* LEFT: Vision Content (60%) */}
          <div className="w-full lg:w-[60%] flex flex-col items-start space-y-3">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1 rounded border border-brand-secondary-500/20 bg-brand-secondary-500/5 transition-colors duration-300 mb-4"
            >
              <SmartphoneCharging className="size-4 text-brand-secondary-500" />
              <span className="text-[10px] font-semibold uppercase text-brand-secondary-600 dark:text-brand-secondary-400">
                About SHERO
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
                className=" font-semibold leading-[1.1] text-3xl sm:text-4xl md:text-5xl lg:text-6xl 
  text-slate-900 dark:text-white mb-2"
              >
                Engineering clarity.{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary-700 to-brand-secondary-600 dark:from-brand-primary-500 dark:to-brand-secondary-400">
                  Delivering impact.
                </span>
              </motion.h1>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-base md:text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed max-w-xl"
            >
              We partner with organizations to design, ship, and support
              technology that creates measurable business outcomes.
            </motion.p>

            {/* Values Preview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800 w-full"
            >
              {[
                {
                  label: "INNOVATION",
                  sub: "Cutting Edge",
                  icon: Lightbulb,
                  color: "text-brand-secondary-500",
                },
                {
                  label: "INTEGRITY",
                  sub: "Trusted Partner",
                  icon: ShieldCheck,
                  color: "text-blue-500",
                },
                {
                  label: "IMPACT",
                  sub: "Results Driven",
                  icon: Target,
                  color: "text-brand-secondary-600",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded border border-border bg-white/70 dark:bg-slate-900/60  px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[10px] mt-1.5 block font-medium uppercase tracking-widest text-slate-500">
                    {item.sub}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT: Vision Hub (40%) */}
          <div className="w-full lg:w-[40%] relative aspect-square md:flex items-center justify-center perspective-distant py-12 lg:py-0 hidden">
            <motion.div
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              className="relative w-full max-w-md h-105 flex items-center justify-center"
            >
              {/* Layer 1: Core Values Card */}
              <motion.div
                style={{ z: 0 }}
                className="w-full bg-white/95 dark:bg-slate-900/95  border border-slate-200 dark:border-slate-800 rounded shadow p-6 sm:p-8 relative overflow-hidden z-10 select-none"
              >
                <div className="absolute inset-0 pattern-dots opacity-5 pointer-events-none" />

                <div className="flex items-center gap-4 mb-8 pb-5 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-12 h-12 rounded bg-brand-secondary-500/10 flex items-center justify-center shadow-inner">
                    <Target className="w-6 h-6 text-brand-secondary-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Company Vision
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      Est. 2023
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    {
                      label: "Strategic Goals",
                      val: "Exceeded",
                      progress: 85,
                      color: "bg-brand-secondary-500",
                    },
                    {
                      label: "Client Success",
                      val: "Highest Priority",
                      progress: 98,
                      color: "bg-blue-500",
                    },
                    {
                      label: "Technical Excellence",
                      val: "Maintained",
                      progress: 94,
                      color: "bg-brand-secondary-600",
                    },
                  ].map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <span>{item.label}</span>
                        <span className="text-slate-900 dark:text-white font-bold">
                          {item.val}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress}%` }}
                          transition={{ duration: 1.5 }}
                          className={`h-full ${item.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Layer 2: Impact Seal */}
              <motion.div
                style={{
                  z: 220,
                  x: useTransform(mouseX, [-0.5, 0.5], [-12, 12]),
                  y: useTransform(mouseY, [-0.5, 0.5], [-12, 12]),
                }}
                className="absolute -bottom-6 -right-5 w-fit p-4 bg-linear-to-r from-blue-600 to-blue-500 rounded shadow shadow-blue-500/40 flex flex-col items-center justify-center rotate-6 z-30 pointer-events-none"
              >
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <Star
                      key={item}
                      className={`text-yellow-400 w-3.5 h-3.5 mb-1.5 drop-shadow ${item <= 4 ? "fill-yellow-400" : ""}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-white tracking-wide whitespace-nowrap">
                  Client Satisfaction
                </span>
              </motion.div>

              {/* Background Aura */}
              <div className="absolute inset-0 bg-radial-gradient from-brand-secondary-500/15 to-transparent blur-3xl rounded-full scale-150 pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AboutHero;
