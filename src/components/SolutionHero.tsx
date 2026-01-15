import { motion } from "framer-motion";
import { Code, Zap, Shield } from "lucide-react";

const SolutionsHero = () => {
  return (
    <section
      className="relative w-full py-20 lg:py-32 overflow-hidden
                      bg-linear-to-b from-slate-50 to-white 
                      dark:from-slate-950 dark:to-slate-900"
    >
      {/* Animated Grid Background */}
      <div
        className="absolute inset-0 
                    bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] 
                    bg-[size:40px_40px]
                    [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_100%)]"
      />

      {/* Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/20 dark:bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Breadcrumb */}
        <motion.div
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
        </motion.div>

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
                     text-sm font-semibold mb-6"
          >
            <Code className="w-4 h-4" />
            <span>Software & IT Solutions</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-sora font-bold text-slate-900 dark:text-slate-100 mb-6 leading-tight"
          >
            Custom Software That
            <br />
            <span className="bg-linear-to-r from-blue-600 via-emerald-500 to-indigo-600 bg-clip-text text-transparent">
              Powers Your Growth
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-slate-600 dark:text-slate-400 mb-12 leading-relaxed"
          >
            From custom web and mobile applications to SaaS platforms and IT
            infrastructure, we build technology solutions tailored to your
            business needs.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="#request-quote"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded
                       bg-emerald-600 text-white font-semibold
                       hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-500/30
                       hover:-translate-y-1
                       transition-all duration-300
                       w-full sm:w-auto"
            >
              <span>Request a Quote</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded
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
