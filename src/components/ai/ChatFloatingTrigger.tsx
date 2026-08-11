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
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-brand-primary text-white rounded-full shadow-lg hover:shadow-xl hover:bg-brand-primary/90 transition-all group"
      aria-label="Open AI Assistant"
    >
      <div className="relative flex items-center justify-center">
        <Sparkles className="w-5 h-5 text-brand-secondary animate-pulse" />
      </div>
      <span className="text-sm font-semibold tracking-tight">Ask Shero AI</span>
      <span className="hidden group-hover:inline-block text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">
        ⌘K
      </span>
    </m.button>
  );
}
