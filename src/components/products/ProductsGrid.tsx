"use client";
import React from "react";
import { m, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import ProductCard from "./ProductCard";
import type { Product } from "@/types/product";
import { PackageX, RefreshCcw } from "lucide-react";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onQuickView?: (product: Product) => void;
  columns?: 2 | 3 | 4;
  onReset?: () => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  onQuickView,
  columns = 3,
  onReset,
}) => {
  const router = useRouter();
  const gridCols = {
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
  };

  const [visibleCount, setVisibleCount] = React.useState(12);

  // Loading State - Show skeleton grid
  if (loading) {
    return <ProductGridSkeleton count={12} />;
  }

  // Empty State
  if (products.length === 0) {
    return (
      <m.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full py-12 flex flex-col items-center justify-center text-center"
      >
        <div className="relative mb-4 group">
          <div className="absolute inset-0 blur-[50px] group-hover:bg-brand-secondary-500/30 transition-colors duration-500" />
          <div className="relative w-32 h-32  flex items-center justify-center">
            <PackageX className="w-16 h-16 text-slate-300 dark:text-slate-700" />
          </div>
        </div>

        <h3 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter mb-3">
          No <span className="text-brand-secondary-500">Products</span> Found
        </h3>
        <p className="text-sm font-medium text-slate-500 tracking-widest mb-6 max-w-md">
          Try adjusting your filters or explore our full collection of
          innovative tech solutions.
        </p>

        <button
          onClick={() => {
            setVisibleCount(12);
            if (onReset) onReset();
            else router.refresh();
          }}
          className="group flex items-center gap-3 px-10 h-10 bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white font-bold uppercase tracking-widest text-xs rounded shadow shadow-brand-secondary-500/20 active:scale-95 transition"
        >
          <RefreshCcw
            size={18}
            className="group-hover:rotate-180 transition-transform duration-700"
          />
          Reset Search
        </button>
      </m.div>
    );
  }

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  // Products Grid
  return (
    <div className="flex flex-col items-center w-full">
      <div
        className={`w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 ${gridCols[columns]} gap-x-3 gap-y-6`}
      >
        <AnimatePresence>
          {visibleProducts.map((product, idx) => (
            <m.div
              key={product.id}
              layout={false}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.3,
                delay: Math.min(idx * 0.03, 0.15),
                type: "tween",
              }}
            >
              <ProductCard product={product} onQuickView={onQuickView} />
            </m.div>
          ))}
        </AnimatePresence>
      </div>

      {hasMore && (
        <div className="mt-12 mb-8 flex justify-center w-full">
          <button
            onClick={() => setVisibleCount((prev) => prev + 12)}
            className="px-8 py-3 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors shadow-sm"
          >
            Load More Products
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
