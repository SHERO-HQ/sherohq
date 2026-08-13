"use client";
import React, { useState, useCallback, useRef } from "react";
import { m, AnimatePresence } from "motion/react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useVisibleInterval } from "@/hooks/useVisibleInterval";
import { TestimonialCard } from "./TestimonialCard";

interface TestimonialCarouselProps {
  isLoading: boolean;
  displayTestimonials: any[];
}

export const TestimonialCarousel = ({ isLoading, displayTestimonials }: TestimonialCarouselProps) => {
  const [prevTestimonials, setPrevTestimonials] = useState(displayTestimonials);
  const [cards, setCards] = useState<any[]>(() => {
    if (displayTestimonials.length > 0 && displayTestimonials.length < 4) {
      return [
        ...displayTestimonials,
        ...displayTestimonials,
        ...displayTestimonials,
      ].map((item, i) => ({
        ...item,
        uniqueId: `${item.id}-${i}`,
      }));
    }
    return displayTestimonials.map((item, i) => ({
      ...item,
      uniqueId: item.id ? item.id.toString() : `fallback-${i}`,
    }));
  });

  if (displayTestimonials !== prevTestimonials) {
    setPrevTestimonials(displayTestimonials);
    if (displayTestimonials.length > 0 && displayTestimonials.length < 4) {
      setCards(
        [
          ...displayTestimonials,
          ...displayTestimonials,
          ...displayTestimonials,
        ].map((item, i) => ({
          ...item,
          uniqueId: `${item.id}-${i}`,
        })),
      );
    } else {
      setCards(
        displayTestimonials.map((item, i) => ({
          ...item,
          uniqueId: item.id ? item.id.toString() : `fallback-${i}`,
        })),
      );
    }
  }

  const [isHovered, setIsHovered] = useState(false);

  const handleNext = useCallback(() => {
    if (cards.length <= 1) return;
    setCards((prev) => {
      const [first, ...rest] = prev;
      return [...rest, first];
    });
  }, [cards.length]);

  const handlePrev = useCallback(() => {
    if (cards.length <= 1) return;
    setCards((prev) => {
      const last = prev[prev.length - 1];
      const rest = prev.slice(0, prev.length - 1);
      return [last, ...rest];
    });
  }, [cards.length]);

  const sectionRef = useRef<HTMLDivElement>(null);
  useVisibleInterval(
    handleNext,
    cards.length <= 1 || isHovered ? null : 5000,
    sectionRef,
  );

  return (
    <div ref={sectionRef} className="w-full">
      <div
        className="relative w-full max-w-2xl mx-auto h-112.5 sm:h-112.4 flex items-center justify-center perspective-[1000px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isLoading ? (
          <div className="w-full h-full bg-slate-50/50 dark:bg-slate-900/40 rounded border border-slate-200 dark:border-white/5 animate-pulse" />
        ) : (
          <AnimatePresence mode="popLayout">
            {cards.slice(0, 3).map((item, index) => {
              const isFront = index === 0;

              return (
                <m.div
                  key={item.uniqueId || item.id || `card-${index}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: -40 }}
                  animate={{
                    opacity: 1 - index * 0.2,
                    scale: 1 - index * 0.05,
                    y: index * 24,
                    zIndex: cards.length - index,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 1.05,
                    filter: "blur(8px)",
                    zIndex: 10,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 250,
                    damping: 25,
                    mass: 0.8,
                  }}
                  className={`absolute w-full top-0 left-0 right-0 origin-top shadow-xl ${
                    isFront
                      ? "cursor-grab active:cursor-grabbing"
                      : "pointer-events-none"
                  }`}
                  drag={isFront ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={(e, { offset, velocity }) => {
                    if (offset.x > 100 || velocity.x > 500) {
                      handleNext();
                    } else if (offset.x < -100 || velocity.x < -500) {
                      handlePrev();
                    }
                  }}
                  onClick={isFront ? handleNext : undefined}
                >
                  <TestimonialCard item={item} />
                </m.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 -mt-20 relative z-30">
        <button
          onClick={handlePrev}
          aria-label="Previous testimonial"
          className="cursor-pointer p-3 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-brand-secondary-600 dark:hover:text-white hover:border-brand-secondary-500 transition-colors shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          aria-label="Next testimonial"
          className="cursor-pointer p-3 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-brand-secondary-600 dark:hover:text-white hover:border-brand-secondary-500 transition-colors shadow-sm"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
