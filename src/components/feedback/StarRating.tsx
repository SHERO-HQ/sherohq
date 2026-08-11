"use client";

import React, { useState } from "react";
import { m, AnimatePresence } from "motion/react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const ratingOptions = [
  { value: 5, label: "Excellent", description: "Beyond expectations" },
  { value: 4, label: "Great", description: "Very satisfied" },
  { value: 3, label: "Good", description: "Met expectations" },
  { value: 2, label: "Fair", description: "Needs improvement" },
  { value: 1, label: "Poor", description: "Disappointing" },
];

interface StarRatingProps {
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean;
}

export function StarRating({ value, onChange, disabled }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <m.button
            key={star}
            type="button"
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.2, rotate: 5 } : {}}
            whileTap={!disabled ? { scale: 0.9 } : {}}
            onMouseEnter={() => !disabled && setHovered(star)}
            onMouseLeave={() => !disabled && setHovered(null)}
            onClick={() => onChange(star)}
            className={cn(
              "p-1.5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary-500 rounded-full",
              disabled && "cursor-not-allowed opacity-50",
            )}
            aria-label={`Rate ${star} stars`}
          >
            <Star
              className={cn(
                "h-6 w-6 sm:h-8 sm:w-8 transition-all duration-500",
                (hovered !== null ? star <= hovered : star <= value)
                  ? (hovered || value) <= 2
                    ? "fill-rose-500 text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                    : (hovered || value) === 3
                      ? "fill-amber-500 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                      : "fill-emerald-500 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                  : "text-slate-200 dark:text-slate-800",
              )}
            />
          </m.button>
        ))}
      </div>
      <div className="text-center h-10">
        <AnimatePresence mode="wait">
          <m.div
            key={hovered || value}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex flex-col"
          >
            <span className="text-sm font-medium uppercase text-slate-900 dark:text-white">
              {
                ratingOptions.find((opt) => opt.value === (hovered || value))
                  ?.label
              }
            </span>
            <span className="text-xs font-medium text-slate-400">
              {
                ratingOptions.find((opt) => opt.value === (hovered || value))
                  ?.description
              }
            </span>
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
