"use client";
import { useState, useMemo, useEffect } from "react";
import ProductHero from "./ProductsHero";
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

const ShopPage = () => {
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

  // Fetching moved to useProducts hook above
  //useEffect(() => { ... }, []);

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
        count: products.filter((p: Product) => p.category === cat.id).length,
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
      filtered = filtered.filter((p) => p.category === activeCategory);
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
  };

  return (
    <div className="min-h-screen dark:bg-slate-950">
      {/* Hero Section - Reduced props */}
      <ProductHero />

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar (Hidden on Mobile) */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <CategorySidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                categories={categoriesWithCount}
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
              />
            </div>
          </div>
          {/* Mobile Filter Toggle (Visible only on Mobile) */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="w-full flex items-center justify-center gap-2 cursor-pointer px-4 py-2 dark:bg-slate-900/80 bg-slate-400/20 hover:bg-emerald-400/20 backdrop-blur-md border border-white/10 rounded font-medium dark:text-slate-200 text-slate-800 shadow-md hover:border-emerald-500/50 transition-colors"
            >
              <SlidersHorizontal />
              <span>Filter Shop</span>
              <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-xs font-bold shadow-sm shadow-emerald-500/20">
                {filteredProducts.length}
              </span>
            </button>
          </div>
          {/* Products Grid */}
          <main className="flex-1 min-w-0">
            {/* Search Bar - Moved from Hero */}
            <ProductSearch
              onSearch={handleSearch}
              initialQuery={searchQuery}
              className="mb-8"
            />

            {/* Results Header (Desktop) */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold dark:text-white text-slate-800">
                  {activeCategory === "all"
                    ? "Shop All"
                    : categoriesWithCount.find((c) => c.id === activeCategory)
                        ?.name}
                </h2>
                <p className="text-sm dark:text-slate-400 text-slate-500 mt-1">
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? "item" : "items"} found
                </p>
              </div>

              {/* Sort Dropdown could go here */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Sort by:</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    handleFilterChange({ ...filters, sortBy: e.target.value })
                  }
                  className="text-sm border-none bg-transparent font-medium text-white focus:ring-0 cursor-pointer [&>option]:text-slate-900 custom-select pr-8"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>
            {/* Products */}
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

export default ShopPage;
