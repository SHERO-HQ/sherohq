"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { m, AnimatePresence } from "motion/react";
import { FadeInView } from "@/components/motion/AnimateSection";
import {
  Quote,
  UserCheck,
  Star,
  Rocket,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { useTestimonials } from "@/hooks/queries/useTestimonials";
import AppImage from "@/components/common/AppImage";

// Helper to get initials
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

interface AboutTestimonialsProps {
  limit?: number;
}

const AboutTestimonials = ({ limit }: AboutTestimonialsProps = {}) => {
  const { data, isLoading } = useTestimonials();
  
  const displayTestimonials = useMemo(() => {
    const t = data || [];
    return limit ? t.slice(0, limit) : t;
  }, [data, limit]);
  
  const [cards, setCards] = useState<any[]>([]);

  useEffect(() => {
    // If we have few testimonials, duplicate them so the stack always has enough depth
    if (displayTestimonials.length > 0 && displayTestimonials.length < 4) {
      const duplicated = [...displayTestimonials, ...displayTestimonials, ...displayTestimonials].map((item, i) => ({
        ...item,
        uniqueId: `${item.id}-${i}`
      }));
      setCards(duplicated);
    } else {
      const mapped = displayTestimonials.map((item, i) => ({ ...item, uniqueId: item.id ? item.id.toString() : `fallback-${i}` }));
      setCards(mapped);
    }
  }, [displayTestimonials]);

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

  // Smooth Auto-rotate
  useEffect(() => {
    if (cards.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [handleNext, cards.length, isHovered]);

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-slate-950 overflow-hidden relative border-t border-slate-200 dark:border-white/5 transition-colors duration-300">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-brand-secondary-500/20 to-transparent" />

      {/* Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-125 bg-brand-secondary-500/5 rounded-full blur-[100px] pointer-events-none transition-colors duration-300" />

      <div className="container px-4 md:px-6 relative z-10 w-full mx-auto md:w-11/12 max-w-7xl">
        {(isLoading || displayTestimonials.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center mb-16">
            
            {/* Header Content */}
            <div className="text-center lg:text-left max-w-xl mx-auto lg:mx-0">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-2 text-[9px] font-bold text-brand-secondary-600 dark:text-brand-secondary-400 bg-brand-secondary-100/80 dark:bg-brand-secondary-500/10 border border-brand-secondary-500/30 dark:border-brand-secondary-500/20 rounded uppercase tracking-wider transition-colors duration-300">
                <UserCheck className="size-4" />
                Client Voices
              </span>
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-3 transition-colors duration-300 leading-tight">
                Trusted by Leaders across Africa.
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 transition-colors duration-300 leading-relaxed">
                We believe technology exists to expand what's possible. See how we've partnered with innovators to build enterprise-grade infrastructure that removes barriers and creates opportunities.
              </p>
              
              <div className="flex items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={handlePrev}
                  className="cursor-pointer p-3 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-brand-secondary-600 dark:hover:text-white hover:border-brand-secondary-500 transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="cursor-pointer p-3 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-brand-secondary-600 dark:hover:text-white hover:border-brand-secondary-500 transition-colors shadow-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stack of Cards UI */}
            <div 
              className="relative w-full max-w-lg mx-auto h-[450px] sm:h-[400px] flex items-center justify-center perspective-[1000px]"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {isLoading ? (
                <div className="w-full h-full bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-white/5 animate-pulse" />
              ) : (
                <AnimatePresence mode="popLayout">
                  {cards.slice(0, 3).map((item, index) => {
                    const isFront = index === 0;
                    
                    return (
                      <m.div
                        key={item.uniqueId || item.id || `card-${index}`} // absolutely guarantee a non-empty key
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
                          zIndex: 50,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 250,
                          damping: 25,
                          mass: 0.8,
                        }}
                        className={`absolute w-full top-0 left-0 right-0 origin-top shadow-xl ${
                          isFront ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'
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
                        <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded border border-slate-200/80 dark:border-slate-800 flex flex-col relative group h-full min-h-[320px]">
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
                              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                                {item.author}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                {item.author === "Anonymous" ? "Verified Feedback" : (
                                  <>
                                    {item.role}
                                    {item.company ? `, ${item.company}` : ""}
                                  </>
                                )}
                              </p>
                              {(item.externalSource === "trustpilot" || typeof item.rating === "number") && (
                                <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                                  {typeof item.rating === "number" && (
                                    <span className="inline-flex items-center gap-1 rounded bg-amber-100 dark:bg-amber-500/10 px-1.5 py-0.5 text-amber-700 dark:text-amber-400 font-semibold">
                                      <Star className="h-3 w-3 fill-current" />
                                      {Number.isInteger(item.rating) ? item.rating : item.rating.toFixed(1)}/5
                                    </span>
                                  )}
                                  {item.externalSource === "trustpilot" && (
                                    <a
                                      href={item.reviewUrl || "https://www.trustpilot.com"}
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
                      </m.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </div>
        )}

        {/* Sales CTA */}
        <div className="cursor-pointer text-center relative group mt-10">
          <FadeInView direction="up" delay={0}>
            <div className="inline-flex relative flex-col items-center gap-4 p-8 md:p-10 rounded bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-lg dark:shadow-md overflow-hidden max-w-2xl mx-auto w-full transition duration-300">
              <div className="absolute inset-0 pattern-dots pattern-brand-secondary-500/10 pattern-opacity-100 pattern-size-4 opacity-80 -z-10" />

              <div className="p-4 bg-brand-secondary-500/10 rounded-full text-brand-secondary-600 dark:text-brand-secondary-400 border border-brand-secondary-500/20 transition-colors duration-300 mb-2">
                <Rocket className="w-8 h-8" />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-3 transition-colors duration-300">
                  Ready to Redefine Possible?
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg mb-8 transition-colors duration-300 max-w-lg mx-auto">
                  Partner with us to build enterprise-grade infrastructure that scales with your ambition.
                </p>
                <Link
                  href="/contact-us"
                  className="cursor-pointer px-8 py-3 bg-brand-secondary-600 text-sm text-white rounded font-bold hover:bg-brand-secondary-700 transition-all shadow shadow-brand-secondary-500/20 hover:-translate-y-1 hover:shadow-brand-secondary-500/40 w-fit inline-block"
                >
                  Let's Build Together
                </Link>
              </div>
            </div>
          </FadeInView>
        </div>
      </div>
    </section>
  );
};

export default AboutTestimonials;
