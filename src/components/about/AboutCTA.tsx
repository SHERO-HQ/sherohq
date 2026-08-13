"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Sparkles } from "lucide-react";
import { FadeInView } from "@/components/motion/AnimateSection";

const AboutCTA = () => {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
      {/* Background Ambient Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[320px] bg-brand-secondary-500/10 dark:bg-brand-secondary-500/15 rounded-full blur-[90px] transition-colors duration-300" />
        <div className="absolute top-1/3 left-1/4 w-[280px] h-[280px] bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-[80px] transition-colors duration-300" />
      </div>

      <div className="container px-4 md:px-6 relative z-10 w-full mx-auto md:w-11/12 max-w-5xl">
        <FadeInView direction="up" delay={0.1}>
          <div className="relative overflow-hidden rounded border border-slate-200/90 dark:border-slate-800/90 bg-linear-to-b from-white/90 via-slate-50/70 to-white/90 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-slate-900/80 backdrop-blur-xl p-8 sm:p-12 md:p-16 text-center shadow-xl shadow-slate-900/5 dark:shadow-black/30 transition-all duration-300">
            {/* Subtle background dot texture */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pattern-dots opacity-40 dark:opacity-20 pointer-events-none"
            />

            {/* Glowing Accent Border Top */}
            <div
              aria-hidden="true"
              className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-brand-secondary-500/40 to-transparent"
            />

            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
              {/* Badge */}
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-brand-secondary-600 dark:text-brand-secondary-400 bg-brand-secondary-100/80 dark:bg-brand-secondary-500/10 border border-brand-secondary-500/30 dark:border-brand-secondary-500/20 rounded transition-colors duration-300">
                <Sparkles className="size-3.5" />
                Let's Collaborate
              </span>

              {/* Heading */}
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-4 transition-colors duration-300 leading-tight">
                Ready to Redefine <span className="text-brand-secondary-600 dark:text-brand-secondary-400">Possible?</span>
              </h2>

              {/* Description */}
              <p className="text-slate-600 dark:text-slate-300 mb-8 sm:mb-10 transition-colors duration-300 max-w-xl mx-auto leading-relaxed">
                Partner with us to build purpose-driven technology and dependable infrastructure that scales seamlessly with your ambition.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                <Link
                  href="/contact-us"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-secondary-600 hover:bg-brand-secondary-700 active:bg-brand-secondary-800 text-white rounded font-semibold text-sm transition-all duration-200 shadow-md shadow-brand-secondary-500/20 hover:shadow-lg hover:shadow-brand-secondary-500/30 hover:-translate-y-0.5 group focus:outline-none focus:ring-2 focus:ring-brand-secondary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                >
                  <span>Let's Build Together</span>
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/consultation"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200/90 dark:hover:bg-slate-700/80 active:bg-slate-300/80 dark:active:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                >
                  <Calendar className="size-4 text-brand-secondary-600 dark:text-brand-secondary-400" />
                  <span>Book a Consultation</span>
                </Link>
              </div>
            </div>
          </div>
        </FadeInView>
      </div>
    </section>
  );
};

export default AboutCTA;
