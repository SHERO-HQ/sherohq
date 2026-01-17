import { motion, AnimatePresence } from "motion/react";
import { X, SlidersHorizontal, Check } from "lucide-react";
import { useState } from "react";

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
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onClose,
}) => {
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);
  const [activeTab, setActiveTab] = useState<
    "sort" | "price" | "brand" | "rating"
  >("sort");

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
    { label: "Above GH₵5,000", range: [5000, 10000] as [number, number] },
  ];

  const ratings = [5, 4, 3, 2, 1];

  const handleApply = () => {
    onFilterChange(tempFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      priceRange: [0, 10000] as [number, number],
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
    if (tempFilters.priceRange[0] !== 0 || tempFilters.priceRange[1] !== 10000)
      count += 1;
    return count;
  };

  const tabs = [
    { id: "sort" as const, label: "Sort", count: 0 },
    {
      id: "price" as const,
      label: "Price",
      count:
        tempFilters.priceRange[0] !== 0 || tempFilters.priceRange[1] !== 10000
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
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-slate-900 
                     rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col"
          >
            {/* Handle Bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Filters
                </h2>
                {getActiveFilterCount() > 0 && (
                  <span className="px-2 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-full">
                    {getActiveFilterCount()}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800
                         flex items-center justify-center
                         hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium whitespace-nowrap
                           border-b-2 transition-colors ${
                             activeTab === tab.id
                               ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                               : "border-transparent text-slate-600 dark:text-slate-400"
                           }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="px-1.5 py-0.5 text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Sort Tab */}
              {activeTab === "sort" && (
                <div className="space-y-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setTempFilters({ ...tempFilters, sortBy: option.value })
                      }
                      className={`w-full flex items-center justify-between p-4 rounded-xl
                               transition-all ${
                                 tempFilters.sortBy === option.value
                                   ? "bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-600"
                                   : "bg-slate-50 dark:bg-slate-800 border-2 border-transparent"
                               }`}
                    >
                      <span
                        className={`font-medium ${
                          tempFilters.sortBy === option.value
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {option.label}
                      </span>
                      {tempFilters.sortBy === option.value && (
                        <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
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
                      className={`w-full flex items-center justify-between p-4 rounded-xl
                               transition-all ${
                                 isPriceRangeActive(range.range)
                                   ? "bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-600"
                                   : "bg-slate-50 dark:bg-slate-800 border-2 border-transparent"
                               }`}
                    >
                      <span
                        className={`font-medium ${
                          isPriceRangeActive(range.range)
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {range.label}
                      </span>
                      {isPriceRangeActive(range.range) && (
                        <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </button>
                  ))}

                  {/* Stock Filter */}
                  <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 cursor-pointer">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
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
                      className="w-6 h-6 rounded border-slate-300 dark:border-slate-600
                               text-emerald-600 focus:ring-emerald-500"
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
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 cursor-pointer
                               hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span className="font-medium text-slate-700 dark:text-slate-300">
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
                        className="w-6 h-6 rounded border-slate-300 dark:border-slate-600
                                 text-emerald-600 focus:ring-emerald-500"
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
                      className={`w-full flex items-center justify-between p-4 rounded-xl
                               transition-all ${
                                 tempFilters.minRating === rating
                                   ? "bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-600"
                                   : "bg-slate-50 dark:bg-slate-800 border-2 border-transparent"
                               }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{"⭐".repeat(rating)}</span>
                        <span
                          className={`font-medium ${
                            tempFilters.minRating === rating
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {rating} & Up
                        </span>
                      </div>
                      {tempFilters.minRating === rating && (
                        <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setTempFilters({ ...tempFilters, minRating: 0 })
                    }
                    className={`w-full flex items-center justify-between p-4 rounded-xl
                             transition-all ${
                               tempFilters.minRating === 0
                                 ? "bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-600"
                                 : "bg-slate-50 dark:bg-slate-800 border-2 border-transparent"
                             }`}
                  >
                    <span
                      className={`font-medium ${
                        tempFilters.minRating === 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      All Ratings
                    </span>
                    {tempFilters.minRating === 0 && (
                      <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <button
                onClick={handleReset}
                className="flex-1 px-6 py-4 rounded-xl font-semibold
                         border-2 border-slate-300 dark:border-slate-700
                         text-slate-700 dark:text-slate-300
                         hover:border-slate-400 dark:hover:border-slate-600
                         transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleApply}
                className="flex-1 px-6 py-4 rounded-xl font-semibold
                         bg-emerald-600 text-white
                         hover:bg-emerald-700
                         transition-colors shadow-lg"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductFilters;
