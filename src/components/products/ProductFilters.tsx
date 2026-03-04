"use client";
import { motion, AnimatePresence } from "motion/react";
import { X, SlidersHorizontal, Check } from "lucide-react";
import { useState } from "react";
import type { Category } from "./ProductsCategories";
import { Button } from "@/components/ui/button";

export interface FilterState {
  priceRange: [number, number];
  brands: string[];
  minRating: number;
  inStock: boolean;
  sortBy: string;
}

interface ProductFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onClose,
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);
  const [activeTab, setActiveTab] = useState<
    "category" | "sort" | "price" | "brand" | "rating"
  >("category"); // Default to category on mobile per request? Or sort? Let's check tab order.

  const brands = [
    "Apple",
    "Samsung",
    "Sony",
    "Logitech",
    "Razer",
    "Dell",
    "HP",
    "Lenovo",
  ];
  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Highest Rated" },
    { value: "popular", label: "Most Popular" },
  ];

  const priceRanges = [
    { label: "Under GH₵500", range: [0, 500] as [number, number] },
    { label: "GH₵500 - GH₵1,000", range: [500, 1000] as [number, number] },
    { label: "GH₵1,000 - GH₵3,000", range: [1000, 3000] as [number, number] },
    { label: "GH₵3,000 - GH₵5,000", range: [3000, 5000] as [number, number] },
    { label: "Above GH₵5,000", range: [5000, 1000000] as [number, number] },
  ];

  const ratings = [5, 4, 3, 2, 1];

  const handleApply = () => {
    onFilterChange(tempFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      priceRange: [0, 1000000] as [number, number],
      brands: [],
      minRating: 0,
      inStock: false,
      sortBy: "newest",
    };
    setTempFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const isPriceRangeActive = (range: [number, number]) => {
    return (
      tempFilters.priceRange[0] === range[0] &&
      tempFilters.priceRange[1] === range[1]
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (tempFilters.brands.length > 0) count += tempFilters.brands.length;
    if (tempFilters.minRating > 0) count += 1;
    if (tempFilters.inStock) count += 1;
    if (
      tempFilters.priceRange[0] !== 0 ||
      tempFilters.priceRange[1] !== 1000000
    )
      count += 1;
    return count;
  };

  const tabs = [
    { id: "category" as const, label: "Category", count: 0 },
    { id: "sort" as const, label: "Sort", count: 0 },
    {
      id: "price" as const,
      label: "Price",
      count:
        tempFilters.priceRange[0] !== 0 || tempFilters.priceRange[1] !== 1000000
          ? 1
          : 0,
    },
    { id: "brand" as const, label: "Brand", count: tempFilters.brands.length },
    {
      id: "rating" as const,
      label: "Rating",
      count: tempFilters.minRating > 0 ? 1 : 0,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 dark:bg-slate-900 bg-slate-200 
                       border-t border-white/10
                     rounded shadow-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle Bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 dark:bg-slate-700 bg-slate-600 hover:bg-slate-800 rounded" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-2 dark:border-b dark:border-white/5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="w-5 h-5 dark:text-emerald-400 text-emerald-900" />
                <h2 className="text-xl font-bold text-emerald-900 dark:text-white">
                  Filters
                </h2>
                {getActiveFilterCount() > 0 && (
                  <span className="px-2 py-1 text-xs font-semibold bg-emerald-600 text-white rounded">
                    {getActiveFilterCount()}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded dark:bg-white/5 bg-red-400
                         flex items-center justify-center
                         hover:bg-red-500/90 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b dark:border-white/5 border-slate-300 px-4 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 font-medium whitespace-nowrap
                           border-b-2 transition-colors cursor-pointer ${
                             activeTab === tab.id
                               ? "dark:border-emerald-400 border-emerald-900 dark:text-emerald-400 text-emerald-900"
                               : "dark:border-transparent border-transparent dark:text-slate-400 text-slate-700"
                           }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="cursor-pointer px-1.5 py-0.5 text-xs font-semibold bg-emerald-600 text-white rounded shadow-sm shadow-emerald-500/20">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-2">
              {/* Category Tab */}
              {activeTab === "category" && (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => onCategoryChange(category.id)}
                      className={`flex items-center justify-between w-full p-4 rounded
                                transition-all cursor-pointer ${
                                  activeCategory === category.id
                                    ? "dark:bg-emerald-900/20 bg-emerald-100/50 border border-emerald-600/50"
                                    : "dark:bg-slate-800/50 bg-slate-200/50 border border-transparent"
                                }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-xl dark:text-gray-300 text-gray-600">
                          {/* We don't have the icon object easily stringifiable here unless active, but we rendered node in Category type. 
                              Wait, Category type has icon: React.ReactNode. We can render it! */}
                          {category.icon}
                        </span>
                        <span
                          className={`font-medium ${
                            activeCategory === category.id
                              ? "dark:text-emerald-400 text-emerald-700"
                              : "dark:text-slate-400 text-slate-700"
                          }`}
                        >
                          {category.name}
                        </span>
                      </span>
                      {activeCategory === category.id && (
                        <Check className="w-5 h-5 dark:text-emerald-400 text-emerald-700" />
                      )}
                      {category.count !== undefined && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 dark:text-slate-400 text-slate-600 font-medium">
                          {category.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {/* Sort Tab */}
              {activeTab === "sort" && (
                <div className="space-y-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setTempFilters({ ...tempFilters, sortBy: option.value })
                      }
                      className={`w-full flex items-center justify-between p-4 rounded
                                transition-all cursor-pointer ${
                                  tempFilters.sortBy === option.value
                                    ? "dark:bg-emerald-900/20 bg-emerald-300/20 border border-emerald-600/50"
                                    : "dark:bg-slate-800/50 bg-slate-300/70 border border-transparent"
                                }`}
                    >
                      <span
                        className={`font-medium ${
                          tempFilters.sortBy === option.value
                            ? "dark:text-emerald-400 text-emerald-800"
                            : "dark:text-slate-400 text-slate-700"
                        }`}
                      >
                        {option.label}
                      </span>
                      {tempFilters.sortBy === option.value && (
                        <Check className="cursor-pointer w-6 h-6 dark:text-emerald-400 text-emerald-800" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Price Tab */}
              {activeTab === "price" && (
                <div className="space-y-3">
                  {priceRanges.map((range) => (
                    <button
                      key={range.label}
                      onClick={() =>
                        setTempFilters({
                          ...tempFilters,
                          priceRange: range.range,
                        })
                      }
                      className={`w-full flex items-center justify-between p-4 rounded
                                transition-all ${
                                  isPriceRangeActive(range.range)
                                    ? "dark:bg-emerald-900/20 bg-emerald-300/20 border dark:border-emerald-600/50 border-emerald-300/50"
                                    : "dark:bg-slate-800/50 bg-slate-300/70 border border-transparent"
                                }`}
                    >
                      <span
                        className={`font-medium ${
                          isPriceRangeActive(range.range)
                            ? "dark:text-emerald-400 text-emerald-800"
                            : "dark:text-slate-400 text-slate-700"
                        }`}
                      >
                        {range.label}
                      </span>
                      {isPriceRangeActive(range.range) && (
                        <Check className="cursor-pointer w-6 h-6 dark:text-emerald-400 text-emerald-800" />
                      )}
                    </button>
                  ))}

                  {/* Stock Filter */}
                  <label className="flex items-center justify-between p-4 rounded dark:bg-slate-800/50 bg-slate-300/70 cursor-pointer">
                    <span className="font-medium dark:text-slate-400 text-slate-700">
                      In Stock Only
                    </span>
                    <input
                      type="checkbox"
                      checked={tempFilters.inStock}
                      onChange={(e) =>
                        setTempFilters({
                          ...tempFilters,
                          inStock: e.target.checked,
                        })
                      }
                      className="w-6 h-6 rounded dark:border-slate-600 border-slate-300/70 dark:bg-slate-700 bg-slate-300/30
                                text-emerald-600 dark:focus:ring-emerald-500 focus:ring-emerald-500 cursor-pointer"
                    />
                  </label>
                </div>
              )}

              {/* Brand Tab */}
              {activeTab === "brand" && (
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <label
                      key={brand}
                      className="flex items-center justify-between p-4 rounded dark:bg-slate-800/50 bg-slate-300/70 cursor-pointer
                               active:bg-slate-700 transition-colors"
                    >
                      <span className="font-medium dark:text-slate-400 text-slate-700">
                        {brand}
                      </span>
                      <input
                        type="checkbox"
                        checked={tempFilters.brands.includes(brand)}
                        onChange={(e) => {
                          const newBrands = e.target.checked
                            ? [...tempFilters.brands, brand]
                            : tempFilters.brands.filter((b) => b !== brand);
                          setTempFilters({ ...tempFilters, brands: newBrands });
                        }}
                        className="w-6 h-6 rounded dark:border-slate-600 border-slate-300/70 dark:bg-slate-700 bg-slate-300/30
                                 text-emerald-600 dark:focus:ring-emerald-500 focus:ring-emerald-500 cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              )}

              {/* Rating Tab */}
              {activeTab === "rating" && (
                <div className="space-y-2">
                  {ratings.map((rating) => (
                    <button
                      key={rating}
                      onClick={() =>
                        setTempFilters({ ...tempFilters, minRating: rating })
                      }
                      className={`w-full flex items-center justify-between p-4 rounded
                                transition-all cursor-pointer ${
                                  tempFilters.minRating === rating
                                    ? "dark:bg-emerald-900/20 bg-emerald-300/20 border dark:border-emerald-600/50 border-emerald-300/50"
                                    : "dark:bg-slate-800/50 bg-slate-300/70 border border-transparent"
                                }`}
                    >
                      <div className="cursor-pointer flex items-center gap-2">
                        <span className="text-xl">{"⭐".repeat(rating)}</span>
                        <span
                          className={`font-medium ${
                            tempFilters.minRating === rating
                              ? "dark:text-emerald-300 text-emerald-800"
                              : "dark:text-slate-400 text-slate-700"
                          }`}
                        >
                          {rating} & Up
                        </span>
                      </div>
                      {tempFilters.minRating === rating && (
                        <Check className="w-6 h-6 dark:text-amber-400 text-emerald-800" />
                      )}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setTempFilters({ ...tempFilters, minRating: 0 })
                    }
                    className={`w-full flex items-center justify-between p-4 rounded
                             transition-all cursor-pointer ${
                               tempFilters.minRating === 0
                                 ? "dark:bg-emerald-900/20 bg-emerald-300/20 border dark:border-emerald-600/50 border-emerald-300/50"
                                 : "dark:bg-slate-800/50 bg-slate-300/70 border border-transparent"
                             }`}
                  >
                    <span
                      className={`font-medium ${
                        tempFilters.minRating === 0
                          ? "dark:text-emerald-300 text-emerald-800"
                          : "dark:text-slate-400 text-slate-700"
                      }`}
                    >
                      All Ratings
                    </span>
                    {tempFilters.minRating === 0 && (
                      <Check className="cursor-pointer w-6 h-6 dark:text-emerald-400 text-emerald-800" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex gap-3 p-6 border-t border-white/5 dark:bg-slate-900 bg-slate-100">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1 h-12 font-bold border-slate-300 dark:border-slate-700 dark:text-slate-300 text-slate-700 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-colors"
              >
                Reset
              </Button>
              <Button
                variant="brand"
                onClick={handleApply}
                className="flex-1 h-12 font-bold shadow-lg shadow-emerald-500/20"
              >
                Apply Filters
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductFilters;
