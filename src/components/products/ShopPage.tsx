"use client";
import { useState, useMemo, useEffect } from "react";
import ProductSpotlight from "./ProductSpotlight";
import { defaultCategories } from "@/utils/defaultCategories";
import type { Category } from "./ProductsCategories";
import ProductFilters from "./ProductFilters";
import type { FilterState } from "./ProductFilters";
import ProductGrid from "./ProductsGrid";
import type { Product } from "@/types/product";
import { SlidersHorizontal, Package, ChevronDown } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import ProductSearch from "./ProductSearch";
import { useProducts } from "@/hooks/queries/useProducts";
import { useCategories } from "@/hooks/queries/useCategories";
import { ErrorState } from "@/components/common/ErrorState";
import { ActiveFilters } from "./ActiveFilters";
import ProductFiltersSidebar from "./ProductFiltersSidebar";

interface ApiCategory {
  id: string;
  name: string;
}

const ShopView = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // TanStack Query
  const { 
    data: products = [], 
    isLoading: productsLoading,
    isError: productsError,
    error: productError,
    refetch: refetchProducts
  } = useProducts();
  
  const { 
    data: apiCategories = [], 
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch: refetchCategories
  } = useCategories();

  const loading = productsLoading || categoriesLoading;
  const isError = productsError || categoriesError;

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
      icon: <Package className="w-5 h-5" />,
      count: products.length,
    };

    const dynamicCategories: Category[] = apiCategories.map(
      (cat: ApiCategory) => ({
        id: cat.id,
        name: cat.name,
        icon: defaultCategories.find((c) => c.id === cat.id)?.icon || (
          <Package className="w-5 h-5" />
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
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 lg:py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-10">
          {/* Desktop Sidebar - Hidden on Mobile */}
          <aside className="hidden lg:block">
            <div className="sticky top-32">
              <ProductFiltersSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                categories={categoriesWithCount}
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
              />
            </div>
          </aside>

          <div className="flex flex-col gap-4 min-w-0 mt-4">
          {/* Horizontal Filter Bar - Sticky */}
          <div className="sticky top-16 sm:top-24 z-30 px-1 sm:px-0">
            <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-2 sm:p-4 rounded shadow shadow-black/20">
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
                    className="flex-1 flex items-center justify-center gap-2 cursor-pointer px-3 py-2 sm:px-4 sm:py-2 dark:bg-white/5 bg-slate-100 hover:bg-brand-secondary-500/10 border border-slate-200 dark:border-white/10 rounded font-bold dark:text-slate-200 text-slate-800 transition hover:border-brand-secondary-500/50 group text-xs sm:text-base h-9 sm:h-auto"
                  >
                    <SlidersHorizontal
                      size={16}
                      className="group-hover:rotate-180 transition-transform duration-500 sm:w-4.5 sm:h-4.5"
                    />
                    <span>Filters</span>
                  </button>

                  {/* Category Dropdown - Mobile/Tablet Only */}
                  <div className="relative flex-1 lg:hidden">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center text-slate-400">
                      <span className="text-base">{categoriesWithCount.find(c => c.id === activeCategory)?.icon}</span>
                    </div>
                    <select
                      value={activeCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full text-xs sm:text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded h-9 px-10 appearance-none text-slate-800 dark:text-white cursor-pointer focus:ring-2 focus:ring-brand-secondary-500/50 transition-all shadow-sm"
                    >
                      {categoriesWithCount.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} ({cat.count})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
                      <ChevronDown size={16} />
                    </div>
                  </div>

                  {/* Sort - Desktop Only in this bar */}
                  <div className="relative group hidden lg:block lg:w-48">
                    <select
                      value={filters.sortBy}
                      onChange={(e) =>
                        handleFilterChange({
                          ...filters,
                          sortBy: e.target.value,
                        })
                      }
                      className="w-full text-sm border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 rounded font-bold dark:text-white text-slate-800 focus:ring-brand-secondary-500 cursor-pointer py-2 px-4 appearance-none pr-10"
                    >
                      <option value="newest">Sort: Newest</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Top Rated</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Category Pills - Hidden on Mobile */}
              <div className="hidden lg:flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {categoriesWithCount.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded whitespace-nowrap transition border duration-300 ${
                      activeCategory === cat.id
                        ? "bg-brand-secondary-600 border-brand-secondary-500 text-white shadow shadow-brand-secondary-500/40"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-brand-secondary-500/30"
                    }`}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-sm font-bold tracking-tight">
                      {cat.name}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
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
          <main className="flex-1 min-w-0 pt-6 lg:pt-0">
            {/* Active Filters Summary */}
            <ActiveFilters 
              filters={filters}
              activeCategory={activeCategory}
              categories={categoriesWithCount}
              onRemoveCategory={() => handleCategoryChange("all")}
              onRemoveFilter={(key, value) => {
                if (key === "brands") {
                  setFilters({ ...filters, brands: filters.brands.filter(b => b !== value) });
                } else if (key === "priceRange") {
                  setFilters({ ...filters, priceRange: [0, 1000000] });
                } else {
                  setFilters({ ...filters, [key]: value });
                }
              }}
              onClearAll={handleReset}
            />

            {/* Results Header (Desktop) - Optional now, keeping it subtle */}
            <div className="flex items-center justify-between mb-6 px-2">
              <div>
                <h2 className="text-xl font-black dark:text-white text-slate-800 tracking-tight uppercase">
                  {activeCategory === "all"
                    ? "Browsing All"
                    : `Exploring ${categoriesWithCount.find((c) => c.id === activeCategory)?.name}`}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1 w-8 bg-brand-secondary-500 rounded" />
                  <p className="text-xs font-mono dark:text-slate-500 text-slate-500 uppercase tracking-widest">
                    {filteredProducts.length}{" "}
                    {filteredProducts.length === 1 ? "result" : "results"} found
                  </p>
                </div>
              </div>
            </div>

            {isError ? (
              <ErrorState 
                message={productError instanceof Error ? productError.message : "We're having trouble loading products. Please try again."}
                onRetry={() => {
                  refetchProducts();
                  refetchCategories();
                }}
              />
            ) : (
              <ProductGrid
                products={filteredProducts}
                loading={loading}
                columns={3}
                onReset={handleReset}
              />
            )}
          </main>
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <ProductFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
      />
    </div>
  );
};

export default ShopView;
