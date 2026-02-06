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
import { useRef, useMemo, useState } from "react";

const SolutionsHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse Tracking for Kinetic Effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Particle State
  const [particles] = useState(() =>
    Array.from({ length: 12 }, (_, idx) => ({
      id: idx,
      x: Math.random() * 100 + "%",
      y: Math.random() * 100 + "%",
      opacity: Math.random() * 0.2 + 0.1,
      duration: Math.random() * 20 + 30,
    })),
  );

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

  const prefersReducedMotion = useMemo(
    () => globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

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

      {/* Particle Field */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
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
            className={`absolute w-1 h-1 rounded-full ${p.id % 2 === 0 ? "bg-blue-500" : "bg-emerald-500"}`}
          />
        ))}
      </div>

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
              className="inline-flex items-center gap-2 px-3 py-1 rounded border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm mb-4"
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
                className="font-sora font-extrabold leading-[1.1] text-3xl md:text-6xl lg:text-7xl 
                           text-slate-900 dark:text-white sm:mb-3"
              >
                Performance Driven{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400">
                  Solutions
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
                         hover:bg-emerald-700 hover:shadow-2xl hover:shadow-emerald-500/30
                         hover:-translate-y-1 transition-all duration-300
                         w-full sm:w-auto text-sm uppercase tracking-wide"
              >
                <span>Request a Quote</span>
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#services"
                className="group flex items-center justify-center gap-3 text-slate-900 dark:text-white font-bold tracking-tight border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500/50! rounded px-8 py-2 w-full sm:w-auto transition-all text-sm uppercase"
              >
                Explore Services
                <Zap className="w-5 h-5 text-blue-500 group-hover:rotate-12 transition-transform" />
              </a>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-12 mt-16 pt-12 border-t border-slate-200 dark:border-slate-800 w-full"
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
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-bold font-sora text-slate-900 dark:text-white">
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
          <div className="w-full lg:w-[40%] relative aspect-square flex items-center justify-center perspective-distant py-12 lg:py-0">
            <motion.div
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              className="relative w-full max-w-md h-[400px] flex items-center justify-center"
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
                  ].map((item, idx) => (
                    <div
                      key={idx}
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
                className="absolute sm:-top-12 -top-5 sm:-left-12 left-2  sm:block w-fit p-4 rounded bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl border border-blue-500/30 shadow-2xl z-20 pointer-events-none"
              >
                <div className="h-8 flex items-end gap-1 mb-2">
                  {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.95].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h * 100}%` }}
                      transition={{ delay: i * 0.1, duration: 1 }}
                      className="bg-linear-to-t from-blue-600 to-cyan-400 rounded-t-sm w-2"
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center text-[8px] font-bold text-slate-900 dark:text-white">
                  <p>SYSTEM_
                  <span className="text-emerald-500">PERFORMANCE</span>
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
                className="absolute bottom-0 right-5 bg-blue-600 p-3 rounded shadow-2xl shadow-blue-500/50 flex flex-col items-center justify-center rotate-12 z-30 pointer-events-none"
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
