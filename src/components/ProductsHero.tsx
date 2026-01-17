import { motion } from "motion/react";
import { BadgeCheck, Search, ShoppingBag, TruckElectric } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

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
    <section className="relative w-full py-16 bg-linear-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 my-6"
        >
          <Link
            to="/"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-100 font-medium">
            Shop
          </span>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-sora font-bold text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400 mb-4">
            Premium Tech Products
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Discover our curated collection of high-quality tech accessories and
            hardware
          </p>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <form onSubmit={handleSearch} className="relative">
            <div className="md:flex gap-1 hidden">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-12 pr-4 py-3 rounded
                           bg-white dark:bg-slate-900
                           border border-slate-200 dark:border-slate-800
                           text-slate-900 dark:text-slate-100
                           placeholder:text-slate-400
                           focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                           transition-all"
                />
              </div>

              {/* Filter Button (Mobile) */}

              {/* Search Button */}
              <button
                type="submit"
                className="absolute right-1 sm:flex items-center gap-2 px-8 py-2.5 bottom-1 top-1 rounded
                         bg-emerald-600 text-white font-semibold
                         hover:bg-emerald-700 hover:shadow-lg
                         transition-all cursor-pointer"
              >
                Search
              </button>
            </div>

            <div className="flex flex-col gap-1 md:hidden">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-12 pr-4 py-3 rounded
                           bg-white dark:bg-slate-900
                           border border-slate-200 dark:border-slate-800
                           text-slate-900 dark:text-slate-100
                           placeholder:text-slate-400
                           focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                           transition-all"
                />
              </div>

              {/* Filter Button (Mobile) */}

              {/* Search Button */}
              <button
                type="submit"
                className="right-1 sm:flex items-center gap-2 px-8 py-2.5 bottom-1 top-1 rounded
                         bg-emerald-600 text-white font-semibold
                         hover:bg-emerald-700 hover:shadow-lg
                         transition-all cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-8 mt-6 text-sm sm:text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <ShoppingBag className="w-4 h-4 text-emerald-500/80" />
              <span>1000+ Products</span>
            </div>
            <div className="flex items-center gap-2">
              <TruckElectric className="w-5 h-5 text-blue-500/80" />
              <span>Fast Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-indigo-500/80" />
              <span>Quality Guaranteed</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductHero;
