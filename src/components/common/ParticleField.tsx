"use client";
import { useState } from "react";
import { motion } from "motion/react";

interface Props {
  count?: number;
  /** "single" = all use bg-primary; "dual" = alternates blue/emerald */
  colorVariant?: "single" | "dual";
  opacity?: number;
}

/**
 * Decorative animated particle field.
 * Imported with `dynamic(..., { ssr: false })` so Math.random() never runs
 * on the server — eliminating any hydration mismatch.
 */
export default function ParticleField({
  count = 8,
  colorVariant = "single",
  opacity = 0.2,
}: Props) {
  const [particles] = useState(() =>
    Array.from({ length: count }, (_, idx) => ({
      id: idx,
      x: Math.random() * 100 + "%",
      y: Math.random() * 100 + "%",
      opacity: Math.random() * 0.2 + 0.1,
      duration: Math.random() * 20 + 30,
    })),
  );

  const colorClass = (id: number) =>
    colorVariant === "dual"
      ? id % 2 === 0
        ? "bg-blue-500"
        : "bg-emerald-500"
      : "bg-primary";

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity }}
      transition={{ duration: 1.2, ease: "easeIn" }}
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: p.x, y: p.y, opacity: p.opacity }}
          animate={{ y: [null, "-20%"], opacity: [0, p.opacity, 0] }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
          }}
          className={`absolute w-1 h-1 rounded-full ${colorClass(p.id)}`}
        />
      ))}
    </motion.div>
  );
}
