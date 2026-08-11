"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { m } from "motion/react";

interface ChatFloatingTriggerProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  setIsMinimized: (val: boolean) => void;
}

export function ChatFloatingTrigger({
  isOpen,
  setIsOpen,
  setIsMinimized,
}: ChatFloatingTriggerProps) {
  if (isOpen) return null;

  return (
    <m.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        setIsOpen(true);
        setIsMinimized(false);
      }}
      className="fixed bottom-6 right-6 z-50 flex items-center p-3.5 bg-foreground text-background rounded-full shadow-xl hover:shadow-2xl border border-border/80 transition-all duration-300 group cursor-pointer"
      aria-label="Ask Shero AI Assistant"
      title="Ask Shero AI (⌘K)"
    >
      <div className="relative flex items-center justify-center shrink-0">
        <Sparkles className="w-5 h-5 text-brand-secondary animate-pulse" />
      </div>
      <div className="max-w-0 opacity-0 overflow-hidden group-hover:max-w-[180px] group-hover:opacity-100 group-hover:ml-2.5 transition-all duration-300 ease-out flex items-center gap-2 whitespace-nowrap">
        <span className="text-sm font-semibold tracking-tight">Ask Shero AI</span>
        <span className="text-[10px] bg-background/20 text-background px-1.5 py-0.5 rounded font-mono font-bold">
          ⌘K
        </span>
      </div>
    </m.button>
  );
}
