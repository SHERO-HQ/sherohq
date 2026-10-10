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
                href="/consultation"
                className="inline-flex items-center px-4 py-2 h-9 rounded bg-brand-secondary-800 text-white text-sm font-medium hover:bg-brand-secondary-700 transition shadow-sm hover:shadow-md"
              >
                Book a free call
                <Phone className="w-4 h-4 ml-2" />
              </Link>
              <a
                href="https://wa.me/233548711582"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 h-9 rounded border border-emerald-600 text-emerald-700 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingFinalCTA;
