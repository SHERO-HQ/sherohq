"use client";
import { FadeInView } from "@/components/motion/AnimateSection";
import Link from "next/link";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { SectionBadge } from "@/components/common/SectionBadge";
import { useState, useMemo, useEffect } from "react";
import ProductCard from "@/components/products/ProductCard";
import { useProducts } from "@/hooks/queries/useProducts";
import { defaultCategories } from "@/utils/defaultCategories";
import { ErrorState } from "../common/ErrorState";

const ProductSkeleton = () => (
  <div className="rounded overflow-hidden bg-slate-200/60 dark:bg-slate-900/40 border border-white/5 animate-pulse">
    <div className="h-40 sm:h-52 bg-slate-300 dark:bg-slate-800" />
    <div className="p-3 sm:p-4 space-y-3">
      <div className="flex justify-between items-center mb-1">
        <div className="h-3.5 w-16 bg-slate-300 dark:bg-slate-700 rounded" />
        <div className="h-3 w-8 bg-slate-300 dark:bg-slate-700 rounded-full" />
      </div>
      <div className="h-5 w-3/4 bg-slate-300 dark:bg-slate-700 rounded" />
      <div className="h-8 w-1/2 bg-slate-300 dark:bg-slate-700 rounded mt-4" />
      <div className="flex gap-1.5 mt-2">
        <div className="h-9 flex-1 bg-slate-300 dark:bg-slate-700 rounded" />
        <div className="h-9 flex-1 bg-slate-300 dark:bg-slate-700 rounded" />
      </div>
    </div>
  </div>
);

const LandingProducts = () => {
  const {
    data: rawProducts,
    isLoading,
    isError,
    error,
    refetch,
  } = useProducts();
  const allProducts = useMemo(() => rawProducts ?? [], [rawProducts]);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const [shuffledProducts, setShuffledProducts] = useState<typeof allProducts>(
    [],
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter for in-stock items and shuffle for "random suggestions"
  useEffect(() => {
    if (allProducts.length > 0) {
      const inStock = allProducts.filter((p) => p.inStock);
      const featured = inStock.filter((p) => p.isFeatured);
      const regular = inStock.filter((p) => !p.isFeatured);
      const shuffledFeatured = [...featured].sort(() => 0.5 - Math.random());
      const shuffledRegular = [...regular].sort(() => 0.5 - Math.random());
      const timer = setTimeout(() => {
        setShuffledProducts([...shuffledFeatured, ...shuffledRegular]);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [allProducts]);

  const products =
    shuffledProducts.length > 0
      ? shuffledProducts
      : allProducts.filter((p) => p.inStock);

  const categories = defaultCategories.map((category) => category.name);

  const getFilteredProducts = () => {
    if (activeCategory === "All") {
      return products;
    }
    return products.filter((product) => {
      const categoryName = product.category.toLowerCase();
      const categoryId = (product.categoryId || "").toLowerCase();
      const target = activeCategory.toLowerCase();

      return (
        categoryName === target ||
        categoryId === target ||
        (target === "laptops" && categoryName === "laptop")
      );
    });
  };

  const filteredProducts = getFilteredProducts();

  return (
    <section className="relative w-full py-12 bg-white dark:bg-slate-950">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeInView direction="up" delay={0}>
          <div className="text-center mb-8">
            <SectionBadge icon={ShoppingCart} className="mb-4">
              Featured Deals
            </SectionBadge>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4">
              Explore Curated Hardware
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Shop laptops, phones, accessories and more with free delivery on
              orders over <span className="font-semibold text-brand-secondary-500 dark:text-brand-secondary-400">GHS2000</span>
            </p>
          </div>
        </FadeInView>

        {/* Category Filter */}
        <div className="flex justify-center mb-8">
          <div
            role="group"
            aria-label="Product categories"
            className="w-full max-w-fit mx-auto h-auto p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 overflow-x-auto no-scrollbar justify-start sm:justify-center flex flex-nowrap gap-1"
          >
            {categories.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveCategory(category)}
                  className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-brand-secondary-800 text-white shadow-sm"
                      : "text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-4">
          {(!mounted || isLoading) && (
            <>
              {[0, 1, 2, 3].map((i) => (
                <ProductSkeleton key={`skeleton-${i}`} />
              ))}
            </>
          )}
          {mounted && !isLoading && isError && (
            <div className="col-span-full">
              <ErrorState
                message={
                  error instanceof Error
                    ? error.message
                    : "Connect to server failed"
                }
                onRetry={refetch}
              />
            </div>
          )}
          {mounted && !isLoading && !isError && filteredProducts.length > 0 && (
            <>
              {filteredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </>
          )}
          {mounted && !isLoading && !isError && filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                No products found in this category
              </p>
            </div>
          )}
        </div>

        {/* View All CTA */}
        <FadeInView direction="none" delay={0.3}>
          <div className="text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-3 text-sm px-6 py-2 rounded
 border-2 border-slate-300 dark:border-slate-700
  text-slate-700 dark:text-slate-300 font-medium
  hover:border-brand-secondary-500 dark:hover:border-brand-secondary-500
  hover:text-brand-secondary-600 dark:hover:text-brand-secondary-400
  hover:shadow
  transition duration-300 group"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </FadeInView>
      </div>
    </section>
  );
};

export default LandingProducts;
