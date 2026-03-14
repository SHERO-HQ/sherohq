"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  ArrowRight,
  Star,
  Package,
} from "lucide-react";
import Link from "next/link";
import { getImageUrl } from "@/services/api";
import type { Product } from "@/types/product";
import AppImage from "@/components/common/AppImage";
import { formatCurrency } from "@/utils/format";
import { getAbsoluteUrl } from "@/utils/subdomain";

interface ProductSpotlightProps {
  products: Product[];
  isLoading?: boolean;
}

const ProductSpotlight = ({ products, isLoading }: ProductSpotlightProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Filter for items with images and preferably rating/reviews to look premium
  const spotlightItems = useMemo(() => {
    if (!products.length) return [];
    // Prioritize products with images, limit to first 5
    const filtered = products.filter((p) => p.image).slice(0, 5);
    return filtered.length > 0 ? filtered : products.slice(0, 5);
  }, [products]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % spotlightItems.length);
  }, [spotlightItems.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(
      (prev) => (prev - 1 + spotlightItems.length) % spotlightItems.length,
    );
  }, [spotlightItems.length]);

  useEffect(() => {
    if (!isAutoPlaying || spotlightItems.length <= 1) return;
    const interval = setInterval(nextSlide, 8000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, spotlightItems.length]);

  if (isLoading || !spotlightItems.length) {
    return (
      <div className="relative w-full h-[60vh] lg:h-[70vh] bg-slate-100 dark:bg-slate-900 animate-pulse rounded overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <Package className="w-12 h-12 text-slate-300 animate-bounce" />
        </div>
      </div>
    );
  }

  const currentProduct = spotlightItems[currentIndex];

  return (
    <section className="relative w-full min-h-screen lg:h-[85vh] overflow-hidden group/spotlight flex items-center py-20 lg:py-0">
      {/* Background kinetic pattern */}
      <div className="absolute inset-0 pattern-dots opacity-40 dark:opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-white dark:to-slate-950 pointer-events-none" />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentProduct.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="w-full"
        >
          {/* Background Ambient Glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none" />

          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-1 lg:gap-8 items-center lg:items-center">
              {/* Product Info Block */}
              <motion.div
                initial={false}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  delay: 0.2,
                  duration: 0.8,
                  type: "spring",
                  damping: 20,
                }}
                className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1 w-full lg:w-1/2 mt-8 pt-4 md:pt-auto lg:mt-0 bg-slate-200/90 dark:bg-slate-800/90 md:bg-transparent md:dark:bg-transparent"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-2 lg:mb-3 rounded border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm">
                  <ShoppingBag className="size-3 text-emerald-500" />
                  <span className="text-[10px] font-mono font-black tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
                    Featured Spotlight
                  </span>
                </div>

                <h2 className="text-xl lg:text-5xl font-black font-sora text-slate-900 dark:text-white leading-[1.1] tracking-tighter mb-4 lg:mb-6 uppercase">
                  {currentProduct.name.split(" ").map((word, i) => (
                    <span key={i} className={i === 0 ? "text-emerald-500" : ""}>
                      {word}{" "}
                    </span>
                  ))}
                </h2>

                <p className="text-sm lg:text-lg text-slate-600 dark:text-slate-400 mb-6 lg:mb-8 max-w-lg leading-relaxed line-clamp-3 lg:line-clamp-none">
                  {currentProduct.description ||
                    "Unlocking the next level of performance with precision engineering and state-of-the-art technology."}
                </p>

                <div className="flex items-center justify-center lg:justify-start gap-6 mb-8 lg:mb-10 w-full lg:w-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                      Price
                    </span>
                    <span className="text-2xl lg:text-3xl font-black font-sora text-slate-900 dark:text-white">
                      {formatCurrency(currentProduct.price)}
                    </span>
                  </div>
                  <div className="h-10 w-px bg-slate-200 dark:bg-white/10" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                      Category
                    </span>
                    <span className="text-xs lg:text-sm font-bold uppercase text-emerald-600 dark:text-emerald-400">
                      {currentProduct.category}
                    </span>
                  </div>
                  {currentProduct.rating > 0 && (
                    <>
                      <div className="h-10 w-px bg-slate-200 dark:bg-white/10" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                          Satisfaction
                        </span>
                        <div className="flex items-center gap-1.5 justify-center lg:justify-start">
                          <Star
                            size={12}
                            className="fill-amber-400 text-amber-400"
                          />
                          <span className="text-xs lg:text-sm font-black dark:text-slate-200">
                            {currentProduct.rating}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <Link
                  href={getAbsoluteUrl(`/products/${currentProduct.slug || currentProduct.sku || currentProduct.id}`)}
                  className="group w-full sm:w-auto flex items-center justify-center gap-4 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 dark:hover:bg-emerald-500 dark:hover:text-white transition shadow-lg shadow-black/20"
                >
                  See Details
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-2 transition-transform"
                  />
                </Link>
              </motion.div>

              {/* Product Visual Block */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.3,
                  duration: 1,
                  type: "spring",
                  damping: 15,
                }}
                className="relative flex items-center justify-center order-1 lg:order-2 w-full lg:w-1/2 mb-4 lg:mb-0"
              >
                <div className="relative w-full h-[260px] sm:h-[340px] lg:h-[420px] group/image flex items-center justify-center p-6 sm:p-10">
                  {/* Decorative Elements */}
                  <div className="absolute inset-0 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-2xl sm:blur-3xl group-hover/image:scale-110 transition-transform duration-1000" />

                  {/* The Image */}
                  <div className="relative w-full h-full drop-shadow-sm dark:drop-shadow-sm group-hover/image:-translate-y-4 transition-transform duration-700 ease-out z-0">
                    <AppImage
                      src={getImageUrl(currentProduct.image)}
                      alt={currentProduct.name}
                      fill
                      priority
                      className="object-contain"
                    />
                  </div>

                  {/* Glass Card Floating Badge */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="absolute -bottom-2 -right-2 sm:-bottom-4 sm:-right-4 p-2 sm:p-4 rounded bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border border-white/20 shadow-lg z-20"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                        <Package className="w-3 h-3 sm:w-5 sm:h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[7px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Available
                        </span>
                        <span
                          className={`text-[9px] sm:text-xs font-bold ${currentProduct.inStock ? "text-emerald-500" : "text-red-500"}`}
                        >
                          {currentProduct.inStock
                            ? "In Stock"
                            : "Limited Stock"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute bottom-0 pb-3 lg:bottom-10 left-0 right-0 z-30 pointer-events-none bg-slate-200/90 dark:bg-slate-800/90 md:bg-transparent md:dark:bg-transparent pt-4 md:pt-auto">
        <div className="container max-w-7xl mx-auto px-4 flex md:flex-col-reverse justify-around ">
          <div className="flex items-center gap-2 sm:gap-4 pointer-events-auto mt-2">
            {spotlightItems.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentIndex(i);
                  setIsAutoPlaying(false);
                }}
                className={`h-1 transition duration-500 rounded-full ${
                  i === currentIndex
                    ? "w-8 sm:w-12 bg-emerald-500"
                    : "w-2 sm:w-4 bg-slate-300 dark:bg-white/10 hover:bg-slate-400 dark:hover:bg-white/20"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
            <button
              onClick={() => {
                prevSlide();
                setIsAutoPlaying(false);
              }}
              className="p-3 sm:p-4 rounded bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition active:scale-95"
            >
              <ChevronLeft size={20} className="sm:size-6" />
            </button>
            <button
              onClick={() => {
                nextSlide();
                setIsAutoPlaying(false);
              }}
              className="p-3 sm:p-4 rounded bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition active:scale-95"
            >
              <ChevronRight size={20} className="sm:size-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Autoplay Progress Bar */}
      {isAutoPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-white/5 overflow-hidden">
          <motion.div
            key={currentIndex}
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{ duration: 8, ease: "linear" }}
            className="h-full bg-emerald-500"
          />
        </div>
      )}
    </section>
  );
};

export default ProductSpotlight;
