import { motion } from "motion/react";
// import { defaultCategories } from "@/utils/defaultCategories";

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
    <section className="w-full py-8 border-b border-slate-200 dark:border-slate-800">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Categories
          </h2>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {categories.length} categories
          </span>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onCategoryChange(category.id)}
              className={`group relative flex flex-col items-center gap-3 p-4 rounded-xl
                       border-2 transition-all duration-300
                       ${
                         activeCategory === category.id
                           ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg shadow-emerald-500/20"
                           : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md"
                       }`}
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center
                         transition-all duration-300
                         ${
                           activeCategory === category.id
                             ? "bg-emerald-600 text-white scale-110"
                             : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                         }`}
              >
                {category.icon}
              </div>

              {/* Category Name */}
              <div className="text-center">
                <span
                  className={`text-sm font-semibold transition-colors duration-300
                           ${
                             activeCategory === category.id
                               ? "text-emerald-600 dark:text-emerald-400"
                               : "text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                           }`}
                >
                  {category.name}
                </span>
                
                {/* Count Badge */}
                {category.count !== undefined && (
                  <span
                    className={`block text-xs mt-1 transition-colors duration-300
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

              {/* Active Indicator */}
              {activeCategory === category.id && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-emerald-600 rounded-full"
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};


export default ProductCategories;