"use client";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef, useEffect } from "react";
import { useIsMounted } from "@/hooks/useIsMounted";
import dynamic from "next/dynamic";

const ParticleField = dynamic(
 () => import("@/components/common/ParticleField"),
 { ssr: false },
);

interface HeroBackgroundProps {
 particleCount?: number;
 patternOpacity?: number;
 showOrbs?: boolean;
}

const HeroBackground: React.FC<HeroBackgroundProps> = ({
 particleCount = 8,
 patternOpacity = 0.5,
 showOrbs = true,
}) => {
 const containerRef = useRef<HTMLDivElement>(null);
 const mounted = useIsMounted();

 // Mouse Tracking for Kinetic Effects
 const mouseX = useMotionValue(0);
 const mouseY = useMotionValue(0);

 // Spring physics
 const springConfig = { damping: 25, stiffness: 150 };
 const smoothX = useSpring(mouseX, springConfig);
 const smoothY = useSpring(mouseY, springConfig);

 // Parallax transforms
 const translateX = useTransform(smoothX, [-0.5, 0.5], [-10, 10]);
 const translateY = useTransform(smoothY, [-0.5, 0.5], [-10, 10]);

 useEffect(() => {
 const handleGlobalMouseMove = (e: MouseEvent) => {
 const x = e.clientX / window.innerWidth - 0.5;
 const y = e.clientY / window.innerHeight - 0.5;
 mouseX.set(x);
 mouseY.set(y);
 };

 window.addEventListener("mousemove", handleGlobalMouseMove);
 return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
 }, [mouseX, mouseY]);

 return (
 <div className="absolute inset-0 overflow-hidden pointer-events-none">
 {/* Background kinetic pattern */}
 <motion.div
 style={{ x: translateX, y: translateY, opacity: patternOpacity }}
 className="absolute inset-0 pattern-dots"
 />

 {/* Particle Field */}
 {mounted && (
 <ParticleField count={particleCount} colorVariant="dual" opacity={0.15} />
 )}

 {/* Gradient Orbs */}
 {showOrbs && (
 <div className="absolute inset-0">
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-500/5 dark:bg-emerald-500/5 blur-[100px] rounded-full" />
 <div className="absolute top-1/2 left-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-500/5 dark:bg-blue-500/5 blur-[80px] rounded-full translate-x-10" />
 </div>
 )}

 {/* Bottom Fade */}
 <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-white dark:to-slate-950" />
 </div>
 );
};

export default HeroBackground;
