"use client";
import NavLink from "@/components/common/NavLink";
import { getAbsoluteUrl } from "@/utils/subdomain";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { fadeUp, fadeUpAccessible } from "@/components/motion/heroMotion";
import { useRef, useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMounted } from "@/hooks/useIsMounted";
import dynamic from "next/dynamic";

const ParticleField = dynamic(
 () => import("@/components/common/ParticleField"),
 { ssr: false },
);
import { RocketIcon } from "@/assets/icons/icons";
import {
 ArrowRight,
 BriefcaseBusiness,
 // Headset,
 ShieldCheck,
 ShoppingCart,
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
 const rectRef = useRef<DOMRect | null>(null);

 // Mouse Tracking for Kinetic Effects
 const mouseX = useMotionValue(0);
 const mouseY = useMotionValue(0);

 // Defer heavy physics initialization until after mount to relieve hydration
 const [isKineticReady, setIsKineticReady] = useState(false);
 useEffect(() => {
  setIsKineticReady(true);
 }, []);

 // Spring physics for smooth movement
 const springConfig = { damping: 25, stiffness: 150 };
 const smoothX = useSpring(mouseX, springConfig);
 const smoothY = useSpring(mouseY, springConfig);

 // Keep hero motion subtle for a cleaner premium feel.
 const rawTranslateX = useTransform(smoothX, [-0.5, 0.5], [-6, 6]);
 const rawTranslateY = useTransform(smoothY, [-0.5, 0.5], [-6, 6]);

 // Only apply transforms when kinetic is ready
 const translateX = isKineticReady ? rawTranslateX : 0;
 const translateY = isKineticReady ? rawTranslateY : 0;

 useEffect(() => {
 if (!containerRef.current) return;
 rectRef.current = containerRef.current.getBoundingClientRect();

 const handleResize = () => {
 if (containerRef.current) {
 rectRef.current = containerRef.current.getBoundingClientRect();
 }
 };

 window.addEventListener("resize", handleResize);
 return () => window.removeEventListener("resize", handleResize);
 }, []);

 const handleMouseMove = (e: React.MouseEvent) => {
 if (!rectRef.current) return;
 const x = (e.clientX - rectRef.current.left) / rectRef.current.width - 0.5;
 const y = (e.clientY - rectRef.current.top) / rectRef.current.height - 0.5;
 mouseX.set(x);
 mouseY.set(y);
 };

 const prefersReducedMotion = useReducedMotion();
 const mounted = useIsMounted();

 return (
 <header
 ref={containerRef}
 onMouseMove={handleMouseMove}
 className="relative min-h-[90vh] lg:min-h-screen w-full overflow-hidden
 bg-slate-50 dark:bg-slate-950
 flex items-center md:pt-20"
 role="banner"
 aria-label="Hero section - Company mission statement"
 >
 {/* Subtle patterned depth */}
 <motion.div
 style={{ x: translateX, y: translateY, opacity: 0.9 }}
 className="absolute inset-0 pattern-dots pointer-events-none will-change-transform"
 />

 {/* Particle Field — only after mount so server HTML is always null */}
 {mounted && (
 <ParticleField count={5} colorVariant="single" opacity={0.12} />
 )}

 <div className="absolute top-0 left-0 right-0 h-36 bg-linear-to-b from-primary/8 to-transparent pointer-events-none" />

 <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 lg:py-16">
 <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-10">
 <div className="w-full lg:w-[56%] flex flex-col items-start gap-5 text-left">
 <motion.div
 initial={{ x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.6 }}
 className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-emerald-500/25 bg-emerald-500/10 backdrop-blur-sm"
 >
 <RocketIcon className="w-4 h-4 text-emerald-500" />
 <span className="text-[10px] md:text-xs font-mono font-bold tracking-widest uppercase text-emerald-700 dark:text-emerald-300">
 Trusted Technology Partner
 </span>
 </motion.div>

 {/* Headline: Sora Font + Scan line Reveal */}
 <div className="relative overflow-hidden group">
 <motion.h1
 initial="visible"
 animate="visible"
 variants={prefersReducedMotion ? {} : fadeUp}
 className=" font-extrabold leading-[1.1] text-5xl sm:text-6xl md:text-7xl lg:text-8xl 
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

 <motion.p
 animate="visible"
 variants={prefersReducedMotion ? {} : fadeUp}
 transition={{ delay: 0.15 }}
 className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed"
 >
 {HERO_CONTENT.subHeader}
 </motion.p>

 <motion.div
 initial="hidden"
 animate="visible"
 variants={fadeUpAccessible(prefersReducedMotion)}
 transition={{ delay: 0.25 }}
 className="flex flex-col sm:flex-row items-center gap-4 pt-2 w-full sm:w-auto"
 >
 <Button
 asChild
 variant="brand"
 size="lg"
 className="w-full sm:w-auto h-11 px-8 text-sm shadow-md shadow-emerald-500/20 group"
 >
 <NavLink href={getAbsoluteUrl("/shop")}>
 <span className="">Shop Products</span>
 <ShoppingCart className="w-5 h-5" />
 </NavLink>
 </Button>

 <NavLink
 href={getAbsoluteUrl("/solutions")}
 className="group flex items-center justify-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary! rounded px-4 py-2 h-11 w-full sm:w-auto transition-colors border-2 border-slate-200 dark:border-slate-800 hover:border-primary!"
 role="button"
 aria-label="Explore solutions"
 >
 <span>Explore Solutions</span>
 <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
 </NavLink>
 </motion.div>

 {/* <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.5, duration: 0.8 }}
 className="w-full pt-6 border-t border-slate-200 dark:border-slate-800"
 >
 <div className="flex items-center gap-4">
 <div className="backdrop-blur px-4 py-3">
 <p className="flex items-center gap-2 mt-1 text-lg font-bold text-slate-900 dark:text-white">
 <Users className="w-5 h-5 inline" />
 1,500+
 </p>
 <p className="text-xs font-mono uppercase tracking-wider text-slate-500">
 Deliveries
 </p>
 
 </div>
 
 <div className="backdrop-blur px-4 py-3">
 
 <p className="mt-1 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
 <Headset className="w-5 h-5 inline" />
 24/7
 </p>
 <p className="text-xs font-mono uppercase tracking-wider text-slate-500">
 Support
 </p>
 </div>
 </div>
 </motion.div> */}
 </div>

 <div className="w-full lg:w-[44%] relative aspect-square flex items-center justify-center py-8 lg:py-0">
 <motion.div
 style={{
 x: translateX,
 y: translateY,
 }}
 className="relative w-full max-w-lg h-full flex items-center justify-center"
 >
 <motion.div
 initial={{ opacity: 0, y: 24 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.2, duration: 0.7 }}
 className="w-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded shadow p-5 sm:p-7 relative overflow-hidden"
 >
 <div className="absolute inset-0 bg-linear-to-br from-white/35 to-transparent dark:from-slate-800/25 pointer-events-none" />
 <div className="absolute inset-0 pattern-dots opacity-10 pointer-events-none" />

 <div className="flex items-center justify-between mb-6 pb-5 border-b border-slate-200/70 dark:border-slate-800">
 <div className="flex items-center gap-3">
 <div className="flex items-center justify-center">
  <Image
    src="/assets/logo/shero.svg"
    alt="SHERO"
    width={40}
    height={40}
    priority
    className="sm:w-10 sm:h-10 w-8 h-8"
  />
 </div>
 <div>
 <h4 className="text-sm font-bold text-slate-900 dark:text-white">
 SHERO HQ
 </h4>
 <p className="text-[11px] text-slate-500">
 Built for growth
 </p>
 </div>
 </div>
 <div className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 bg-primary/10 text-primary text-xs font-mono font-semibold uppercase tracking-wide">
 <ShieldCheck className="w-3.5 h-3.5" />
 Verified
 </div>
 </div>

 <div className="space-y-3">
 {[
 {
 title: "Hardware & Accessories",
 desc: "Curated, business-grade equipment for reliable daily performance.",
 icon: Users,
 },
 {
 title: "Software Solutions",
 desc: "Custom digital products designed around your workflows.",
 icon: BriefcaseBusiness,
 },
 {
 title: "Managed Support",
 desc: "Fast implementation and dependable post-launch assistance.",
 icon: ShieldCheck,
 },
 ].map((item) => (
 <div
 key={item.title}
 className="flex items-start gap-3 rounded border border-slate-200/70 dark:border-slate-800 p-3.5 bg-white/70 dark:bg-slate-900/60"
 >
 <div className="rounded bg-primary/10 text-primary p-2 mt-0.5">
 <item.icon className="w-4 h-4" />
 </div>
 <div>
 <h5 className="text-sm font-semibold text-slate-900 dark:text-white">
 {item.title}
 </h5>
 <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
 {item.desc}
 </p>
 </div>
 </div>
 ))}
 </div>
 </motion.div>

 {/* <motion.div
 style={{
 x: useTransform(smoothX, [-0.5, 0.5], [6, -6]),
 y: useTransform(smoothY, [-0.5, 0.5], [4, -4]),
 }}
 className="absolute -bottom-6 right-4 rounded border border-primary/30 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 py-3 shadow-lg select-none pointer-events-none hidden sm:block"
 >
 <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
 Procurement
 </div>
 <div className="mt-1 flex items-center gap-2">
 <ShoppingCart className="w-4 h-4 text-primary" />
 <span className="text-sm font-bold text-slate-900 dark:text-white">
 Fast fulfillment
 </span>
 </div>
 <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
 From sourcing to setup with one team.
 </div>
 </motion.div> */}

 <div className="absolute -z-10 inset-0 bg-radial-gradient from-emerald-500/10 to-transparent blur-3xl rounded-full scale-125 pointer-events-none" />
 </motion.div>
 </div>
 </div>
 </div>
 </header>
 );
};

export default LandingHero;
