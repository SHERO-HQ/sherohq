"use client";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  SlidersHorizontal,
  Check,
  Trash2,
  ArrowRight,
  Star,
} from "lucide-react";
import { useState, useEffect } from "react";
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
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onClose,
}) => {
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);

  // Sync internal state with props when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setTempFilters(filters);
    }
  }, [filters, isOpen]);

  const [activeTab, setActiveTab] = useState<
    "sort" | "price" | "brand" | "rating" | "stock"
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
    { value: "newest", label: "Newest Arrivals" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Highest Rated" },
    { value: "popular", label: "Most Popular" },
  ];

  const priceRanges = [
    {
      label: "Elite (Above S5,000)",
      range: [5000, 1000000] as [number, number],
    },
    {
      label: "Premium (S3,000 - S5,000)",
      range: [3000, 5000] as [number, number],
    },
    {
      label: "Mid-Tier (S1,000 - S3,000)",
      range: [1000, 3000] as [number, number],
    },
    {
      label: "Standard (S500 - S1,000)",
      range: [500, 1000] as [number, number],
    },
    { label: "Entry (Under S500)", range: [0, 500] as [number, number] },
  ];

  const handleApply = () => {
    onFilterChange(tempFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      priceRange: [0, 1000000],
      brands: [],
      minRating: 0,
      inStock: false,
      sortBy: "newest",
    };
    setTempFilters(resetFilters);
  };

  const isPriceRangeActive = (range: [number, number]) => {
    return (
      tempFilters.priceRange[0] === range[0] &&
      tempFilters.priceRange[1] === range[1]
    );
  };

  const tabs = [
    { id: "sort" as const, label: "Sort By" },
    { id: "price" as const, label: "Price Range" },
    { id: "brand" as const, label: "Brand" },
    { id: "rating" as const, label: "Rating" },
    //   { id: "stock" as const, label: "Availability" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-100 "
          />

          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed md:right-8 md:bottom-8 inset-x-0 bottom-0 md:inset-x-auto z-101 
 dark:bg-slate-900/90 bg-white/95  
 border-t md:border border-white/10 rounded-t md:rounded shadow 
 max-h-[85vh] md:max-h-[80vh] w-full md:max-w-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab Handle */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-16 h-1.5 dark:bg-white/10 bg-slate-200 rounded" />
            </div>

            {/* Header */}
            <div className="px-8 py-6 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-brand-secondary-500/10 rounded">
                  <SlidersHorizontal className="w-6 h-6 text-brand-secondary-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                    Filter <span className="text-brand-secondary-500">Products</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Filter your technical requirements
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-slate-100 dark:bg-white/5 rounded hover:bg-red-500 hover:text-white transition active:scale-95"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              {/* Responsive Tabs/Sidebar */}
              <div className="flex md:flex-col overflow-x-auto md:overflow-y-auto no-scrollbar border-b md:border-b-0 md:border-r border-white/5 shrink-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-6 py-3 md:px-8 text-left transition-all duration-300 flex-1 md:flex-none whitespace-nowrap md:whitespace-normal ${
                      activeTab === tab.id
                        ? "text-brand-secondary-600 dark:text-brand-secondary-400 bg-brand-secondary-500/10 font-bold shadow-xs"
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    }`}
                  >
                    {/* <span className="hidden md:block text-[10px] font-black uppercase tracking-widest mb-1">Filter</span> */}
                    <span className="md:text-base text-sm font-semibold tracking-tight">
                      {tab.label}
                    </span>
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 md:h-8 md:w-1 md:left-0 md:top-1/2 md:-translate-y-1/2 bg-brand-secondary-500 md:rounded-r-full shadow-sm"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Main Content Areas */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-10 space-y-8 no-scrollbar">
                {activeTab === "sort" && (
                  <div className="grid grid-cols-1 gap-4">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          setTempFilters({
                            ...tempFilters,
                            sortBy: option.value,
                          })
                        }
                        className={`group flex items-center justify-between p-2 rounded transition border-2 ${
                          tempFilters.sortBy === option.value
                            ? "bg-brand-secondary-500/10 border-brand-secondary-500/50"
                            : "bg-slate-50 dark:bg-white/5 border-transparent hover:border-white/10"
                        }`}
                      >
                        <span
                          className={`font-medium tracking-tight text-xs sm:text-sm ${
                            tempFilters.sortBy === option.value
                              ? "text-brand-secondary-500"
                              : "text-slate-500"
                          }`}
                        >
                          {option.label}
                        </span>
                        {tempFilters.sortBy === option.value && (
                          <div className="w-6 h-6 rounded bg-brand-secondary-500 flex items-center justify-center shadow shadow-brand-secondary-500/20">
                            <Check size={14} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {activeTab === "price" && (
                  <div className="grid grid-cols-1 gap-4">
                    {priceRanges.map((range) => (
                      <button
                        key={range.label}
                        onClick={() =>
                          setTempFilters({
                            ...tempFilters,
                            priceRange: range.range,
                          })
                        }
                        className={`flex items-center justify-between p-2 rounded transition border-2 ${
                          isPriceRangeActive(range.range)
                            ? "bg-brand-secondary-500/10 border-brand-secondary-500/50"
                            : "bg-slate-50 dark:bg-white/5 border-transparent"
                        }`}
                      >
                        <span
                          className={`font-medium tracking-tight text-xs md:text-sm ${
                            isPriceRangeActive(range.range)
                              ? "text-brand-secondary-500"
                              : "text-slate-500"
                          }`}
                        >
                          {range.label}
                        </span>
                        {isPriceRangeActive(range.range) && (
                          <Check size={14} className="text-brand-secondary-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {activeTab === "brand" && (
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                    {brands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => {
                          const newBrands = tempFilters.brands.includes(brand)
                            ? tempFilters.brands.filter((b) => b !== brand)
                            : [...tempFilters.brands, brand];
                          setTempFilters({ ...tempFilters, brands: newBrands });
                        }}
                        className={`px-4 py-2 rounded font-medium tracking-tight text-xs md:text-sm border-2 transition ${
                          tempFilters.brands.includes(brand)
                            ? "bg-brand-secondary-500 border-brand-secondary-500 text-white shadow shadow-brand-secondary-500/20"
                            : "bg-slate-50 dark:bg-white/5 border-transparent text-slate-500"
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                )}

                {activeTab === "rating" && (
                  <div className="grid grid-cols-1 gap-3">
                    {[5, 4, 3, 2, 1].map((r) => (
                      <button
                        key={r}
                        onClick={() =>
                          setTempFilters({ ...tempFilters, minRating: r })
                        }
                        className={`flex items-center justify-between py-3 px-6 rounded transition border-2 ${
                          tempFilters.minRating === r
                            ? "bg-brand-secondary-500/10 border-brand-secondary-500/50"
                            : "bg-slate-50 dark:bg-white/5 border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={`${i < r ? "fill-amber-400 text-amber-400" : "text-slate-200 dark:text-slate-600"}`}
                              />
                            ))}
                          </div>
                          <span className="ml-1 sm:ml-2 font-medium text-xs md:text-sm tracking-tight text-slate-500">
                            {r} & Up
                          </span>
                        </div>
                        {tempFilters.minRating === r && (
                          <Check size={14} className="text-brand-secondary-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* {activeTab === "stock" && (
 <div className="space-y-6">
 <button
 onClick={() => setTempFilters({ ...tempFilters, inStock: !tempFilters.inStock })}
 className={`w-full flex items-center justify-between p-3 sm:p-4 rounded transition border-2 ${
 tempFilters.inStock
 ? "bg-brand-secondary-500/10 border-brand-secondary-500/50"
 : "bg-slate-50 dark:bg-white/5 border-transparent"
 }`}
 >
 <div className="text-left">
 <span className="block font-semibold tracking-tighter text-lg sm:text-xl text-slate-900 dark:text-white mb-1">Immediate Access</span>
 <span className="text-[9px] sm:text-[10px] font-semibold tracking-tight text-slate-500 line-clamp-1">Items in local centers</span>
 </div>
 <div className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full relative transition-colors shrink-0 ${
 tempFilters.inStock ? "bg-brand-secondary-500" : "bg-slate-300 dark:bg-white/10"
 }`}>
 <motion.div 
 animate={{ x: tempFilters.inStock ? 26 : 4 }}
 className="absolute top-1 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full shadow" 
 />
 </div>
 </button>
 </div>
 )} */}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="px-6 py-6 border-t border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-900 flex flex-row items-center gap-3">
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-4 h-10 rounded font-semibold tracking-tight text-sm text-slate-500 hover:text-red-500 transition-colors border border-transparent hover:border-red-500/20"
              >
                <Trash2 size={14} />{" "}
                <span className="hidden sm:inline">Reset</span>
              </button>
              <button
                onClick={handleApply}
                className="flex-1 flex items-center justify-center gap-3 h-10 bg-brand-secondary-600 text-white rounded font-semibold tracking-tight text-sm hover:bg-brand-secondary-500 shadow shadow-brand-secondary-500/20 active:scale-[0.98] transition group"
              >
                Apply Filters{" "}
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-2 transition-transform"
                />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductFilters;
