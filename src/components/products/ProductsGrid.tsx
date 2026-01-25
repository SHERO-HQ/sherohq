import { motion } from "motion/react";
import ProductCard from "./ProductCard";
import type { Product } from "@/data/products";
import { Loader2, PackageX } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onQuickView?: (product: Product) => void;
  columns?: 2 | 3 | 4;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  onQuickView,
  columns = 3,
}) => {
  const gridCols = {
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Loading State
  if (loading) {
    return (
      <div className="w-full py-20">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  // Empty State
  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full py-20"
      >
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <div
            className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 
                        flex items-center justify-center"
          >
            <PackageX className="w-12 h-12 text-slate-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              No Products Found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Try adjusting your filters or search terms
            </p>
          </div>
          <button
            onClick={() => globalThis.location.reload()}
            className="cursor-pointer px-6 py-3 rounded bg-emerald-600 text-white font-semibold
                     hover:bg-emerald-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </motion.div>
    );
  }

  // Products Grid
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols[columns]} gap-6 lg:gap-8`}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onQuickView={onQuickView}
        />
      ))}
    </motion.div>
  );
};

export default ProductGrid;
