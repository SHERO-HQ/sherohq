"use client";
import { motion } from "motion/react";
import { MessageSquare } from "lucide-react";

const ConsultationHero = () => {
 return (
 <section className="relative w-full py-20 lg:py-24 overflow-hidden bg-slate-50 dark:bg-slate-950">
 {/* Dot Pattern Background */}
 <div className="absolute inset-0 pattern-dots opacity-45 dark:opacity-30 pointer-events-none" />

 {/* Gradient Orbs */}
 <div className="absolute inset-0 overflow-hidden pointer-events-none">
 <div className="absolute -top-20 left-1/4 w-96 h-96 bg-blue-500/8 dark:bg-blue-500/10 rounded-full blur-3xl" />
 <div className="absolute -top-20 right-1/4 w-96 h-96 bg-emerald-500/8 dark:bg-emerald-500/10 rounded-full blur-3xl" />
 </div>

 <div className="absolute top-0 left-0 right-0 h-28 bg-linear-to-b from-primary/8 to-transparent pointer-events-none" />

 <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 >
 <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 text-xs font-semibold text-emerald-600 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-500/40 dark:border-emerald-800/50 rounded uppercase tracking-wider">
 <MessageSquare className="size-4" />
 <span>Consultation</span>
 </div>

 <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-slate-100 mb-6 leading-tight tracking-tight">
 Let's Have A{" "} <br />
 <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary-700 to-brand-secondary-600 dark:from-brand-primary-500 dark:to-brand-secondary-400">
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
