"use client";
import { m, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import dynamic from "next/dynamic";

const ParticleField = dynamic(
 () => import("@/components/common/ParticleField"),
 { ssr: false },
);

interface HeroBackgroundProps {
 enableMotion?: boolean;
 particleCount?: number;
 patternOpacity?: number;
 showOrbs?: boolean;
}

const HeroBackground: React.FC<HeroBackgroundProps> = ({
 enableMotion = false,
 particleCount = 0,
 patternOpacity = 0.35,
 showOrbs = true,
}) => {
 const mounted = useIsMounted();
 const prefersReducedMotion = useReducedMotion();
 const motionEnabled = enableMotion && mounted && !prefersReducedMotion;

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
 if (!motionEnabled) {
 return;
 }

 const handleGlobalMouseMove = (e: MouseEvent) => {
 const x = e.clientX / window.innerWidth - 0.5;
 const y = e.clientY / window.innerHeight - 0.5;
 mouseX.set(x);
 mouseY.set(y);
 };

 window.addEventListener("mousemove", handleGlobalMouseMove);
 return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
 }, [motionEnabled, mouseX, mouseY]);

 return (
 <div className="absolute inset-0 overflow-hidden pointer-events-none">
 {/* Background kinetic pattern */}
 <m.div
 style={motionEnabled ? { x: translateX, y: translateY, opacity: patternOpacity } : { opacity: patternOpacity }}
 className="absolute inset-0 pattern-dots"
 />

 {/* Particle Field */}
 {motionEnabled && particleCount > 0 && (
 <ParticleField count={particleCount} colorVariant="dual" opacity={0.8} animate />
 )}

 </div>
 );
};

export default HeroBackground;
