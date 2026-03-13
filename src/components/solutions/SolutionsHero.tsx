"use client";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { 
  ArrowRight, 
  Smartphone, 
  Zap,
  Cpu,
  Shield,
  Server,
  Code
} from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { useIsMounted } from "@/hooks/useIsMounted";
import dynamic from "next/dynamic";

import HeroBackground from "@/components/common/HeroBackground";

const SolutionsHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mounted = useIsMounted();

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
    { label: "Cloud Architecture", icon: Server },
    { label: "Managed IT", icon: Shield },
    { label: "API Integrations", icon: Zap },
  ];

  return (
    <header 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full min-h-screen lg:h-[90vh] flex items-center pt-24 pb-20 lg:py-0 overflow-hidden bg-slate-50 dark:bg-slate-950"
    >
      <HeroBackground />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-8 items-center">
          
          {/* Solution Info */}
          <motion.div
            initial={false}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, type: "spring", damping: 20 }}
            className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1 w-full lg:w-1/2"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 lg:mb-8 rounded border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md">
               <Code className="size-4 text-emerald-500" />
               <span className="text-[10px] sm:text-xs font-mono font-black tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
                 Software & IT Solutions
               </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black font-sora text-slate-900 dark:text-white leading-[1.05] tracking-tighter mb-6 lg:mb-8">
              {["Software", "and", "IT", "Built", "for", "Scale"].map((word, i) => (
                <span key={i} className={i === 0 || i === 2 ? "text-emerald-500" : ""}>{word}{' '}</span>
              ))}
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 mb-8 lg:mb-10 max-w-xl leading-relaxed">
              From high-performance custom platforms to managed enterprise infrastructure, we engineer systems that grow with your ambitions.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-10 lg:mb-12">
               {features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-4 py-2 rounded bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm transition-colors hover:border-emerald-500/30">
                    <feature.icon className="size-3.5 text-emerald-500" />
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-tight text-slate-600 dark:text-slate-300">{feature.label}</span>
                  </div>
               ))}
            </div>

            <Link
              href="/consultation"
              className="group w-full sm:w-auto flex items-center justify-center gap-6 px-12 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded font-black uppercase tracking-widest text-xs hover:bg-emerald-600 dark:hover:bg-emerald-500 dark:hover:text-white transition-all shadow-2xl shadow-black/20"
            >
               Let's Talk
              <ArrowRight size={20} className="group-hover:translate-x-3 transition-transform" />
            </Link>
          </motion.div>

          {/* Solution Visual Hub */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, rotate: 5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 1.2, type: "spring", damping: 15 }}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative hidden md:flex items-center justify-center order-1 lg:order-2 w-full lg:w-1/2"
          >
            <div className="relative w-full aspect-square max-w-[280px] sm:max-w-[450px] lg:max-w-[550px] group/visual">
              {/* Background Ambient Glows */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-500/5 dark:bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-500/5 dark:bg-blue-500/5 blur-[80px] rounded-full pointer-events-none translate-x-10" />
              
              {/* Main Visual Card */}
              <div className="relative w-full h-full drop-shadow-2xl group-hover/visual:-translate-y-6 transition-transform duration-1000 ease-out flex items-center justify-center">
                <div className="w-full h-full relative overflow-hidden flex items-center justify-center shadow-inner">
                   <div className="absolute inset-0 pattern-dots opacity-40" />
                   
                   {/* Central Iconography */}
                   <div className="relative z-10 w-32 h-32 sm:w-48 sm:h-48 flex items-center justify-center">
                      <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full animate-pulse" />
                      <Zap className="size-full text-emerald-500 drop-shadow-[0_0_30px_rgba(16,185,129,0.4)] relative z-10" />
                   </div>
                   
                   {/* Floating Tech Badges */}
                   {/* <motion.div 
                      animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-12 right-12 w-12 h-12 sm:w-16 sm:h-16 rounded bg-blue-500/20 backdrop-blur-xl flex items-center justify-center text-blue-500 border border-blue-500/30 shadow-xl"
                    >
                      <Cpu size={28} className="sm:size-32" />
                   </motion.div>
                   
                   <motion.div 
                      animate={{ y: [0, 20, 0], rotate: [0, -8, 0] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      className="absolute bottom-16 left-12 w-16 h-16 sm:w-20 sm:h-20 rounded bg-indigo-500/20 backdrop-blur-xl flex items-center justify-center text-indigo-500 border border-indigo-500/30 shadow-xl"
                    >
                      <Shield size={32} className="sm:size-40" />
                   </motion.div>

                   <motion.div 
                      animate={{ x: [0, 15, 0] }}
                      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                      className="absolute top-24 left-16 w-10 h-10 rounded bg-emerald-500/20 backdrop-blur-lg flex items-center justify-center text-emerald-500 border border-emerald-500/30"
                    >
                      <Zap size={20} />
                   </motion.div> */}
                </div>
              </div>

              {/* Verified Status Floating Badge */}
              {/* <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="absolute -bottom-4 -right-4 p-4 sm:p-6 rounded bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/40 shadow-2xl z-20"
              >
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
                      <Server size={20} className="sm:size-24" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">Tier 1 Infrastructure</span>
                      <span className="text-xs sm:text-sm font-black text-emerald-500">SYSTEMS VERIFIED</span>
                   </div>
                </div>
              </motion.div> */}
            </div>
          </motion.div>

        </div>
      </div>
    </header>
  );
};

export default SolutionsHero;
