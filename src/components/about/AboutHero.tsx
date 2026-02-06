import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import {
  ShieldCheck,
  SmartphoneCharging,
  Lightbulb,
  Target,
  Compass,
  TrendingUp,
  Star,
} from "lucide-react";
import { useRef, useMemo, useState } from "react";

const AboutHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse Tracking for Kinetic Effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Particle State - Emerald/Blue theme
  const [particles] = useState(() =>
    Array.from({ length: 15 }, (_, idx) => ({
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

  // Parallax transforms - Reduced for subtler motion
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-6, 6]);
  const translateX = useTransform(smoothX, [-0.5, 0.5], [-12, 12]);
  const translateY = useTransform(smoothY, [-0.5, 0.5], [-12, 12]);

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
        style={{ x: translateX, y: translateY, opacity: 0.9 }}
        className="absolute inset-0 pattern-dots pointer-events-none"
      />

      {/* Particle Field - Emerald theme */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: p.x, y: p.y, opacity: p.opacity }}
            animate={{
              y: [null, "-25%"],
              opacity: [0, p.opacity, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute w-1 h-1 bg-emerald-500 rounded-full"
          />
        ))}
      </div>

      {/* Scanning Line Effect */}
      <div className="absolute inset-y-0 left-0 w-px bg-emerald-500/20 hidden md:block" />

      {/* Gradient Orbs */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          style={{ x: translateX, y: translateY }}
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 dark:bg-emerald-600/10 rounded-full blur-[120px]"
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
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* LEFT: Vision Content (60%) */}
          <div className="w-full lg:w-[60%] flex flex-col items-start space-y-4">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm mb-4"
            >
              <SmartphoneCharging className="size-4 text-emerald-500" />
              <span className="text-[8px] md:text-xs font-mono font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
                Redefining Possibilities since 2023
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
                className="font-sora font-extrabold leading-[1.1] text-5xl md:text-5xl lg:text-7xl 
                           text-slate-900 dark:text-white mb-2"
              >
                Technical{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400">
                  Excellence
                </span>
              </motion.h1>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-xl"
            >
              Visionary strategists and engineers dedicated to delivering
              innovative hardware and software products that transform
              businesses and empower people.
            </motion.p>

            {/* Values Preview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-8 pt-10 border-t border-slate-200 dark:border-slate-800 w-full"
            >
              {[
                {
                  label: "INNOVATION",
                  sub: "Cutting Edge",
                  icon: Lightbulb,
                  color: "text-emerald-500",
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
                  color: "text-emerald-600",
                },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 mb-1">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-xs font-bold font-sora text-slate-900 dark:text-white uppercase tracking-tight">
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

          {/* RIGHT: Vision Hub (40%) */}
          <div className="w-full lg:w-[40%] relative aspect-square flex items-center justify-center perspective-distant py-12 lg:py-0">
            <motion.div
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              className="relative w-full max-w-md h-[420px] flex items-center justify-center"
            >
              {/* Layer 1: Core Values Card */}
              <motion.div
                style={{ z: 0 }}
                className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border border-slate-200 dark:border-slate-800 rounded shadow-2xl p-8 relative overflow-hidden z-10 select-none font-mono"
              >
                <div className="absolute inset-0 pattern-dots opacity-5 pointer-events-none" />

                <div className="flex items-center gap-4 mb-10 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-12 h-12 rounded bg-emerald-500/10 flex items-center justify-center shadow-inner">
                    <Target className="w-7 h-7 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tighter">
                      Mission_Protocol
                    </h4>
                    <p className="text-[10px] text-slate-500 tracking-widest">
                      EST_SESSION_2023
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    {
                      label: "STRATEGIC_GOALS",
                      val: "Reached",
                      progress: 85,
                      color: "bg-emerald-500",
                    },
                    {
                      label: "CLIENT_SUCCESS",
                      val: "Consistent",
                      progress: 98,
                      color: "bg-blue-500",
                    },
                    {
                      label: "TECH_ROBUSTNESS",
                      val: "Stable",
                      progress: 94,
                      color: "bg-emerald-600",
                    },
                  ].map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex justify-between text-[9px] font-bold text-slate-500 tracking-wider">
                        <span>{item.label}</span>
                        <span className="text-slate-900 dark:text-white">
                          {item.val}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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

                <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-900 dark:text-white">
                      GUIDED_BY_PASSION
                    </span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </motion.div>

              {/* Layer 2: Floating Achievement Badge */}
              <motion.div
                style={{
                  z: 150,
                  x: useTransform(mouseX, [-0.5, 0.5], [20, -20]),
                  y: useTransform(mouseY, [-0.5, 0.5], [20, 20]),
                  rotate: -12,
                }}
                className="absolute top-0 left-0 w-fit p-3 rounded bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl border border-emerald-500/30 shadow-2xl z-20 pointer-events-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-600 to-blue-400 flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-slate-500 uppercase">
                      Growth
                    </span>
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white italic">
                      METER
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Layer 3: Impact Seal */}
              <motion.div
                style={{
                  z: 220,
                  x: useTransform(mouseX, [-0.5, 0.5], [-12, 12]),
                  y: useTransform(mouseY, [-0.5, 0.5], [-12, 12]),
                }}
                className="absolute bottom-10 right-5 w-fit p-3 bg-linear-to-r from-blue-600 to-blue-400 rounded shadow-2xl shadow-blue-500/40 flex flex-col items-center justify-center rotate-6 z-30 pointer-events-none"
              >
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <Star
                      key={item}
                      className={`text-yellow-500 w-5 h-5 mb-2 drop-shadow-lg  ${item <= 4 ? "fill-amber-400" : ""}`}
                    />
                  ))}
                </div>
                <span className="text-[9px] font-bold text-white uppercase tracking-tighter whitespace-nowrap">
                  CLIENT_SATISFACTION
                </span>
              </motion.div>

              {/* Background Aura */}
              <div className="absolute inset-0 bg-radial-gradient from-emerald-500/15 to-transparent blur-3xl rounded-full scale-150 pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AboutHero;
