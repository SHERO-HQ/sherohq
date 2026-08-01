"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
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

type SpotlightProduct = Product & {
  createdAt?: string | Date;
};

interface ProductSpotlightProps {
  products: SpotlightProduct[];
  isLoading?: boolean;
}

const getCreatedAtTime = (product: SpotlightProduct): number | null => {
  if (!product.createdAt) return null;
  const timestamp = new Date(product.createdAt).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.05, staggerDirection: -1 as const },
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: "easeIn" as const } }
};

const ProductSpotlight = ({ products, isLoading }: ProductSpotlightProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Show newest uploads first; fallback to stable sorting when timestamps are unavailable.
  const spotlightItems = useMemo(() => {
    if (!products.length) return [];

    const productsWithImages = products.filter((p) => Boolean(p.image));
    const source =
      productsWithImages.length > 0 ? productsWithImages : products;

    const newest = source
      .map((product) => ({
        product,
        createdAtTime: getCreatedAtTime(product),
      }))
      .filter((item) => item.createdAtTime !== null)
      .sort((a, b) => (b.createdAtTime as number) - (a.createdAtTime as number))
      .map((item) => item.product)
      .slice(0, 5);

    if (newest.length > 0) {
      return newest;
    }

    return [...source]
      .sort((a, b) => String(a.id).localeCompare(String(b.id)))
      .slice(0, 5);
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
      <div className="relative w-full h-[60vh] sm:h-[65vh] lg:h-[70vh] bg-slate-100 dark:bg-slate-900 animate-pulse rounded overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <Package className="w-12 h-12 text-slate-300 animate-bounce" />
        </div>
      </div>
    );
  }

  const safeCurrentIndex = currentIndex % spotlightItems.length;
  const currentProduct = spotlightItems[safeCurrentIndex];

  return (
    <section className="relative w-full h-full lg:min-h-[calc(90vh-5rem)] overflow-hidden group/spotlight flex flex-col justify-center pt-5 lg:pt-0">
      
      {/* Immersive Background: Animates based on current product */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${currentProduct.id}`}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
        >
           <AppImage 
             src={getImageUrl(currentProduct.image)}
             alt=""
             fill
             className="object-cover opacity-30 dark:opacity-20 blur-[100px] scale-150 transform-gpu"
           />
           <div className="absolute inset-0 bg-slate-50/70 dark:bg-slate-950/70 backdrop-blur-3xl" />
        </motion.div>
      </AnimatePresence>
      
      {/* Kinetic pattern overlay */}
      <div className="absolute inset-0 pattern-dots opacity-40 mix-blend-overlay pointer-events-none z-0" />

      <AnimatePresence mode="wait">
        <motion.div
          key={`content-${currentProduct.id}`}
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          exit="exit"
          className="w-full relative z-10"
        >
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center w-full max-w-6xl mx-auto">
              
              <div className="flex flex-col-reverse lg:flex-row lg:items-stretch gap-8 lg:gap-12 relative w-full">
                
                {/* Left Side: Glassmorphic Info Card */}
                <div className="w-full lg:w-[55%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                  <div className="max-w-xl flex flex-col justify-between h-full">
                    <div>
                      <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-[10px] font-bold text-brand-secondary-600 dark:text-brand-secondary-300 bg-brand-secondary-100 dark:bg-brand-secondary-900/40 border border-brand-secondary-200 dark:border-brand-secondary-700/50 rounded uppercase tracking-widest shadow-sm">
                        <Star className="size-3 fill-brand-secondary-500 text-brand-secondary-500" />
                        <span>Featured Product</span>
                      </motion.div>

                      <motion.h2 
                        variants={staggerItem}
                        className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-6"
                      >
                        {currentProduct.name.split(" ").map((word, i) => (
                          <span
                            key={i}
                            className={i === 0 ? "text-transparent bg-clip-text bg-linear-to-r from-brand-secondary-600 to-brand-primary-600 dark:from-brand-secondary-400 dark:to-brand-primary-400" : ""}
                          >
                            {word}{" "}
                          </span>
                        ))}
                      </motion.h2>

                      <motion.p 
                        variants={staggerItem}
                        className="text-sm lg:text-lg text-slate-600 dark:text-slate-300 mb-8 line-clamp-3 lg:line-clamp-none leading-relaxed"
                      >
                        {currentProduct.description ||
                          "Unlocking the next level of performance with precision engineering and state-of-the-art technology."}
                      </motion.p>
                    </div>

                    <motion.div variants={staggerItem}>
                      <div className="flex flex-wrap items-center gap-6 sm:gap-8 bg-slate-50/50 dark:bg-slate-950/50 p-6 rounded border border-slate-200/50 dark:border-slate-800/50">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">
                            Price
                          </span>
                          <span className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            {formatCurrency(currentProduct.price)}
                          </span>
                        </div>

                        {currentProduct.rating > 0 && (
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">
                              Satisfaction
                            </span>
                            <div className="flex items-center gap-1.5">
                              <Star
                                size={18}
                                className="fill-amber-400 text-amber-400"
                              />
                              <span className="text-xl font-bold text-slate-900 dark:text-white">
                                {currentProduct.rating}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="ml-auto pointer-events-auto">
                          <Link
                            href={getAbsoluteUrl(
                              `/shop/${currentProduct.slug || currentProduct.sku || currentProduct.id}`,
                            )}
                            className="group flex items-center justify-center gap-3 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-slate-900/20 dark:shadow-white/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                          >
                            Details
                            <ArrowRight
                              size={16}
                              className="group-hover:translate-x-1.5 transition-transform"
                            />
                          </Link>
                        </div>
                      </div>

                      {/* Carousel Controls - Integrated below pricing on desktop */}
                      <div className="hidden lg:flex items-center justify-between mt-8">
                        <div className="flex items-center gap-3 pointer-events-auto">
                          {spotlightItems.map((_, i) => (
                            <button
                              key={i}
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setCurrentIndex(i);
                                setIsAutoPlaying(false);
                              }}
                              className={`h-1.5 transition-all duration-500 rounded-full ${
                                i === safeCurrentIndex
                                  ? "w-10 bg-brand-secondary-500 shadow-[0_0_10px_rgba(var(--color-brand-secondary-500),0.5)]"
                                  : "w-3 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              prevSlide();
                              setIsAutoPlaying(false);
                            }}
                            className="p-2.5 rounded-full bg-white dark:bg-slate-800 hover:bg-brand-secondary-500 hover:text-white text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm transition-all active:scale-95 pointer-events-auto group/nav"
                          >
                            <ChevronLeft className="size-5 group-hover/nav:-translate-x-0.5 transition-transform" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              nextSlide();
                              setIsAutoPlaying(false);
                            }}
                            className="p-2.5 rounded-full bg-white dark:bg-slate-800 hover:bg-brand-secondary-500 hover:text-white text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm transition-all active:scale-95 pointer-events-auto group/nav"
                          >
                            <ChevronRight className="size-5 group-hover/nav:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Right Side: Product Image Card */}
                <div className="relative w-full lg:w-[45%] h-[35vh] sm:h-[45vh] lg:h-auto min-h-[300px] lg:min-h-[500px] overflow-hidden group/image flex items-center justify-center">
                  <motion.div 
                    className="relative w-full h-full p-8 flex items-center justify-center"
                  >
                    <AppImage
                      src={getImageUrl(currentProduct.image)}
                      alt={currentProduct.name}
                      fill
                      priority
                      className="object-contain drop-shadow-2xl rounded transition-transform duration-1000 group-hover/image:scale-110"
                    />
                  </motion.div>

                  {/* Mobile Controls */}
                  <div className="lg:hidden absolute inset-0 z-30 pointer-events-none flex items-center justify-between px-2 sm:px-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        prevSlide();
                        setIsAutoPlaying(false);
                      }}
                      className="p-3 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-md hover:bg-brand-secondary-500 text-slate-900 dark:text-white shadow-lg transition-all active:scale-90 pointer-events-auto group/nav"
                    >
                      <ChevronLeft className="size-5 group-hover/nav:-translate-x-0.5 transition-transform" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        nextSlide();
                        setIsAutoPlaying(false);
                      }}
                      className="p-3 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-md hover:bg-brand-secondary-500 text-slate-900 dark:text-white shadow-lg transition-all active:scale-90 pointer-events-auto group/nav"
                    >
                      <ChevronRight className="size-5 group-hover/nav:translate-x-0.5 transition-transform" />
                    </button>
                  </div>

                  {/* Mobile Dots */}
                  <div className="lg:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 pointer-events-auto bg-white/30 dark:bg-black/30 backdrop-blur-md py-2 px-4 rounded-full">
                    {spotlightItems.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setCurrentIndex(i);
                          setIsAutoPlaying(false);
                        }}
                        className={`h-1.5 transition-all duration-500 rounded-full ${
                          i === safeCurrentIndex
                            ? "w-6 bg-brand-secondary-500"
                            : "w-2 bg-slate-900/20 dark:bg-white/40 hover:bg-slate-900/40 dark:hover:bg-white/60"
                        }`}
                      />
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Autoplay Progress Bar */}
      {isAutoPlaying && (
        <div className="absolute z-20 bottom-0 left-0 right-0 h-1.5 bg-slate-200 dark:bg-white/10 overflow-hidden">
          <motion.div
            key={safeCurrentIndex}
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{ duration: 8, ease: "linear" }}
            className="h-full bg-linear-to-r from-brand-primary-500 to-brand-secondary-500 shadow-[0_0_10px_rgba(var(--color-brand-secondary-500),0.8)]"
          />
        </div>
      )}
    </section>
  );
};

export default ProductSpotlight;
