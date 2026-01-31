import { motion } from "motion/react";
import { Code, Zap, Shield, ArrowRight } from "lucide-react";

const SolutionsHero = () => {
  return (
    <section
      className="relative w-full py-20 lg:py-22 overflow-hidden
                      bg-linear-to-t from-slate-100 to-slate-50 
                      dark:from-slate-950 dark:to-slate-900"
    >
      {/* Dot Pattern Background */}
      <div className="absolute inset-0 pattern-dots opacity-30 dark:opacity-20 pointer-events-none" />

      {/* Gradient Orbs - Blue/Cyan theme for Solutions */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/2 dark:bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/2 dark:bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Breadcrumb */}
        {/* <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-8"
        >
          <a
            href="/"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Home
          </a>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-100 font-medium">
            Solutions
          </span>
        </motion.div> */}

        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                     bg-emerald-100 dark:bg-emerald-900/30 
                     border border-emerald-200 dark:border-emerald-800
                     text-emerald-700 dark:text-emerald-300
                     text-xs font-semibold mb-6 uppercase"
          >
            <Code className="size-4" />
            <span>Software & IT Solutions</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-5xl lg:text-6xl font-sora font-bold text-slate-900 dark:text-slate-100 mb-6 leading-tight"
          >
            Performance-Driven{" "}
            <span className="text-3xl md:text-6xl lg:text-7xl text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400">
              Solutions
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-base text-slate-600 dark:text-slate-400 mb-12 leading-relaxed max-w-3xl mx-auto"
          >
            We bridges the gap between digital strategy and physical
            infrastructure. From custom software engineering to complex server
            and network configurations, we power your transformation.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="/consultation"
              className="inline-flex items-center justify-center gap-2 px-8 py-2 rounded
                       bg-emerald-600 text-white font-semibold
                       hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-500/30
                       hover:-translate-y-1
                       transition-all duration-300
                       w-full sm:w-auto"
            >
              <span>Request a Quote</span>
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-2 px-8 py-2 rounded
                       border-2 border-slate-300 dark:border-slate-700
                       text-slate-700 dark:text-slate-300 font-semibold
                       hover:border-emerald-500 dark:hover:border-emerald-500
                       hover:text-emerald-600 dark:hover:text-emerald-400
                       transition-all duration-300
                       w-full sm:w-auto text-center"
            >
              <span>View Services</span>
            </a>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-8 mt-16 text-sm text-slate-600 dark:text-slate-400"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Fast Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Secure & Scalable</span>
            </div>
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Modern Tech Stack</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SolutionsHero;
