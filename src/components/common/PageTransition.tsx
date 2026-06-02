"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and initial mount, render children directly to guarantee no hydration freezes.
  // When mounted, render the children keyed by path to ensure state resets correctly per route
  // without the buggy unmounting exit animations of AnimatePresence.
  return <div key={pathname} className="min-h-screen">{children}</div>;
}

