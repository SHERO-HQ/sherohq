"use client";
import { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Filter,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import type { Category } from "./ProductsCategories";
import type { FilterState } from "./ProductFilters";

interface CategorySidebarProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  className?: string;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  filters,
  onFilterChange,
  className = "",
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(["price"]);

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
    { label: "Under GH₵500", range: [0, 500] as [number, number] },
    { label: "GH₵500 - GH₵1,000", range: [500, 1000] as [number, number] },
    { label: "GH₵1,000 - GH₵3,000", range: [1000, 3000] as [number, number] },
    { label: "GH₵3,000 - GH₵5,000", range: [3000, 5000] as [number, number] },
    { label: "Above GH₵5,000", range: [5000, 1000000] as [number, number] },
  ];

  const isPriceRangeActive = (range: [number, number]) => {
    return (
      filters.priceRange[0] === range[0] && filters.priceRange[1] === range[1]
    );
  };

  return (
    <aside
      className={`w-full shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Categories
        </h3>
      </div>

      {/* Categories List - Jiji Style (Always Visible) */}
      <div className="p-2 space-y-1 border-b border-slate-200 dark:border-slate-800">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded transition-all group ${
              activeCategory === category.id
                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`transition-colors ${activeCategory === category.id ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`}
              >
                {category.icon}
              </span>
              <span>{category.name}</span>
            </div>
            {(category.count || 0) > 0 && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  activeCategory === category.id
                    ? "bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500"
                }`}
              >
                {category.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
            Filters
          </h4>
        </div>
        <button
          onClick={() =>
            onFilterChange({
              priceRange: [0, 1000000],
              brands: [],
              minRating: 0,
              inStock: false,
              sortBy: "newest",
            })
          }
          className="text-xs text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Price Filter */}
        <div>
          <button
            onClick={() => toggleSection("price")}
            className="flex items-center justify-between w-full mb-3 text-sm font-semibold text-slate-800 dark:text-white"
          >
            <span>Price Range</span>
            {expandedSections.includes("price") ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
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
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      isPriceRangeActive(range.range)
                        ? "bg-emerald-600 border-emerald-600"
                        : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 group-hover:border-emerald-500"
                    }`}
                  >
                    {isPriceRangeActive(range.range) && (
                      <Check className="w-3 h-3 text-white" />
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
                    className={`text-sm ${isPriceRangeActive(range.range) ? "text-emerald-700 dark:text-emerald-400 font-medium" : "text-slate-600 dark:text-slate-400"}`}
                  >
                    {range.label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Brand Filter */}
        <div>
          <button
            onClick={() => toggleSection("brand")}
            className="flex items-center justify-between w-full mb-3 text-sm font-semibold text-slate-800 dark:text-white"
          >
            <span>Brand</span>
            {expandedSections.includes("brand") ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
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
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      filters.brands.includes(brand)
                        ? "bg-emerald-600 border-emerald-600"
                        : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 group-hover:border-emerald-500"
                    }`}
                  >
                    {filters.brands.includes(brand) && (
                      <Check className="w-3 h-3 text-white" />
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
                    className={`text-sm ${filters.brands.includes(brand) ? "text-emerald-700 dark:text-emerald-400 font-medium" : "text-slate-600 dark:text-slate-400"}`}
                  >
                    {brand}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Stock Filter - simplified */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <label className="flex items-center gap-3 cursor-pointer group py-2">
            <div
              className={`shrink-0 w-10 h-6 rounded-full p-1 transition-colors duration-300 ${filters.inStock ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"}`}
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
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              In Stock Only
            </span>
          </label>
        </div>
      </div>
    </aside>
  );
};

export default CategorySidebar;
