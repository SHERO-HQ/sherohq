"use client";

import Link from "next/link";
import { ArrowRight, Calendar, HandshakeIcon, Zap } from "lucide-react";
import { FadeInView } from "@/components/motion/AnimateSection";
import { SectionBadge } from "@/components/common/SectionBadge";

const AboutCTA = () => {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-slate-950 relative overflow-hidden transition-colors ">
    

      <div className="container px-4 md:px-6 relative z-10 w-full mx-auto md:w-11/12 max-w-5xl">
        <FadeInView direction="up" delay={0.1}>
          <div className="relative overflow-hidden rounded border border-slate-200/90 dark:border-slate-800/90 p-8 sm:p-12 md:p-16 text-center shadow-xl shadow-slate-900/5 dark:shadow-black/30 transition-all ">
            {/* Subtle background dot texture */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pattern-dots opacity-40 dark:opacity-20 pointer-events-none"
            />

            {/* Glowing Accent Border Top */}

            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
              {/* Badge */}
              <SectionBadge icon={HandshakeIcon} className="mb-6">
                Let's Collaborate
              </SectionBadge>

              {/* Heading */}
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-4 transition-colors leading-tight">
                Ready to Redefine <span className="text-brand-secondary-600 dark:text-brand-secondary-400">Possible?</span>
              </h2>

              {/* Description */}
              <p className="text-slate-600 dark:text-slate-300 mb-8 sm:mb-10 transition-colors max-w-xl mx-auto leading-relaxed">
                Partner with us for custom software engineering, commercial hardware supply, and dependable on-site technical support.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                <Link
                  href="/contact-us"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-secondary-700 hover:bg-brand-secondary-800 active:bg-brand-secondary-900 text-white rounded font-semibold text-sm transition-all shadow-sm hover:shadow hover:-translate-y-0.5 group focus:outline-none focus:ring-2 focus:ring-brand-secondary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                >
                  <span>Let's Build Together</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/consultation"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200/90 dark:hover:bg-slate-700/80 active:bg-slate-300/80 dark:active:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded font-semibold text-sm transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
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
