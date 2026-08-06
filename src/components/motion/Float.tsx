"use client";
import { m } from "motion/react";
import type { ReactNode } from "react";

interface FloatProps {
 children: ReactNode;
 duration?: number;
 distance?: number;
 delay?: number;
 className?: string;
 rotate?: number;
}

/**
 * Float: Adds a persistent, subtle floating animation to decorative elements.
 * Optimized for performance using transform and opacity.
 */
export const Float = ({
 children,
 duration = 4,
 distance = 10,
 delay = 0,
 className = "",
 rotate = 0,
}: FloatProps) => {
 return (
 <m.div
 animate={{
 y: [0, -distance, 0],
 rotate: [rotate, rotate + 2, rotate - 2, rotate],
 }}
 transition={{
 duration,
 repeat: Infinity,
 repeatType: "reverse",
 ease: "easeInOut",
 delay,
 }}
 className={className}
 >
 {children}
 </m.div>
 );
};

export default Float;
