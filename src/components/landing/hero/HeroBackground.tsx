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
  heroReady: boolean;
}

export const HeroBackground = ({
  motionEnabled,
  translateX,
  translateY,
  heroReady,
}: HeroBackgroundProps) => {
  return (
    <>
      <m.div
        style={
          motionEnabled
            ? { x: translateX, y: translateY, opacity: 0.9 }
            : { opacity: 0.9 }
        }
        animate={motionEnabled ? { opacity: [0.85, 0.95, 0.85] } : undefined}
        transition={
          motionEnabled
            ? { duration: 12, repeat: Infinity, ease: "easeInOut" }
            : undefined
        }
        className="absolute inset-0 pattern-dots pointer-events-none will-change-transform"
      />

      {heroReady && (
        <ParticleField count={5} colorVariant="single" opacity={0.12} animate />
      )}

      <div className="absolute top-0 left-0 right-0 h-36 bg-linear-to-b from-primary/8 to-transparent pointer-events-none" />
    </>
  );
};
