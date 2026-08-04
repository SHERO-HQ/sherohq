"use client";
import { motion } from "motion/react";
import { MessageSquare, ArrowRight, Calendar, Clock, Video } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const ConsultationHero = () => {
  const scrollToScheduler = () => {
    const scheduler = document.getElementById("scheduler-section");
    if (scheduler) {
      scheduler.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full py-24 overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Dot Pattern Background (muted) */}
      <div className="absolute inset-0 pattern-dots opacity-80 pointer-events-none" />

      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 40, 0],
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-secondary-500/10 dark:bg-brand-secondary-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-slate-50 to-transparent dark:from-slate-950 pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Column: Text Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col items-start text-left"
          >
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-[.65rem] font-semibold text-brand-secondary-600 dark:text-brand-secondary-400 bg-brand-secondary-100 dark:bg-brand-secondary-200/20 border border-brand-secondary-500/40 dark:border-brand-secondary-800/50 rounded uppercase tracking-wider transition-colors duration-300 shadow-sm">
                <MessageSquare className="size-4" />
                <span>Expert Guidance</span>
              </div>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] leading-[1.1] font-semibold text-slate-900 dark:text-slate-100 mb-6 tracking-tight"
            >
              Accelerate Your <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary-700 to-brand-secondary-600 dark:from-brand-primary-500 dark:to-brand-secondary-400">
                Technical Vision
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-xl mb-10 leading-relaxed"
            >
              Book a focused session to align technology decisions, delivery
              timelines, and growth priorities with your team. Turn complex
              challenges into actionable roadmaps.
            </motion.p>

            <motion.div variants={itemVariants}>
              <button
                onClick={scrollToScheduler}
                className="group inline-flex items-center justify-center gap-2 px-8 py-3 text-base font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-full shadow hover:shadow-xl hover:bg-slate-800 dark:hover:bg-slate-100 hover:-translate-y-0.5 transition-all duration-300"
              >
                Book a Session
                <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.div>

          {/* Right Column: Visual Component */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Central Glow */}
              <div className="absolute inset-0 bg-linear-to-tr from-brand-primary-500/20 to-brand-secondary-500/20 rounded-full blur-3xl opacity-50" />
              
              {/* Card 1: Main Session Card */}
              <motion.div 
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[20%] left-0 right-12 z-20 bg-white dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-6 rounded shadow flex items-start gap-5"
              >
                <div className="size-14 rounded bg-brand-primary-50 dark:bg-brand-primary-900/30 flex items-center justify-center shrink-0 border border-brand-primary-100 dark:border-brand-primary-800/50">
                  <Calendar className="size-7 text-brand-primary-600 dark:text-brand-primary-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Strategy Session</h3>
                  <div className="flex items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5"><Clock className="size-4" /> 30 Min</span>
                    <span className="flex items-center gap-1.5"><Video className="size-4" /> Video Call</span>
                  </div>
                </div>
              </motion.div>

              {/* Card 2: Status/Participant Card */}
              <motion.div 
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-[25%] left-16 right-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 p-5 rounded shadow flex items-center justify-between"
              >
                 <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      <div className="size-10 rounded-full border-2 border-white dark:border-slate-900 bg-brand-secondary-100 dark:bg-brand-secondary-800 flex items-center justify-center text-sm font-bold text-brand-secondary-600 dark:text-brand-secondary-200 shadow-sm z-10">S</div>
                      <div className="size-10 rounded-full border-2 border-white dark:border-slate-900 bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-200 shadow-sm z-0">You</div>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Aligning on architecture...</span>
                 </div>
                 <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              </motion.div>
              
              {/* Decorative Background Elements */}
              <div className="absolute top-[10%] right-[10%] size-20 rounded-full bg-brand-secondary-400/20 dark:bg-brand-secondary-500/10 blur-xl" />
              <div className="absolute bottom-[10%] left-[10%] size-32 rounded-full bg-blue-400/20 dark:bg-blue-500/10 blur-xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ConsultationHero;
