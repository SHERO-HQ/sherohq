import { motion } from "motion/react";
import { BadgeCheck, Search, ShoppingBag, TruckElectric } from "lucide-react";
import { useState } from "react";

interface ProductHeroProps {
  onSearch?: (query: string) => void;
  onFilterToggle?: () => void;
}

const ProductHero: React.FC<ProductHeroProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <section className="relative w-full py-20 lg:py-24 overflow-hidden dark:bg-slate-950 bg-slate-200">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 hero-grid-pattern opacity-40" />

      {/* Retail/Showcase Accent Orbs (Pink/Purple) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 dark:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-200 mb-6 backdrop-blur-md">
            <ShoppingBag className="w-3 h-3" />
            <span>Official Store</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-sora font-bold dark:text-white text-slate-900 mb-6 tracking-tight">
            Premium{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary dark:from-blue-600 dark:to-emerald-600">
              Tech Gear
            </span>
          </h1>
          <p className="text-base dark:text-slate-400 text-slate-700 max-w-2xl mx-auto leading-relaxed">
            Curated hardware and accessories for the modern professional.
            Elevate your workspace with our selection of high-performance tools.
          </p>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <form
            onSubmit={handleSearch}
            className="relative flex items-center gap-2 group"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 dark:text-slate-400 text-slate-500 group-focus-within:text-emerald-600 transition-colors z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                aria-label="Search products"
                className="w-full pl-12 pr-4 py-4 rounded
                         dark:bg-slate-900/60 backdrop-blur-xl
                         border dark:border-white/10 border-slate-300
                         dark:text-white text-slate-700 placeholder:text-slate-500
                         focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-600/50
                         transition-all shadow dark:shadow-black/20"
              />
            </div>

            <button
              type="submit"
              className="hidden sm:block px-8 py-4 rounded bg-emerald-600 text-white font-semibold
                       hover:bg-emerald-500 hover:shadow-md hover:shadow-emerald-500/25
                       transition-all cursor-pointer whitespace-nowrap"
            >
              Search
            </button>
          </form>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mt-8 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>In Stock & Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <TruckElectric className="w-4 h-4 text-blue-400" />
              <span>Fast Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-purple-400" />
              <span>Official Warranty</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductHero;
