"use client";
import React from "react";
import { m, MotionValue } from "motion/react";
import dynamic from "next/dynamic";

const ParticleField = dynamic(
  () => import("@/components/common/ParticleField"),
  { ssr: false },
);

interface HeroBackgroundProps {
  motionEnabled: boolean;
  translateX: MotionValue<number>;
  translateY: MotionValue<number>;
}

export const HeroBackground = ({
  motionEnabled,
  translateX,
  translateY,
}: HeroBackgroundProps) => {
  return (
    <>
      {/* Interactive Dot Grid Pattern */}
      <m.div
        style={
          motionEnabled
            ? { x: translateX, y: translateY }
            : undefined
        }
        className="absolute inset-0 pattern-dots opacity-80 dark:opacity-60 pointer-events-none will-change-transform"
      />

      {/* Lightweight Ambient Particles */}
      <ParticleField count={6} colorVariant="single" opacity={0.15} animate />

      {/* Top Ambient Linear Glow */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-linear-to-b from-brand-primary-500/10 via-brand-secondary-500/5 to-transparent pointer-events-none" />
    </>
  );
};
