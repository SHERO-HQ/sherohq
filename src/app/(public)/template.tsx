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
    <div className="min-h-[100dvh]">
      {children}
    </div>
  );
}
