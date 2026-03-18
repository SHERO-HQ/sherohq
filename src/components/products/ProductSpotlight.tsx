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
    <section className="relative w-full h-auto lg:min-h-[calc(100vh-5rem)] overflow-hidden group/spotlight flex items-start lg:items-center pt-20 lg:pt-20">
      {/* Background kinetic pattern */}
      <div className="absolute inset-0 pattern-dots opacity-80 pointer-events-none" />
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
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75 sm:w-150 h-75 sm:h-150 bg-emerald-500/10 dark:bg-emerald-500/5 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none" />

          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center w-full max-w-5xl mx-auto">
              {/* Product Hero Block */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.8,
                  type: "spring",
                  damping: 20,
                }}
                className="relative w-full bg-linear-to-br from-white/5 to-transparent dark:from-white/2 lg:dark:from-transparent rounded lg:rounded-none overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12 relative">
                  {/* Left Side: Info (Overlay on Mobile, Split on LG) */}
                  <div className="absolute inset-x-0 bottom-0 z-20 lg:relative lg:inset-auto lg:w-1/2 flex flex-col justify-end lg:justify-center p-6 sm:p-8 lg:p-0 bg-linear-to-t from-slate-950/90 via-slate-950/60 to-transparent lg:bg-none lg:backdrop-blur-0">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="max-w-xl"
                    >
                      <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 lg:mb-4 rounded border border-emerald-500/20 bg-emerald-500/10 backdrop-blur-md">
                        <ShoppingBag className="size-3 text-emerald-500" />
                        <span className="text-[10px] font-mono font-black tracking-widest uppercase text-emerald-400">
                          Spotlight
                        </span>
                      </div>

                      <h2 className="text-3xl lg:text-7xl font-black text-white lg:text-slate-900 lg:dark:text-white leading-[1.05] tracking-tighter mb-4 uppercase">
                        {currentProduct.name.split(" ").map((word, i) => (
                          <span
                            key={i}
                            className={i === 0 ? "text-emerald-500" : ""}
                          >
                            {word}{" "}
                          </span>
                        ))}
                      </h2>

                      <p className="text-xs lg:text-base text-slate-300 lg:text-slate-600 lg:dark:text-slate-400 mb-6 lg:mb-8 line-clamp-2 lg:line-clamp-none max-w-xl leading-relaxed">
                        {currentProduct.description ||
                          "Unlocking the next level of performance with precision engineering and state-of-the-art technology."}
                      </p>

                      <div className="flex flex-wrap items-center gap-6 sm:gap-8 lg:gap-10">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 lg:text-slate-500 mb-1">
                            Price
                          </span>
                          <span className="text-2xl lg:text-4xl font-black text-white lg:text-slate-900 lg:dark:text-white">
                            {formatCurrency(currentProduct.price)}
                          </span>
                        </div>

                        {currentProduct.rating > 0 && (
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 lg:text-slate-500 mb-1">
                              Satisfaction
                            </span>
                            <div className="flex items-center gap-1.5">
                              <Star
                                size={14}
                                className="fill-amber-400 text-amber-400"
                              />
                              <span className="text-sm lg:text-lg font-black text-white lg:text-slate-900 lg:dark:text-white">
                                {currentProduct.rating}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="ml-auto lg:ml-0 pointer-events-auto">
                          <Link
                            href={getAbsoluteUrl(
                              `/shop/${currentProduct.slug || currentProduct.sku || currentProduct.id}`,
                            )}
                            className="group flex items-center justify-center gap-3 px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-emerald-500/20 hover:-translate-y-0.5"
                          >
                            Details
                            <ArrowRight
                              size={14}
                              className="group-hover:translate-x-1 transition-transform"
                            />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Right Side: Image with Content Wrapper (Background on Mobile, Relative Fixed on LG) */}
                  <div className="relative w-full lg:w-[56%] aspect-4/5 sm:aspect-16/10 lg:aspect-auto h-160 lg:h-190 group/image overflow-hidden lg:rounded shadow-2xl border border-white/5">
                    {/* Image */}
                    <AppImage
                      src={getImageUrl(currentProduct.image)}
                      alt={currentProduct.name}
                      fill
                      priority
                      className="object-contain object-center transition-transform duration-1000 group-hover/image:scale-105"
                    />
                    <div className="absolute inset-0 bg-emerald-500/5 group-hover/image:bg-transparent transition-colors duration-700" />

                    {/* Carousel Navigation - Arrows (Only on Image for Desktop) */}
                    <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-between px-4 sm:px-6">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          prevSlide();
                          setIsAutoPlaying(false);
                        }}
                        className="p-2 rounded bg-black/40 hover:bg-emerald-500 text-white backdrop-blur-md border border-white/10 transition-all active:scale-90 pointer-events-auto group/nav"
                      >
                        <ChevronLeft className="size-5 sm:size-6 lg:size-7 group-hover/nav:-translate-x-0.5 transition-transform" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          nextSlide();
                          setIsAutoPlaying(false);
                        }}
                        className="p-2 rounded bg-black/40 hover:bg-emerald-500 text-white backdrop-blur-md border border-white/10 transition-all active:scale-90 pointer-events-auto group/nav"
                      >
                        <ChevronRight className="size-5 sm:size-6 lg:size-7 group-hover/nav:translate-x-0.5 transition-transform" />
                      </button>
                    </div>

                    {/* Dots - Integrated in Image Bottom for Desktop */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 pointer-events-auto">
                      {spotlightItems.map((_, i) => (
                        <button
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setCurrentIndex(i);
                            setIsAutoPlaying(false);
                          }}
                          className={`h-1 transition-all duration-500 rounded-full ${
                            i === currentIndex
                              ? "w-8 bg-emerald-500"
                              : "w-2 bg-white/40 hover:bg-white/60"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Autoplay Progress Bar */}
      {isAutoPlaying && (
        <div className="absolute z-20 bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-white/5 overflow-hidden">
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
