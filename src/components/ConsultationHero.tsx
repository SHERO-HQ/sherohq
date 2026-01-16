import { motion } from "motion/react";
import { MessageSquare } from "lucide-react";

const ConsultationHero = () => {
  return (
    <section className="relative w-full py-20 lg:py-32 overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 
              bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] 
              bg-[size:40px_40px]
              [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
      />

      {/* Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/20 dark:bg-emerald-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
            <MessageSquare className="w-4 h-4" />
            <span>Consultation</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-sora font-bold text-slate-900 dark:text-slate-100 mb-6 leading-tight">
            Let's Start a
            <br />
            <span className="bg-linear-to-r from-emerald-500 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Conversation
            </span>
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Ready to transform your ideas into reality? Schedule a consultation
            with our experts to discuss your project requirements and goals.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ConsultationHero;
