"use client";
import { motion, AnimatePresence } from "motion/react";
import { X, SlidersHorizontal, Check, Trash2, ArrowRight, Star } from "lucide-react";
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

 // Sync internal state with props when modal opens or props change
 useEffect(() => {
 if (isOpen) {
 setTempFilters(filters);
 }
 }, [filters, isOpen]);

 const [activeTab, setActiveTab] = useState<
 "classification" | "sort" | "price" | "brand" | "rating" | "stock"
 >("classification");

 const brands = [
 "Apple", "Samsung", "Sony", "Logitech", "Razer", "Dell", "HP", "Lenovo",
 ];
 
 const sortOptions = [
 { value: "newest", label: "Newest Arrivals" },
 { value: "price-low", label: "Price: Low to High" },
 { value: "price-high", label: "Price: High to Low" },
 { value: "rating", label: "Highest Rated" },
 { value: "popular", label: "Most Popular" },
 ];

 const priceRanges = [
 { label: "Elite Selection (Above GH₵5,000)", range: [5000, 1000000] as [number, number] },
 { label: "Premium Range (GH₵3,000 - GH₵5,000)", range: [3000, 5000] as [number, number] },
 { label: "Mid-Tier Luxury (GH₵1,000 - GH₵3,000)", range: [1000, 3000] as [number, number] },
 { label: "Standard Class (GH₵500 - GH₵1,000)", range: [500, 1000] as [number, number] },
 { label: "Accessible Entry (Under GH₵500)", range: [0, 500] as [number, number] },
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
 return tempFilters.priceRange[0] === range[0] && tempFilters.priceRange[1] === range[1];
 };

 const tabs = [
 { id: "classification" as const, label: "Classification" },
 { id: "sort" as const, label: "Sort By" },
 { id: "price" as const, label: "Investment" },
 { id: "brand" as const, label: "Origin" },
 { id: "rating" as const, label: "Satisfaction" },
 { id: "stock" as const, label: "Availability" },
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
 className="fixed inset-0 bg-black/60 z-100 backdrop-blur-sm"
 />

 <motion.div
 initial={{ y: "100%", opacity: 0 }}
 animate={{ y: 0, opacity: 1 }}
 exit={{ y: "100%", opacity: 0 }}
 transition={{ type: "spring", damping: 30, stiffness: 300 }}
 className="fixed md:right-8 md:bottom-8 inset-x-0 bottom-0 md:inset-x-auto z-101 
 dark:bg-slate-900/90 bg-white/95 backdrop-blur-sm 
 border-t md:border border-white/10 rounded-t md:rounded-xl shadow-lg 
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
 <div className="p-3 bg-emerald-500/10 rounded">
 <SlidersHorizontal className="w-6 h-6 text-emerald-500" />
 </div>
 <div>
 <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
 Refine <span className="text-emerald-500">Search</span>
 </h2>
 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Fine-tune your technical requirements</p>
 </div>
 </div>
 <button
 onClick={onClose}
 className="p-4 bg-slate-100 dark:bg-white/5 rounded hover:bg-red-500 hover:text-white transition active:scale-95"
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
 className={`relative px-6 py-4 md:px-8 md:py-6 text-left transition duration-300 flex-1 md:flex-none whitespace-nowrap md:whitespace-normal ${
 activeTab === tab.id
 ? "text-emerald-500 bg-emerald-500/5 md:bg-transparent"
 : "text-slate-400 hover:text-slate-600 dark:hover:text-white"
 }`}
 >
 <span className="hidden md:block text-[10px] font-black uppercase tracking-widest mb-1">Filter</span>
 <span className="text-[10px] md:text-xs font-black uppercase tracking-tight">{tab.label}</span>
 {activeTab === tab.id && (
 <motion.div
 layoutId="activeTabIndicator"
 className="absolute bottom-0 left-0 right-0 h-0.5 md:h-8 md:w-1 md:right-0 md:left-auto md:top-1/2 md:-translate-y-1/2 bg-emerald-500 md:rounded-l-full shadow-sm"
 />
 )}
 </button>
 ))}
 </div>

 {/* Main Content Areas */}
 <div className="flex-1 overflow-y-auto p-4 sm:p-10 space-y-8 no-scrollbar">
 {activeTab === "classification" && (
 <div className="grid grid-cols-1 gap-3">
 {categories.map((category) => (
 <button
 key={category.id}
 onClick={() => onCategoryChange(category.id)}
 className={`flex items-center justify-between p-4 sm:p-6 rounded transition border-2 ${
 activeCategory === category.id
 ? "bg-emerald-500/10 border-emerald-500/50"
 : "bg-slate-50 dark:bg-white/5 border-transparent"
 }`}
 >
 <div className="flex items-center gap-3 sm:gap-4">
 <div className={`p-2 sm:p-3 rounded transition-colors ${
 activeCategory === category.id ? "bg-emerald-500 text-white" : "dark:bg-white/10 bg-slate-200 text-slate-500"
 }`}>
 {category.icon}
 </div>
 <span className={`font-black uppercase tracking-tight text-xs sm:text-sm ${
 activeCategory === category.id ? "text-emerald-500" : "text-slate-500"
 }`}>
 {category.name}
 </span>
 </div>
 <span className="text-[9px] sm:text-[10px] font-mono font-bold dark:text-slate-600 text-slate-400">
 [{category.count || 0}]
 </span>
 </button>
 ))}
 </div>
 )}

 {activeTab === "sort" && (
 <div className="grid grid-cols-1 gap-3">
 {sortOptions.map((option) => (
 <button
 key={option.value}
 onClick={() => setTempFilters({ ...tempFilters, sortBy: option.value })}
 className={`group flex items-center justify-between p-4 sm:p-6 rounded transition border-2 ${
 tempFilters.sortBy === option.value
 ? "bg-emerald-500/10 border-emerald-500/50"
 : "bg-slate-50 dark:bg-white/5 border-transparent hover:border-white/10"
 }`}
 >
 <span className={`font-black uppercase tracking-tight text-xs sm:text-sm ${
 tempFilters.sortBy === option.value ? "text-emerald-500" : "text-slate-500"
 }`}>
 {option.label}
 </span>
 {tempFilters.sortBy === option.value && (
 <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
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
 onClick={() => setTempFilters({ ...tempFilters, priceRange: range.range })}
 className={`flex items-center justify-between p-4 sm:p-6 rounded transition border-2 ${
 isPriceRangeActive(range.range)
 ? "bg-emerald-500/10 border-emerald-500/50"
 : "bg-slate-50 dark:bg-white/5 border-transparent"
 }`}
 >
 <span className={`font-black uppercase tracking-tight text-[10px] sm:text-xs ${
 isPriceRangeActive(range.range) ? "text-emerald-500" : "text-slate-500"
 }`}>
 {range.label}
 </span>
 {isPriceRangeActive(range.range) && (
 <Check size={14} className="text-emerald-500" />
 )}
 </button>
 ))}
 </div>
 )}

 {activeTab === "brand" && (
 <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
 {brands.map((brand) => (
 <button
 key={brand}
 onClick={() => {
 const newBrands = tempFilters.brands.includes(brand)
 ? tempFilters.brands.filter(b => b !== brand)
 : [...tempFilters.brands, brand];
 setTempFilters({ ...tempFilters, brands: newBrands });
 }}
 className={`px-4 py-3 sm:px-6 sm:py-4 rounded font-black uppercase tracking-widest text-[9px] sm:text-[10px] border-2 transition ${
 tempFilters.brands.includes(brand)
 ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
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
 onClick={() => setTempFilters({ ...tempFilters, minRating: r })}
 className={`flex items-center justify-between p-4 sm:p-6 rounded transition border-2 ${
 tempFilters.minRating === r
 ? "bg-emerald-500/10 border-emerald-500/50"
 : "bg-slate-50 dark:bg-white/5 border-transparent"
 }`}
 >
 <div className="flex items-center gap-2">
 <div className="flex items-center">
 {[...Array(5)].map((_, i) => (
 <Star key={i} size={14} className={`${i < r ? "fill-amber-400 text-amber-400" : "text-slate-200 dark:text-slate-800"}`} />
 ))}
 </div>
 <span className="ml-1 sm:ml-2 font-black text-[10px] sm:text-xs uppercase tracking-tight text-slate-500">{r} & Up</span>
 </div>
 {tempFilters.minRating === r && <Check size={14} className="text-emerald-500" />}
 </button>
 ))}
 </div>
 )}

 {activeTab === "stock" && (
 <div className="space-y-6">
 <button
 onClick={() => setTempFilters({ ...tempFilters, inStock: !tempFilters.inStock })}
 className={`w-full flex items-center justify-between p-6 sm:p-8 rounded transition border-2 ${
 tempFilters.inStock
 ? "bg-emerald-500/10 border-emerald-500/50"
 : "bg-slate-50 dark:bg-white/5 border-transparent"
 }`}
 >
 <div className="text-left">
 <span className="block font-black uppercase tracking-tighter text-lg sm:text-xl text-slate-900 dark:text-white mb-1">Immediate Access</span>
 <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 line-clamp-1">Items in local fulfillment centers</span>
 </div>
 <div className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full relative transition-colors shrink-0 ${
 tempFilters.inStock ? "bg-emerald-500" : "bg-slate-300 dark:bg-white/10"
 }`}>
 <motion.div 
 animate={{ x: tempFilters.inStock ? 26 : 4 }}
 className="absolute top-1 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full shadow-lg" 
 />
 </div>
 </button>
 </div>
 )}
 </div>
 </div>

 {/* Actions Footer */}
 <div className="px-6 py-6 border-t border-white/5 bg-slate-50/50 dark:bg-white/5 backdrop-blur-sm flex flex-row items-center gap-3">
 <button
 onClick={handleReset}
 className="flex items-center justify-center gap-2 px-4 h-12 rounded font-black uppercase tracking-widest text-[9px] text-slate-500 hover:text-red-500 transition-colors border border-transparent hover:border-red-500/20"
 >
 <Trash2 size={14} /> <span className="hidden sm:inline">Reset</span>
 </button>
 <button
 onClick={handleApply}
 className="flex-1 flex items-center justify-center gap-3 h-12 bg-emerald-600 text-white rounded font-black uppercase tracking-widest text-[10px] hover:bg-emerald-500 shadow-md shadow-emerald-500/20 active:scale-[0.98] transition group"
 >
 Apply Filters <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
 </button>
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 );
};

export default ProductFilters;
