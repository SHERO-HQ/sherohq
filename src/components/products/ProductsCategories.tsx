"use client";
import { m } from "motion/react";

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
 <section className="w-full py-4 sm:py-8 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-40 bg-white/95 dark:bg-slate-900/95  transition duration-300">
 <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 {/* Section Title - Hidden on mobile to save space, or kept small */}
 <div className="hidden sm:flex items-center justify-between mb-6">
 <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
 Categories
 </h2>
 <span className="text-sm text-slate-600 dark:text-slate-400">
 {categories.length} categories
 </span>
 </div>

 {/* Categories Grid/Scroll */}
 <div className="flex overflow-x-auto pb-2 sm:pb-0 gap-3 sm:grid sm:grid-cols-3 md:grid-cols-5 sm:gap-4 snap-x no-scrollbar">
 {categories.map((category, index) => (
 <m.button
 key={category.id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.05 }}
 onClick={() => onCategoryChange(category.id)}
 className={`group relative shrink-0 flex items-center gap-2 p-2 rounded
 border transition duration-300 snap-start cursor-pointer
 ${
 activeCategory === category.id
 ? "border-brand-secondary-500 bg-brand-secondary-50 dark:bg-brand-secondary-900/20 shadow-sm"
 : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
 }`}
 >
 {/* Icon */}
 <div
 className={`w-4 h-4 sm:w-6 sm:h-6 rounded p-1 sm:rounded flex items-center justify-center
 transition duration-300
 ${
 activeCategory === category.id
 ? "bg-brand-secondary-600 text-white"
 : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-brand-secondary-100 dark:group-hover:bg-brand-secondary-900/30 group-hover:text-brand-secondary-600 dark:group-hover:text-brand-secondary-400"
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
 ? "text-brand-secondary-600 dark:text-brand-secondary-400"
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
 ? "text-brand-secondary-600/80 dark:text-brand-secondary-400/80"
 : "text-slate-500 dark:text-slate-500"
 }`}
 >
 {category.count} items
 </span>
 )}
 </div>
 </m.button>
 ))}
 </div>
 </div>
 </section>
 );
};

export default ProductCategories;
