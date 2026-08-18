"use client";
import React from "react";
import { Quote, Star } from "lucide-react";
import AppImage from "@/components/common/AppImage";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

export interface TestimonialCardProps {
  item: any;
}

export const TestimonialCard = ({ item }: TestimonialCardProps) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded border border-slate-200/80 dark:border-slate-800 flex flex-col relative group h-full min-h-80">
      <div className="absolute top-6 right-6 transition-transform duration-300">
        <Quote className="size-8 text-brand-secondary-500/20" />
      </div>

      <blockquote className="text-slate-800 dark:text-slate-200 relative z-10 font-medium leading-relaxed pt-2">
        {item.quote}
      </blockquote>

      <div className="mt-auto flex items-center gap-4 relative z-10 pt-6 border-t border-slate-100 dark:border-slate-800/50">
        {/* Avatar */}
        <div className="relative w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shrink-0 ring-1 ring-slate-200 dark:ring-slate-800">
          {item.image ? (
            <AppImage
              src={item.image}
              alt={item.author}
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : item.author === "Anonymous" ? (
            <AppImage
              src={`https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(item.id || item.quote)}&backgroundColor=0066ff,0055ff,0044ff`}
              alt="Anonymous"
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-bold text-xs tracking-wider">
              {getInitials(item.author)}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
            {item.author}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            {item.author === "Anonymous" ? (
              "Verified Feedback"
            ) : (
              <>
                {item.role}
                {item.company ? `, ${item.company}` : ""}
              </>
            )}
          </p>
          {(item.externalSource === "trustpilot" ||
            typeof item.rating === "number") && (
            <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
              {typeof item.rating === "number" && (
                <span className="inline-flex items-center gap-1 rounded bg-amber-100 dark:bg-amber-500/10 px-1.5 py-0.5 text-amber-700 dark:text-amber-400 font-semibold">
                  <Star className="h-3 w-3 fill-current" />
                  {Number.isInteger(item.rating)
                    ? item.rating
                    : item.rating.toFixed(1)}
                  /5
                </span>
              )}
              {item.externalSource === "trustpilot" && (
                <a
                  href={
                    item.reviewUrl ||
                    "https://www.trustpilot.com"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded bg-blue-100 dark:bg-blue-500/10 px-1.5 py-0.5 text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors"
                >
                  Via Trustpilot
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
