import { motion } from "motion/react";
import { MessageSquare } from "lucide-react";

const ConsultationHero = () => {
  return (
    <section className="relative w-full py-20 lg:py-22 overflow-hidden bg-slate-100 dark:bg-slate-950">
      {/* Dot Pattern Background */}
      <div className="absolute inset-0 pattern-dots opacity-90 dark:opacity-90 pointer-events-none" />

      {/* Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/5 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/5 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-500/50 dark:border-emerald-800/50 rounded uppercase">
            <MessageSquare className="size-4" />
            <span>Consultation</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-sora font-bold text-slate-900 dark:text-slate-100 mb-6 leading-tight">
            Let's Start a
            <br />
            <span className="text-4xl md:text-6xl lg:text-7xl text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400">
              Conversation
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Ready to integrate complex infrastructure with custom software?
            Schedule a session to discuss how we build the technology frameworks
            that power your business growth.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ConsultationHero;
