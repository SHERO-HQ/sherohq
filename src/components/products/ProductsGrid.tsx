"use client";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import ProductCard from "./ProductCard";
import type { Product } from "@/types/product";
import { PackageX, Sparkles, RefreshCcw } from "lucide-react";
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

 // Loading State - Show skeleton grid
 if (loading) {
 return <ProductGridSkeleton count={12} />;
 }

 // Empty State
 if (products.length === 0) {
 return (
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 className="w-full py-24 flex flex-col items-center justify-center text-center"
 >
 <div className="relative mb-8 group">
 <div className="absolute inset-0 blur-[50px] group-hover:bg-emerald-500/30 transition-colors duration-500" />
 <div className="relative w-32 h-32 backdrop-blur-sm flex items-center justify-center">
 <PackageX className="w-16 h-16 text-slate-300 dark:text-slate-700" />
 </div>
 </div>

 <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-3">
 No <span className="text-emerald-500">Products</span> Found
 </h3>
 <p className="text-sm font-medium text-slate-500 tracking-widest mb-10 max-w-md">
    Try adjusting your filters or explore our full collection of innovative tech solutions.
 </p>

 <button
 onClick={() => (onReset ? onReset() : router.refresh())}
 className="group flex items-center gap-3 px-10 h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded shadow shadow-emerald-500/20 active:scale-95 transition"
 >
 <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-700" />
 Reset Search
 </button>
 </motion.div>
 );
 }

 // Products Grid
 return (
 <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 ${gridCols[columns]} gap-x-3 gap-y-6`}>
 <AnimatePresence mode="popLayout">
 {products.map((product, idx) => (
 <motion.div
 key={product.id}
 layout
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.9 }}
 transition={{ 
 duration: 0.5, 
 delay: idx * 0.05,
 type: "spring",
 damping: 25,
 stiffness: 120
 }}
 >
 <ProductCard product={product} onQuickView={onQuickView} />
 </motion.div>
 ))}
 </AnimatePresence>
 </div>
 );
};

export default ProductGrid;
