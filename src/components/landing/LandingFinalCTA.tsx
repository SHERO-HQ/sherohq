"use client";

import Link from "next/link";
import { Phone, Sparkles } from "lucide-react";

const LandingFinalCTA = () => {
  return (
    <section className="w-full py-6 bg-transparent">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="absolute inset-0 pattern-dots opacity-90" />
        <div className="relative overflow-hidden rounded border border-slate-200 bg-white/60 p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-14 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-brand-secondary-400/20 blur-3xl dark:bg-brand-secondary-500/15" />
            <div className="absolute -right-14 -top-10 h-44 w-44 rounded-full bg-emerald-300/15 blur-3xl dark:bg-emerald-400/10" />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-left">
              <h3 className="inline-flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                <Sparkles className="w-4 h-4 inline-block text-emerald-500" />
                Ready to get started?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Book a short call and we’ll suggest a practical next step.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/feedback"
                className="hidden sm:inline-flex items-center px-4 py-2 h-9 rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand-secondary-600 dark:hover:text-brand-secondary-400 transition-colors"
              >
                Share your experience
              </Link>
              <Link
                href="/consultation"
                className="inline-flex items-center px-4 py-2 h-9 rounded bg-brand-secondary-800 text-white text-sm font-medium hover:bg-brand-secondary-700 transition shadow-sm hover:shadow-md shadow-brand-secondary-500/20"
              >
                Book a free call
                <Phone className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingFinalCTA;
