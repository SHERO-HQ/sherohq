"use client";
import { motion } from "motion/react";
import { MessageSquare } from "lucide-react";
import HeroBackground from "@/components/common/HeroBackground";

const ConsultationHero = () => {
  return (
    <section className="relative w-full py-20 lg:py-24 overflow-hidden bg-slate-50 dark:bg-slate-950">
      <HeroBackground />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 text-xs font-semibold text-emerald-600 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-500/40 dark:border-emerald-800/50 rounded-full uppercase tracking-wider">
            <MessageSquare className="size-4" />
            <span>Consultation Session</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-sora font-bold text-slate-900 dark:text-slate-100 mb-6 leading-tight tracking-tight">
            Let's Have a{" "} <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400">
              Conversation
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            Book a focused session to align technology decisions, delivery
            timelines, and growth priorities with your team.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ConsultationHero;
