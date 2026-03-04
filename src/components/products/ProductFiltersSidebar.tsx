"use client";
import { Check, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
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
    { label: "Under GH₵500", range: [0, 500] as [number, number] },
    { label: "GH₵500 - GH₵1,000", range: [500, 1000] as [number, number] },
    { label: "GH₵1,000 - GH₵3,000", range: [1000, 3000] as [number, number] },
    { label: "GH₵3,000 - GH₵5,000", range: [3000, 5000] as [number, number] },
    { label: "Above GH₵5,000", range: [5000, 1000000] as [number, number] },
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
      <div className="dark:bg-slate-900/60 bg-slate-200/60 backdrop-blur-xl border border-white/5 rounded p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-8 border-b dark:border-white/5 border-slate-300 pb-4">
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
                        ? "text-emerald-600 dark:text-emerald-400 font-medium"
                        : "text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                    }`}
                  >
                    <span className="text-sm">{category.name}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                        activeCategory === category.id
                          ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20"
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
                      className={`w-4 h-4 rounded border border-emerald-700 flex items-center justify-center transition-all duration-200
                      ${isPriceRangeActive(range.range) ? "bg-emerald-400 border-emerald-400" : "dark:bg-slate-800/50 group-hover:border-emerald-500"}`}
                    >
                      {isPriceRangeActive(range.range) && (
                        <Check className="w-3 h-3 dark:text-white text-emerald-700" />
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
                      className={`text-sm tracking-wide ${isPriceRangeActive(range.range) ? "dark:text-emerald-400 text-emerald-600 font-medium" : "dark:text-slate-400 text-slate-600 dark:group-hover:text-slate-300 group-hover:text-emerald-600 transition-colors"}`}
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
                      className={`w-4 h-4 rounded border dark:border-white/5 border-slate-600 flex items-center justify-center transition-all duration-200
                      ${filters.brands.includes(brand) ? "bg-emerald-400 border-emerald-700" : "dark:bg-slate-800/50 group-hover:border-emerald-500"}`}
                    >
                      {filters.brands.includes(brand) && (
                        <Check className="w-3 h-3 dark:text-white text-emerald-700" />
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
                      className={`text-sm tracking-wide ${filters.brands.includes(brand) ? "text-emerald-600 font-medium" : "dark:text-slate-400 dark:group-hover:text-slate-300 group-hover:text-emerald-600 transition-colors"}`}
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
                    <div className="flex items-center space-x-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={`star-${i}`}
                          className={`text-2xl ${i < rating ? "text-amber-400" : "text-slate-700"}`}
                        >
                          ★
                        </span>
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
                  className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${filters.inStock ? "bg-emerald-600" : "dark:bg-slate-700 bg-slate-500"}`}
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
