"use client";

import React from "react";
import { m } from "motion/react";
import { CheckCircle2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeedbackSuccessViewProps {
  handleReset: () => void;
}

export function FeedbackSuccessView({ handleReset }: FeedbackSuccessViewProps) {
  return (
    <m.div
      key="success-step"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 py-8 sm:py-20 text-center space-y-6 sm:space-y-8"
    >
      <div className="relative">
        <m.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="h-24 w-24 sm:h-32 sm:w-32 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20"
        >
          <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 text-emerald-500" />
        </m.div>
        <m.div
          animate={{ scale: [1, 1.4, 1], opacity: [0, 0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-emerald-400 rounded-full"
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-3xl font-bold uppercase tracking-tighter text-slate-900 dark:text-white">
          Gratitude!
        </h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-65 font-medium leading-relaxed">
          Your input has been secured. We truly appreciate the time you took to
          help us improve.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-60">
        <Button
          onClick={handleReset}
          variant="outline"
          className="w-full h-12 rounded font-bold uppercase tracking-widest text-xs border-slate-200 dark:border-white/10"
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Write Another
        </Button>
      </div>
    </m.div>
  );
}
