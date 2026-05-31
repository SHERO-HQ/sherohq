"use client";
import { motion } from "motion/react";
import { MessageSquare } from "lucide-react";

const ConsultationHero = () => {
  return (
    <section className="relative w-full py-20 overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Dot Pattern Background (muted) */}
      <div className="absolute inset-0 pattern-dots opacity-80 pointer-events-none" />

      {/* Gradient Orbs (smaller, softer) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 left-1/4 w-80 h-80 bg-blue-500/4 dark:bg-blue-500/5 rounded-full blur-2xl" />
        <div className="absolute -top-16 right-1/4 w-80 h-80 bg-brand-secondary-500/4 dark:bg-brand-secondary-500/5 rounded-full blur-2xl" />
      </div>

      <div className="absolute top-0 left-0 right-0 h-28 bg-linear-to-b from-primary/8 to-transparent pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1 mb-3 text-[10px] font-semibold text-brand-secondary-600 dark:text-brand-secondary-400 bg-brand-secondary-100 dark:bg-brand-secondary-200/20 border border-brand-secondary-500/40 dark:border-brand-secondary-800/50 rounded uppercase transition-colors duration-300">
            <MessageSquare className="size-4" />
            <span>Consultation</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-900 dark:text-slate-100 mb-4 tracking-tight">
            Let's Have a <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary-700 to-brand-secondary-600 dark:from-brand-primary-500 dark:to-brand-secondary-400">
              Conversation
            </span>
          </h1>

          <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-6 leading-relaxed">
            Book a focused session to align technology decisions, delivery
            timelines, and growth priorities with your team.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ConsultationHero;
