"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return children directly during SSR and initial client hydration
    // to guarantee no blank page or styling freezes on initial load.
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
        transition={{
          duration: prefersReducedMotion ? 0.01 : 0.16,
          ease: "easeOut",
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

