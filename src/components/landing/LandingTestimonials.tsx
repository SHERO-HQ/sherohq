"use client";
import { useMemo } from "react";
import { UserCheck } from "lucide-react";
import { useTestimonials } from "@/hooks/queries/useTestimonials";
import { TestimonialCarousel } from "./testimonials/TestimonialCarousel";

interface LandingTestimonialsProps {
  limit?: number;
}

const LandingTestimonials = ({ limit }: LandingTestimonialsProps = {}) => {
  const { data, isLoading } = useTestimonials();

  const displayTestimonials = useMemo(() => {
    const t = data || [];
    return limit ? t.slice(0, limit) : t;
  }, [data, limit]);

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-slate-950 overflow-hidden relative border-t border-slate-200 dark:border-white/5 transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-brand-secondary-500/20 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-125 bg-brand-secondary-500/5 rounded-full blur-[60px] pointer-events-none transition-colors duration-300" />
      <div className="absolute inset-0 pattern-dots opacity-80 pointer-events-none" />

      <div className="container px-4 md:px-6 relative z-10 w-full mx-auto md:w-11/12 max-w-7xl">
        {(isLoading || displayTestimonials.length > 0) && (
          <div className="flex flex-col items-center justify-center gap-12 lg:gap-16">
            <div className="text-center max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-2 text-[9px] font-bold text-brand-secondary-600 dark:text-brand-secondary-400 bg-brand-secondary-100/80 dark:bg-brand-secondary-500/10 border border-brand-secondary-500/30 dark:border-brand-secondary-500/20 rounded uppercase tracking-wider transition-colors duration-300">
                <UserCheck className="size-4" />
                Client Voices
              </span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-6 transition-colors duration-300 leading-tight">
                Empowering Businesses, Innovators & Communities.
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 transition-colors duration-300 leading-relaxed">
                We believe technology exists to expand what's possible. See how
                we've partnered with forward-thinking organizations to build reliable
                infrastructure that removes barriers and creates opportunities.
              </p>
            </div>

            <TestimonialCarousel 
              isLoading={isLoading} 
              displayTestimonials={displayTestimonials} 
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default LandingTestimonials;
