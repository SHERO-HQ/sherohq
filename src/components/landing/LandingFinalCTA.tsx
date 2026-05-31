"use client";

import Link from "next/link";
import { Phone, Sparkles } from "lucide-react";

const LandingFinalCTA = () => {
  return (
    <section className="w-full py-6 bg-transparent">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 bg-white/60 dark:bg-slate-900/60 rounded p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Ready to get started?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Book a short call and we’ll suggest a practical next step.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/contact-us"
              className="inline-flex items-center px-4 py-2 h-9 rounded bg-brand-secondary-600 text-white text-sm font-medium hover:bg-brand-secondary-500 transition"
            >
              Book a free call
                <Phone className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingFinalCTA;
