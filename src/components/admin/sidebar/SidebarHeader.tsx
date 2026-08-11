"use client";
import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SidebarHeaderProps {
  isOpen: boolean;
}

export function SidebarHeader({ isOpen }: SidebarHeaderProps) {
  return (
    <Link
      href="/admin/dashboard"
      className={cn(
        "h-20 flex items-center shrink-0 hover:bg-accent transition-colors group border-b border-border",
        isOpen ? "px-6" : "px-0 justify-center",
      )}
    >
      <div
        className={cn(
          "flex items-center transition-all duration-200",
          isOpen ? "gap-3" : "gap-0",
        )}
      >
        <div className="flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <img
            src="/assets/logo/shero.svg"
            alt="SHERO Logo"
            width={30}
            height={30}
            fetchPriority="high"
            decoding="async"
            className="h-8 w-auto"
            suppressHydrationWarning
          />
        </div>
        <span
          className={cn(
            "text-foreground font-bold text-sm whitespace-nowrap transition-all duration-200",
            isOpen
              ? "opacity-100 translate-x-0 w-auto"
              : "opacity-0 -translate-x-4 pointer-events-none w-0 overflow-hidden",
          )}
        >
          SHERO TECHNOLOGIES
        </span>
      </div>
    </Link>
  );
}
