"use client";
import { X, RotateCcw } from "lucide-react";
import type { FilterState } from "./ProductFilters";
import type { Category } from "./ProductsCategories";
import { motion, AnimatePresence } from "motion/react";

interface ActiveFiltersProps {
  filters: FilterState;
  activeCategory: string;
  categories: Category[];
  onRemoveCategory: () => void;
  onRemoveFilter: (key: keyof FilterState, value?: any) => void;
  onClearAll: () => void;
}

export const ActiveFilters = ({
  filters,
  activeCategory,
  categories,
  onRemoveCategory,
  onRemoveFilter,
  onClearAll,
}: ActiveFiltersProps) => {
  const activeCategoryName = categories.find((c) => c.id === activeCategory)?.name;

  const hasActiveFilters = 
    activeCategory !== "all" || 
    filters.brands.length > 0 || 
    filters.minRating > 0 || 
    filters.inStock || 
    filters.priceRange[0] > 0 || 
    filters.priceRange[1] < 1000000;

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mr-2 flex items-center gap-1">
        Active Filters:
      </span>

      <AnimatePresence>
        {/* Category Chip */}
        {activeCategory !== "all" && (
          <FilterChip 
            label={`Category: ${activeCategoryName}`} 
            onRemove={onRemoveCategory} 
          />
        )}

        {/* Brand Chips */}
        {filters.brands.map((brand) => (
          <FilterChip 
            key={`brand-${brand}`}
            label={`Brand: ${brand}`} 
            onRemove={() => onRemoveFilter("brands", brand)} 
          />
        ))}

        {/* Price Chip */}
        {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000) && (
          <FilterChip 
            label={
              filters.priceRange[1] >= 1000000 
                ? `Above GH₵${filters.priceRange[0]}` 
                : filters.priceRange[0] <= 0 
                  ? `Under GH₵${filters.priceRange[1]}` 
                  : `GH₵${filters.priceRange[0]} - GH₵${filters.priceRange[1]}`
            } 
            onRemove={() => onRemoveFilter("priceRange", [0, 1000000])} 
          />
        )}

        {/* Rating Chip */}
        {filters.minRating > 0 && (
          <FilterChip 
            label={`${filters.minRating}+ Stars`} 
            onRemove={() => onRemoveFilter("minRating", 0)} 
          />
        )}

        {/* Stock Chip */}
        {filters.inStock && (
          <FilterChip 
            label="In Stock Only" 
            onRemove={() => onRemoveFilter("inStock", false)} 
          />
        )}
      </AnimatePresence>

      <button
        onClick={onClearAll}
        className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center gap-1 ml-2 transition-colors cursor-pointer"
      >
        <RotateCcw size={10} />
        Clear All
      </button>
    </div>
  );
};

const FilterChip = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full group hover:border-emerald-500/30 transition-all duration-300"
  >
    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
      {label}
    </span>
    <button
      onClick={onRemove}
      className="p-0.5 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors text-slate-400 cursor-pointer"
    >
      <X size={10} />
    </button>
  </motion.div>
);
