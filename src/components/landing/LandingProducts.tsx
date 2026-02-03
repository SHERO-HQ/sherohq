import { motion } from "motion/react";
import { NavLink } from "react-router-dom";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import ProductCard from "@/components/products/ProductCard";
import type { Product } from "@/data/products";
import { fetchProducts } from "@/services/api";

const ProductSkeleton = () => (
  <div className="rounded overflow-hidden bg-slate-200/60 dark:bg-slate-900/40 border border-white/5 animate-pulse">
    <div className="h-40 sm:h-52 bg-slate-300 dark:bg-slate-800" />
    <div className="p-3 sm:p-4 space-y-3">
      <div className="flex justify-between">
        <div className="h-4 w-16 bg-slate-300 dark:bg-slate-700 rounded" />
        <div className="h-4 w-10 bg-slate-300 dark:bg-slate-700 rounded" />
      </div>
      <div className="h-5 w-3/4 bg-slate-300 dark:bg-slate-700 rounded" />
      <div className="h-4 w-1/2 bg-slate-300 dark:bg-slate-700 rounded" />
      <div className="flex gap-2 mt-2">
        <div className="h-9 flex-1 bg-slate-300 dark:bg-slate-700 rounded" />
        <div className="h-9 flex-1 bg-slate-300 dark:bg-slate-700 rounded" />
      </div>
    </div>
  </div>
);

const LandingProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const allProducts = await fetchProducts();
        // Filter for in-stock items and shuffle for "random suggestions"
        const inStockProducts = allProducts.filter((p) => p.inStock);
        const shuffled = [...inStockProducts].sort(() => 0.5 - Math.random());
        setProducts(shuffled);
      } catch (error) {
        console.error(
          "Failed to load landing products, falling back to static data:",
          error,
        );
        // Fallback to static products if API fails
        try {
          const { products: staticProducts } = await import("@/data/products");
          const inStockProducts = staticProducts.filter((p) => p.inStock);
          const shuffled = [...inStockProducts].sort(() => 0.5 - Math.random());
          setProducts(shuffled);
        } catch (fallbackError) {
          console.error(
            "Critical: Failed to load fallback products:",
            fallbackError,
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categories = ["All", "Laptops", "Accessories", "Mobile"];

  const getFilteredProducts = () => {
    if (activeCategory === "All") {
      return products;
    }
    return products.filter(
      (product) =>
        product.category.toLowerCase() === activeCategory.toLowerCase() ||
        (activeCategory === "Laptops" &&
          product.category.toLowerCase() === "laptop"),
    );
  };

  const filteredProducts = getFilteredProducts();

  return (
    <section className="relative w-full py-20 bg-white dark:bg-slate-950">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-500/50 dark:border-emerald-800/50 rounded uppercase">
            <ShoppingCart className="mr-2 w-4 h-4" />
            Featured Products
          </span>
          <h2 className="text-4xl md:text-5xl font-sora font-bold text-slate-900 dark:text-slate-200 mb-4">
            Premium Tech Products
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Elevate your tech experience with our curated collection of
            high-quality products designed to enhance your digital lifestyle
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 rounded text-sm font-medium transition-all duration-300 cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950
                ${
                  activeCategory === category
                    ? "bg-emerald-600 text-white shadow-lg"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400"
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {isLoading && (
            <>
              {[0, 1, 2, 3].map((i) => (
                <ProductSkeleton key={`skeleton-${i}`} />
              ))}
            </>
          )}
          {!isLoading && filteredProducts.length > 0 && (
            <>
              {filteredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </>
          )}
          {!isLoading && filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                No products found in this category
              </p>
            </div>
          )}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center"
        >
          <NavLink
            to="/products"
            className="inline-flex items-center gap-3 px-8 py-2 rounded
                     border-2 border-slate-300 dark:border-slate-700
                     text-slate-700 dark:text-slate-300 font-semibold
                     hover:border-emerald-500 dark:hover:border-emerald-500
                     hover:text-emerald-600 dark:hover:text-emerald-400
                     hover:shadow-lg
                     transition-all duration-300 group"
          >
            <span>View All Products</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </NavLink>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingProducts;
