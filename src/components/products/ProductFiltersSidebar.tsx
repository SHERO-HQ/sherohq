"use client";
import { Check, SlidersHorizontal, ChevronDown, ChevronUp, Star } from "lucide-react";
import { useState } from "react";
import type { FilterState } from "./ProductFilters";
import type { Category } from "./ProductsCategories";

interface ProductFiltersSidebarProps {
 filters: FilterState;
 onFilterChange: (filters: FilterState) => void;
 className?: string;
 categories: Category[];
 activeCategory: string;
 onCategoryChange: (categoryId: string) => void;
}

const ProductFiltersSidebar: React.FC<ProductFiltersSidebarProps> = ({
 filters,
 onFilterChange,
 className = "",
 categories,
 activeCategory,
 onCategoryChange,
}) => {
 const [expandedSections, setExpandedSections] = useState<string[]>([
 "categories",
 "price",
 "brand",
 "rating",
 "stock",
 ]);

 const toggleSection = (section: string) => {
 setExpandedSections((prev) =>
 prev.includes(section)
 ? prev.filter((s) => s !== section)
 : [...prev, section],
 );
 };

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

 const priceRanges = [
  { label: "Elite (Above GH₵5,000)", range: [5000, 1000000] as [number, number] },
  { label: "Premium (GH₵3,000 - GH₵5,000)", range: [3000, 5000] as [number, number] },
  { label: "Mid-Tier (GH₵1,000 - GH₵3,000)", range: [1000, 3000] as [number, number] },
  { label: "Standard (GH₵500 - GH₵1,000)", range: [500, 1000] as [number, number] },
  { label: "Entry (Under GH₵500)", range: [0, 500] as [number, number] },
 ];

 const ratings = [5, 4, 3, 2, 1];

 const isPriceRangeActive = (range: [number, number]) => {
 return (
 filters.priceRange[0] === range[0] && filters.priceRange[1] === range[1]
 );
 };

 return (
 <aside className={`w-full ${className}`}>
 {/* Glass Container */}
 <div className="dark:bg-slate-900 bg-slate-100 border border-slate-200 dark:border-white/5 rounded p-6 shadow">
 <div className="flex items-center gap-2 mb-8 border-b dark:border-white/5 border-slate-300">
 <SlidersHorizontal className="w-5 h-5 text-slate-500" />
 <h3 className="font-bold text-lg dark:text-white text-slate-800">
 Filters
 </h3>
 </div>

 <div className="space-y-8">
 {/* Categories */}
 <div className="border-b dark:border-white/5 border-slate-300 pb-6 last:border-0 last:pb-0">
 <button
 onClick={() => toggleSection("categories")}
 className="flex items-center justify-between w-full mb-4 font-semibold dark:text-white text-slate-800 hover:text-primary transition-colors cursor-pointer"
 >
 <span>Categories</span>
 {expandedSections.includes("categories") ? (
 <ChevronUp className="w-4 h-4 dark:text-slate-500 text-slate-700" />
 ) : (
 <ChevronDown className="w-4 h-4 dark:text-slate-500 text-slate-700" />
 )}
 </button>

 {expandedSections.includes("categories") && (
 <div className="space-y-2">
 {categories.map((category) => (
 <button
 key={category.id}
 onClick={() => onCategoryChange(category.id)}
 className={`flex items-center justify-between w-full text-left group cursor-pointer ${
 activeCategory === category.id
 ? "text-brand-secondary-600 dark:text-brand-secondary-400 font-medium"
 : "text-slate-600 dark:text-slate-400 hover:text-brand-secondary-600 dark:hover:text-brand-secondary-400"
 }`}
 >
 <span className="text-sm">{category.name}</span>
 <span
 className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
 activeCategory === category.id
 ? "bg-brand-secondary-600 text-white shadow-sm shadow-brand-secondary-500/20"
 : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-brand-secondary-50 dark:group-hover:bg-brand-secondary-900/20"
 }`}
 >
 {category.count}
 </span>
 </button>
 ))}
 </div>
 )}
 </div>

 {/* Price Range */}
 <div className="border-b dark:border-white/5 border-slate-300 pb-6 last:border-0 last:pb-0">
 <button
 onClick={() => toggleSection("price")}
 className="flex items-center justify-between w-full mb-4 font-semibold dark:text-white text-slate-800 hover:text-primary transition-colors cursor-pointer"
 >
 <span>Price Range</span>
 {expandedSections.includes("price") ? (
 <ChevronUp className="w-4 h-4 dark:text-slate-500 text-slate-700" />
 ) : (
 <ChevronDown className="w-4 h-4 dark:text-slate-500 text-slate-700" />
 )}
 </button>

 {expandedSections.includes("price") && (
 <div className="space-y-2">
 {priceRanges.map((range) => (
 <label
 key={range.label}
 className="flex items-center gap-3 cursor-pointer group"
 >
 <div
 className={`w-4 h-4 rounded border border-brand-secondary-700 flex items-center justify-center transition duration-200
 ${isPriceRangeActive(range.range) ? "bg-brand-secondary-400 border-brand-secondary-400" : "dark:bg-slate-800/50 group-hover:border-brand-secondary-500"}`}
 >
 {isPriceRangeActive(range.range) && (
 <Check className="w-3 h-3 dark:text-white text-brand-secondary-700" />
 )}
 </div>
 <input
 type="radio"
 name="priceRange"
 className="hidden"
 checked={isPriceRangeActive(range.range)}
 onChange={() =>
 onFilterChange({ ...filters, priceRange: range.range })
 }
 />
 <span
 className={`text-sm tracking-wide ${isPriceRangeActive(range.range) ? "dark:text-brand-secondary-400 text-brand-secondary-600 font-medium" : "dark:text-slate-400 text-slate-600 dark:group-hover:text-slate-300 group-hover:text-brand-secondary-600 transition-colors"}`}
 >
 {range.label}
 </span>
 </label>
 ))}
 </div>
 )}
 </div>

 {/* Brands */}
 <div className="border-b dark:border-white/5 border-slate-300 pb-6 last:border-0 last:pb-0">
 <button
 onClick={() => toggleSection("brand")}
 className="flex items-center justify-between w-full mb-4 font-semibold dark:text-white text-slate-800 hover:text-primary transition-colors cursor-pointer"
 >
 <span>Brand</span>
 {expandedSections.includes("brand") ? (
 <ChevronUp className="w-4 h-4 dark:text-slate-500 text-slate-700" />
 ) : (
 <ChevronDown className="w-4 h-4 dark:text-slate-500 text-slate-700" />
 )}
 </button>

 {expandedSections.includes("brand") && (
 <div className="space-y-2">
 {brands.map((brand) => (
 <label
 key={brand}
 className="flex items-center gap-3 cursor-pointer group"
 >
 <div
 className={`w-4 h-4 rounded border dark:border-white/5 border-slate-600 flex items-center justify-center transition duration-200
 ${filters.brands.includes(brand) ? "bg-brand-secondary-400 border-brand-secondary-700" : "dark:bg-slate-800/50 group-hover:border-brand-secondary-500"}`}
 >
 {filters.brands.includes(brand) && (
 <Check className="w-3 h-3 dark:text-white text-brand-secondary-700" />
 )}
 </div>
 <input
 type="checkbox"
 className="hidden"
 checked={filters.brands.includes(brand)}
 onChange={(e) => {
 const newBrands = e.target.checked
 ? [...filters.brands, brand]
 : filters.brands.filter((b) => b !== brand);
 onFilterChange({ ...filters, brands: newBrands });
 }}
 />
 <span
 className={`text-sm tracking-wide ${filters.brands.includes(brand) ? "text-brand-secondary-600 font-medium" : "dark:text-slate-400 dark:group-hover:text-slate-300 group-hover:text-brand-secondary-600 transition-colors"}`}
 >
 {brand}
 </span>
 </label>
 ))}
 </div>
 )}
 </div>

 {/* Ratings */}
 <div className="border-b border-white/5 pb-6 last:border-0 last:pb-0">
 <button
 onClick={() => toggleSection("rating")}
 className="flex items-center justify-between w-full mb-4 font-semibold dark:text-white text-slate-800 hover:text-primary transition-colors cursor-pointer"
 >
 <span>Rating</span>
 {expandedSections.includes("rating") ? (
 <ChevronUp className="w-4 h-4 text-slate-500" />
 ) : (
 <ChevronDown className="w-4 h-4 text-slate-500" />
 )}
 </button>

 {expandedSections.includes("rating") && (
 <div className="space-y-2">
 {ratings.map((rating) => (
 <button
 key={rating}
 onClick={() =>
 onFilterChange({ ...filters, minRating: rating })
 }
 className="flex items-center gap-2 w-full group cursor-pointer"
 >
 <div className="flex items-center space-x-1">
 {Array.from({ length: 5 }).map((_, i) => (
 <Star
 key={`star-${i}`}
 className={`w-4 h-4 ${i < rating ? "text-amber-400 fill-amber-400" : "text-slate-300 dark:text-slate-700"}`}
 />
 ))}
 </div>
 <span
 className={`text-sm ${filters.minRating === rating ? "text-amber-400 font-medium" : "text-slate-500 group-hover:text-slate-400 transition-colors"}`}
 >
 {rating} {rating === 5 ? "" : "& Up"}
 </span>
 </button>
 ))}
 </div>
 )}
 </div>

 {/* Stock */}
 <div>
 <button
 onClick={() => toggleSection("stock")}
 className="flex items-center justify-between w-full mb-4 font-semibold dark:text-white text-slate-800 hover:text-primary transition-colors cursor-pointer"
 >
 <span>Availability</span>
 {expandedSections.includes("stock") ? (
 <ChevronUp className="w-4 h-4 text-slate-500" />
 ) : (
 <ChevronDown className="w-4 h-4 text-slate-500" />
 )}
 </button>

 {expandedSections.includes("stock") && (
 <label className="flex items-center gap-3 cursor-pointer group">
 <div
 className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${filters.inStock ? "bg-brand-secondary-600" : "dark:bg-slate-700 bg-slate-500"}`}
 >
 <div
 className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-300 ${filters.inStock ? "translate-x-4" : "translate-x-0"}`}
 />
 </div>
 <input
 type="checkbox"
 className="hidden"
 checked={filters.inStock}
 onChange={(e) =>
 onFilterChange({ ...filters, inStock: e.target.checked })
 }
 />
 <span className="text-sm dark:text-slate-400 text-slate-500 dark:group-hover:text-slate-300 group-hover:text-slate-600 transition-colors">
 In Stock Only
 </span>
 </label>
 )}
 </div>
 </div>
 </div>
 </aside>
 );
};

export default ProductFiltersSidebar;
