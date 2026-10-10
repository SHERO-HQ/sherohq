"use client";
import React from "react";
import dynamic from "next/dynamic";

const ParticleField = dynamic(
  () => import("@/components/common/ParticleField"),
  { ssr: false },
);

export const HeroBackground = () => {
  return (
    <>
      {/* Interactive Dot Grid Pattern */}
      <div
        className="absolute inset-0 pattern-dots opacity-80 dark:opacity-60 pointer-events-none"
      />

      {/* Lightweight Ambient Particles */}
      <ParticleField count={6} colorVariant="single" opacity={0.15} animate />
    </>
  );
};
