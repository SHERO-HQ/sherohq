import { motion } from "motion/react";

export interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  count?: number;
}

interface ProductCategoriesProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const ProductCategories: React.FC<ProductCategoriesProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <section className="w-full py-4 sm:py-8 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-all duration-300">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title - Hidden on mobile to save space, or kept small */}
        <div className="hidden sm:flex items-center justify-between mb-6">
          <h2 className="text-2xl font-sora font-bold text-slate-900 dark:text-slate-100">
            Categories
          </h2>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {categories.length} categories
          </span>
        </div>

        {/* Categories Grid/Scroll */}
        <div className="flex overflow-x-auto pb-2 sm:pb-0 gap-3 sm:grid sm:grid-cols-3 md:grid-cols-5 sm:gap-4 snap-x no-scrollbar">
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onCategoryChange(category.id)}
              className={`group relative shrink-0 flex items-center gap-2 p-2 rounded
                       border transition-all duration-300 snap-start cursor-pointer
                       ${
                         activeCategory === category.id
                           ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm"
                           : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                       }`}
            >
              {/* Icon */}
              <div
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded p-1 sm:rounded flex items-center justify-center
                         transition-all duration-300
                         ${
                           activeCategory === category.id
                             ? "bg-emerald-600 text-white"
                             : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                         }`}
              >
                {category.icon}
              </div>

              {/* Category Name */}
              <div className="text-start">
                <span
                  className={`text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors duration-300
                           ${
                             activeCategory === category.id
                               ? "text-emerald-600 dark:text-emerald-400"
                               : "text-slate-700 dark:text-slate-300"
                           }`}
                >
                  {category.name}
                </span>

                {/* Count Badge - Desktop Only */}
                {category.count !== undefined && (
                  <span
                    className={`hidden sm:block text-xs mt-1 transition-colors duration-300
                             ${
                               activeCategory === category.id
                                 ? "text-emerald-600/80 dark:text-emerald-400/80"
                                 : "text-slate-500 dark:text-slate-500"
                             }`}
                  >
                    {category.count} items
                  </span>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;
