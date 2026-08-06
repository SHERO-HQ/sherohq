"use client";
import Link from "next/link";
import { m, useMotionValue, useSpring, useTransform } from "motion/react";
import { StaggerContainer, StaggerItem } from "@/components/motion/AnimateSection";
import {
 ShoppingBag,
 MessageSquare,
 Handshake,
 Code,
 ArrowRight,
} from "lucide-react";
import { useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Pathway {
 icon: React.ReactNode;
 label: string;
 title: string;
 description: string;
 link: string;
 pattern: string;
 span: string;
 color: string;
}

const LandingPathways = () => {
 const paths: Pathway[] = [
 {
 icon: <ShoppingBag className="w-8 h-8" />,
 label: "For Everyone",
 title: "The Shop",
 description: "Premium hardware curated for the modern professional.",
 link: "/shop",
 pattern: "pattern-dots",
 span: "lg:col-span-4 lg:row-span-2",
 color: "text-brand-secondary-500",
 },
 {
 icon: <MessageSquare className="w-8 h-8" />,
 label: "For Businesses",
 title: "Consultation",
 description:
 "Strategic advisory to navigate your digital transformation.",
 link: "/consultation",
 pattern: "pattern-dots",
 span: "lg:col-span-8 lg:row-span-1",
 color: "text-blue-500",
 },
 {
 icon: <Handshake className="w-8 h-8" />,
 label: "For Partners",
 title: "Partnerships",
 description: "Join our global network of innovators.",
 link: "/partners",
 pattern: "pattern-dots",
 span: "lg:col-span-4 lg:row-span-1",
 color: "text-purple-500",
 },
 {
 icon: <Code className="w-8 h-8" />,
 label: "For Enterprise",
 title: "Solutions",
 description: "Custom software and managed IT infrastructure.",
 link: "/solutions",
 pattern: "pattern-dots",
 span: "lg:col-span-4 lg:row-span-1",
 color: "text-indigo-500",
 },
 ];

 return (
 <section className="relative w-full py-16 bg-slate-50 dark:bg-slate-950 overflow-hidden border-t border-slate-200 dark:border-slate-900">
 {/* Background decoration */}
 <div className="absolute top-0 right-0 w-1/3 h-full pattern-dots opacity-5 dark:opacity-10 pointer-events-none" />

 <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
 <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
 <div className="max-w-2xl">
 <span className="text-xs font-mono font-bold tracking-[0.3em] uppercase text-brand-secondary-600 dark:text-brand-secondary-400 mb-3 block">
 Direct Access
 </span>
 <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
 Navigate Shero
 </h2>
 <p className="text-sm text-slate-600 dark:text-slate-400">
 Tailored gateways to the technology solutions you need.
 </p>
 </div>
 <Link
 href="/solutions"
 className="group w-fit flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white border-b-2 border-brand-secondary-500 pb-1"
 >
 All Services{" "}
 <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
 </Link>
 </header>

 {/* Bento Grid — Staggered Scroll Reveal */}
 <StaggerContainer
   className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 grid-rows-2 gap-4"
   staggerDelay={0.12}
   threshold={0.06}
 >
 {paths.map((path) => (
 <StaggerItem key={path.label} yOffset={30} scale={0.97} className={`${path.span} col-span-1`}>
   <PathwayCard path={path} />
 </StaggerItem>
 ))}
 </StaggerContainer>
 </div>
 </section>
 );
};

const PathwayCard = ({ path }: { path: Pathway }) => {
 const cardRef = useRef<HTMLDivElement>(null);
 const prefersReducedMotion = useReducedMotion();

 // Mouse tilt logic — interactive only, not scroll-triggered
 const x = useMotionValue(0);
 const y = useMotionValue(0);

 const mouseXSpring = useSpring(x);
 const mouseYSpring = useSpring(y);

 const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
 const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);
 const glowBg = useTransform(
   [mouseXSpring, mouseYSpring],
   ([sx, sy]) =>
     `radial-gradient(400px circle at ${((sx as number) + 0.5) * 100}% ${((sy as number) + 0.5) * 100}%, rgba(16, 185, 129, 0.1), transparent)`,
 );

 const handleMouseMove = (e: React.MouseEvent) => {
 if (!cardRef.current || prefersReducedMotion) return;
 const rect = cardRef.current.getBoundingClientRect();
 const width = rect.width;
 const height = rect.height;
 const mouseX = e.clientX - rect.left;
 const mouseY = e.clientY - rect.top;

 const xPct = mouseX / width - 0.5;
 const yPct = mouseY / height - 0.5;

 x.set(xPct);
 y.set(yPct);
 };

 const handleMouseLeave = () => {
 if (prefersReducedMotion) return;
 x.set(0);
 y.set(0);
 };

 return (
 <m.div
 ref={cardRef}
 onMouseMove={handleMouseMove}
 onMouseLeave={handleMouseLeave}
 style={prefersReducedMotion ? {} : {
 rotateX,
 rotateY,
 transformStyle: "preserve-3d",
 }}
 className={`group relative min-h-60 p-6 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between overflow-hidden transition-colors hover:border-brand-secondary-500/50 hover:shadow shadow-brand-secondary-500/5 h-full`}
 >
 {/* Dynamic Glow Layer */}
 <m.div
 style={prefersReducedMotion ? {} : {
 background: glowBg,
 }}
 className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
 />

 {/* Pattern Background */}
 <div
 style={{ transform: "translateZ(-20px)" }}
 className={`absolute inset-0 ${path.pattern} opacity-50 group-hover:opacity-80 transition-opacity`}
 />

 <div className="relative z-10" style={{ transform: "translateZ(40px)" }}>
 <div
 className={`w-14 h-14 rounded bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 group-hover:scale-110 group-hover:text-brand-secondary-500 transition shadow-sm`}
 >
 {path.icon}
 </div>
 <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-500 dark:text-slate-500 mb-1.5 block">
 {path.label}
 </span>
 <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1.5">
 {path.title}
 </h3>
 <p className="text-slate-600 dark:text-slate-400 text-sm max-w-60 leading-relaxed">
 {path.description}
 </p>
 </div>

 <div
 className="relative z-10 pt-6"
 style={{ transform: "translateZ(30px)" }}
 >
 <Link
 href={path.link}
 className={`inline-flex items-center justify-center w-fit h-9 px-4 rounded border border-slate-200 dark:border-slate-800 text-slate-900! dark:text-white! group-hover:bg-brand-secondary-500 group-hover:border-brand-secondary-500 group-hover:text-white transition`}
 >
 <span className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">
 Explore
 </span>
 <ArrowRight className="w-5 h-5" />
 </Link>
 </div>
 </m.div>
 );
};

export default LandingPathways;
