import { motion } from "motion/react";
import { BadgeCheck, Package, ShoppingBag, TruckElectric } from "lucide-react";

const ProductHero = () => {
  return (
    <section className="relative w-full py-20 lg:py-24 overflow-hidden dark:bg-slate-950 bg-slate-50">
      {/* Dot Pattern Background */}
      <div className="absolute inset-0 pattern-dots opacity-30 dark:opacity-20 pointer-events-none" />

      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[100px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[100px] animate-[pulse_8s_ease-in-out_infinite_2s]" />
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 uppercase dark:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/20 text-sm font-semibold text-emerald-600 dark:text-emerald-200 mb-6 backdrop-blur-md">
            <ShoppingBag className="size-4" />
            <span>Official Store</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-sora font-bold dark:text-white text-slate-900 mb-6 tracking-tight">
            Premium{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400">
              Gear
            </span>
          </h1>
          <p className="text-base dark:text-slate-400 text-slate-700 max-w-2xl mx-auto leading-relaxed mb-10">
            Curated hardware and accessories for the modern professional.
            Elevate your workspace with our selection of high-performance tools.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xs dark:text-slate-400 text-slate-600">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-500" />
              <span>In Stock & Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <TruckElectric className="w-4 h-4 text-blue-500" />
              <span>Fast Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-purple-500" />
              <span>Official Warranty</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductHero;
