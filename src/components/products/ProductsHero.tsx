"use client";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import {
  BadgeCheck,
  Package,
  ShoppingBag,
  TruckElectric,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const ProductHero = () => {
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
        Array.from({ length: 6 }, (_, idx) => ({
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

  return (
    <header
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full min-h-[90vh] lg:min-h-screen flex items-center pt-20 pb-20 lg:pt-26 overflow-hidden
 bg-slate-50 dark:bg-slate-950"
      role="banner"
    >
      {/* KINETIC BACKGROUND LAYERS */}
      <motion.div
        style={{ x: translateX, y: translateY, opacity: 0.9 }}
        className="absolute inset-0 pattern-dots pointer-events-none"
      />

      {/* Particle Field */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: p.x, y: p.y, opacity: p.opacity }}
            animate={{
              y: [null, "-20%"],
              opacity: [0, p.opacity, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "linear",
            }}
            className={`absolute w-1 h-1 rounded-full ${p.id % 2 === 0 ? "bg-brand-secondary-500" : "bg-blue-500"}`}
          />
        ))}
      </div>

      <div className="absolute top-0 left-0 right-0 h-28 bg-linear-to-b from-primary/8 to-transparent pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-8">
          {/* LEFT: Content (60%) */}
          <div className="w-full lg:w-[60%] flex flex-col items-start space-y-2">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-brand-secondary-500/20 bg-brand-secondary-500/5  mb-4"
            >
              <ShoppingBag className="size-4 text-primary" />
              <span className="text-[10px] md:text-xs font-mono font-bold tracking-widest uppercase text-primary">
                Official SHERO Shop
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
                className=" font-extrabold leading-[1.1] text-4xl sm:text-5xl md:text-6xl lg:text-7xl 
 text-slate-900 dark:text-white mb-6"
              >
                Technology you can{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary-700 to-brand-secondary-600 dark:from-brand-primary-500 dark:to-brand-secondary-400">
                  deploy with confidence
                </span>
              </motion.h1>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-base text-slate-600 dark:text-slate-300 mb-10 leading-relaxed max-w-xl"
            >
              Curated products, reliable warranty coverage, and fast fulfillment
              for teams and individuals who value performance.
            </motion.p>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-slate-200 dark:border-slate-800 w-full"
            >
              {[
                {
                  label: "Fast Fulfillment",
                  sub: "Rapid delivery options",
                  icon: Package,
                  color: "text-brand-secondary-500",
                },
                {
                  label: "Nationwide Shipping",
                  sub: "Reliable logistics network",
                  icon: TruckElectric,
                  color: "text-blue-500",
                },
                {
                  label: "Quality Guaranteed",
                  sub: "Official warranty support",
                  icon: BadgeCheck,
                  color: "text-blue-500",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded border border-border bg-white/70 dark:bg-slate-900/60  px-4 py-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <item.icon
                      className={`w-4 h-4 ${item.color === "text-brand-secondary-500" ? "text-primary" : item.color}`}
                    />
                    <span className="text-xs font-bold text-foreground uppercase tracking-tight">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[10px] ml-6 font-mono uppercase tracking-widest text-slate-500">
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
              {/* Layer 1: Store Insights Card */}
              <motion.div
                style={{ z: 0 }}
                className="w-full bg-white/95 dark:bg-slate-900/95  border border-slate-200 dark:border-slate-800 rounded shadow p-6 sm:p-8 relative overflow-hidden z-10 select-none"
              >
                <div className="absolute inset-0 pattern-dots opacity-5 pointer-events-none" />

                <div className="flex items-center justify-between mb-8 pb-5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Customer Proof
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Updated weekly
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-brand-secondary-600 dark:text-brand-secondary-400">
                    Verified
                  </span>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      label: "Happy Customers",
                      val: "1.2k+",
                      color: "text-brand-secondary-500",
                    },
                    {
                      label: "Average Rating",
                      val: "4.9/5",
                      color: "text-blue-500",
                    },
                    {
                      label: "Verified Products",
                      val: "450+",
                      color: "text-primary",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-3.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                    >
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {item.label}
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.val}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Layer 2: Floating Payment Success Card */}
              <motion.div
                style={{
                  z: 150,
                  x: useTransform(mouseX, [-0.5, 0.5], [15, -15]),
                  y: useTransform(mouseY, [-0.5, 0.5], [15, 15]),
                  rotate: 12,
                }}
                className="absolute bottom-8 left-0 w-fit p-3 rounded bg-white/95 dark:bg-slate-800/95  border border-brand-secondary-500/20 shadow z-20 pointer-events-none scale-75 sm:scale-100"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-brand-secondary-500/10 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-brand-secondary-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono text-slate-500 uppercase">
                      100%
                    </span>
                    <span className="text-[10px] font-bold text-slate-900 dark:text-white">
                      TRUSTED
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Layer 3: Quality Seal */}
              <motion.div
                style={{
                  z: 200,
                  x: useTransform(mouseX, [-0.5, 0.5], [-8, 8]),
                  y: useTransform(mouseY, [-0.5, 0.5], [-8, 8]),
                }}
                className="absolute top-4 right-4 bg-brand-secondary-600 w-16 h-16 rounded-full shadow shadow-brand-secondary-500/50 flex-col items-center justify-center -rotate-6 z-30 pointer-events-none aspect-square scale-75 sm:scale-100 flex"
              >
                <BadgeCheck className="text-white w-8 h-8 drop-shadow" />
                <span className="text-[7px] font-bold text-white uppercase tracking-tighter mt-1 whitespace-nowrap">
                  VERIFIED
                </span>
              </motion.div>

              {/* Background Aura */}
              <div className="absolute inset-0 bg-radial-gradient from-brand-secondary-500/10 to-transparent blur-3xl rounded-full scale-150 pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProductHero;
