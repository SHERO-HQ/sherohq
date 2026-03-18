"use client";
import { useState, useMemo, useEffect } from "react";
import ProductSpotlight from "./ProductSpotlight";
import { defaultCategories } from "@/utils/defaultCategories";
import type { Category } from "./ProductsCategories";
import ProductFilters from "./ProductFilters";
import type { FilterState } from "./ProductFilters";
import CategorySidebar from "./CategorySidebar";
import ProductGrid from "./ProductsGrid";
import type { Product } from "@/types/product";
import { SlidersHorizontal, Package } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import ProductSearch from "./ProductSearch";
import { useProducts } from "@/hooks/queries/useProducts";
import { useCategories } from "@/hooks/queries/useCategories";

interface ApiCategory {
  id: string;
  name: string;
}

const ShopView = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // TanStack Query
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: apiCategories = [], isLoading: categoriesLoading } =
    useCategories();

  const loading = productsLoading || categoriesLoading;

  const [activeCategory, setActiveCategory] = useState("all");
  // Derive searchQuery from URL params instead of using useEffect + setState
  const searchQuery = useMemo(
    () => searchParams.get("search") || "",
    [searchParams],
  );
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 1000000],
    brands: [],
    minRating: 0,
    inStock: false,
    sortBy: "newest",
  });

  // Merge API categories with hardcoded icons and count
  const categoriesWithCount: Category[] = useMemo(() => {
    // Start with "All Products"
    const allCategory: Category = {
      id: "all",
      name: "All Products",
      icon: <Package className="w-6 h-6" />,
      count: products.length,
    };

    const dynamicCategories: Category[] = apiCategories.map(
      (cat: ApiCategory) => ({
        id: cat.id,
        name: cat.name,
        icon: defaultCategories.find((c) => c.id === cat.id)?.icon || (
          <Package className="w-6 h-6" />
        ),
        count: products.filter(
          (p: Product) => (p.categoryId || p.category) === cat.id,
        ).length,
      }),
    );

    // Filter out duplicates if any, and ensure unique keys
    const seen = new Set(["all"]);
    const uniqueDynamic = dynamicCategories.filter((cat) => {
      if (seen.has(cat.id)) return false;
      seen.add(cat.id);
      return true;
    });

    return [allCategory, ...uniqueDynamic];
  }, [apiCategories, products]);

  // Filter and sort products
  const getFilteredProducts = (): Product[] => {
    let filtered = [...products];

    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter(
        (p) => (p.categoryId || p.category) === activeCategory,
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Filter by price range
    filtered = filtered.filter(
      (p) =>
        p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1],
    );

    // Filter by rating
    if (filters.minRating > 0) {
      filtered = filtered.filter((p) => p.rating >= filters.minRating);
    }

    // Filter by brand
    if (filters.brands.length > 0) {
      filtered = filtered.filter((p) =>
        filters.brands.some((brand) =>
          p.name.toLowerCase().includes(brand.toLowerCase()),
        ),
      );
    }

    // Filter by stock
    if (filters.inStock) {
      filtered = filtered.filter((p) => p.inStock);
    }

    // Sort products
    switch (filters.sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      default: // newest
        // Assuming products from API are already sorted by newest or we can add createdAt
        break;
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  // Handle search - only update URL params, searchQuery is derived from URL
  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  // Close mobile filters when clicking outside
  useEffect(() => {
    if (showMobileFilters) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showMobileFilters]);

  // Handle filter changes from sidebar/drawer
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    // Optional: scroll to top of grid on filter change if needed
  };

  const handleReset = () => {
    setFilters({
      priceRange: [0, 1000000],
      brands: [],
      minRating: 0,
      inStock: false,
      sortBy: "newest",
    });
    setActiveCategory("all");
    handleSearch("");
  };

  return (
    <div className="min-h-screen dark:bg-slate-950">
      {/* Hero Section - Product Spotlight */}
      <ProductSpotlight products={products} isLoading={productsLoading} />

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col gap-8">
          {/* Horizontal Filter Bar - Sticky */}
          <div className="sticky top-20 sm:top-24 z-30 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex flex-col gap-4 sm:gap-6 bg-white/5 dark:bg-slate-950/80 backdrop-blur-sm border border-white/10 p-3 sm:p-4 sm:rounded shadow-lg shadow-black/20">
              <div className="flex flex-col md:flex-row items-center gap-3 sm:gap-4">
                <div className="flex-1 w-full">
                  <ProductSearch
                    onSearch={handleSearch}
                    initialQuery={searchQuery}
                    className="mb-0"
                  />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 cursor-pointer px-3 py-2 sm:px-4 sm:py-2 dark:bg-white/5 bg-slate-100 hover:bg-emerald-500/10 backdrop-blur-sm border border-white/10 rounded font-bold dark:text-slate-200 text-slate-800 transition hover:border-emerald-500/50 group text-xs sm:text-base"
                  >
                    <SlidersHorizontal
                      size={16}
                      className="group-hover:rotate-180 transition-transform duration-500 sm:w-4.5 sm:h-4.5"
                    />
                    <span>Advanced Filters</span>
                  </button>
                  <div className="relative group flex-1 md:flex-none">
                    <select
                      value={filters.sortBy}
                      onChange={(e) =>
                        handleFilterChange({
                          ...filters,
                          sortBy: e.target.value,
                        })
                      }
                      className="w-full text-[10px] sm:text-sm border-white/10 bg-slate-100 dark:bg-white/5 rounded font-bold dark:text-white text-slate-800 focus:ring-emerald-500 cursor-pointer py-3 px-3 sm:px-4 appearance-none pr-8 sm:pr-10"
                    >
                      <option value="newest">Sort: Newest</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Top Rated</option>
                    </select>
                    <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Package size={12} className="sm:w-3.5 sm:h-3.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Horizontal Category Pill List */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1 touch-pan-x">
                {categoriesWithCount.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded whitespace-nowrap transition border duration-300 ${
                      activeCategory === cat.id
                        ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/40 scale-105"
                        : "bg-white/5 border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white/10 hover:border-emerald-500/30"
                    }`}
                  >
                    <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform">
                      {cat.icon}
                    </span>
                    <span className="text-[10px] sm:text-sm font-bold tracking-tight">
                      {cat.name}
                    </span>
                    <span
                      className={`text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded font-mono ${
                        activeCategory === cat.id
                          ? "bg-white/20 text-white"
                          : "bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Results */}
          <main className="flex-1 min-w-0">
            {/* Results Header (Desktop) - Optional now, keeping it subtle */}
            <div className="flex items-center justify-between mb-8 px-2">
              <div>
                <h2 className="text-xl font-black dark:text-white text-slate-800 tracking-tight uppercase">
                  {activeCategory === "all"
                    ? "Browsing All"
                    : `Exploring ${categoriesWithCount.find((c) => c.id === activeCategory)?.name}`}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1 w-8 bg-emerald-500 rounded" />
                  <p className="text-xs font-mono dark:text-slate-500 text-slate-500 uppercase tracking-widest">
                    {filteredProducts.length}{" "}
                    {filteredProducts.length === 1 ? "result" : "results"} found
                  </p>
                </div>
              </div>
            </div>

            <ProductGrid
              products={filteredProducts}
              loading={loading}
              columns={3}
              onReset={handleReset}
            />
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <ProductFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        categories={categoriesWithCount}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />
    </div>
  );
};

export default ShopView;
