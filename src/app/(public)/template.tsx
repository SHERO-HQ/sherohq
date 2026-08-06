"use client";

import { m } from "motion/react";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Do not animate admin routes to keep dashboard snappy
  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        mass: 1,
      }}
      className="min-h-[100dvh]"
    >
      {children}
    </m.div>
  );
}
