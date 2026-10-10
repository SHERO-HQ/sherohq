"use client";

import Link from "next/link";
import { Phone } from "lucide-react";

const LandingFinalCTA = () => {
  return (
    <section className="w-full py-6 bg-transparent">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="relative overflow-hidden rounded border border-slate-200 bg-white/60 p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">

          <div className="relative z-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-left">
              <h3 className="inline-flex items-center gap-2 font-semibold text-slate-900 dark:text-white">

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
                className="inline-flex items-center px-4 py-2 h-9 rounded bg-brand-secondary-800 text-white text-sm font-medium hover:bg-brand-secondary-700 transition shadow-sm hover:shadow-md"
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
