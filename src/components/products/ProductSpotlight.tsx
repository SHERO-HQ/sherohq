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

const stableHash = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const FALLBACK_RANDOM_SEED =
  typeof crypto !== "undefined"
    ? crypto.getRandomValues(new Uint32Array(1))[0]
    : 0;

const getCreatedAtTime = (product: SpotlightProduct): number | null => {
  if (!product.createdAt) return null;

  const timestamp = new Date(product.createdAt).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
};

const ProductSpotlight = ({ products, isLoading }: ProductSpotlightProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Show newest uploads first; fallback to random products when timestamps are unavailable.
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

    const seed = source.map((product) => product.id).join("|");
    return [...source]
      .sort(
        (a, b) =>
          stableHash(`${FALLBACK_RANDOM_SEED}:${seed}:${a.id}`) -
          stableHash(`${FALLBACK_RANDOM_SEED}:${seed}:${b.id}`),
      )
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
      <div className="relative w-full h-[60vh] lg:h-[70vh] bg-slate-100 dark:bg-slate-900 animate-pulse rounded overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <Package className="w-12 h-12 text-slate-300 animate-bounce" />
        </div>
      </div>
    );
  }

  const safeCurrentIndex = currentIndex % spotlightItems.length;
  const currentProduct = spotlightItems[safeCurrentIndex];

  return (
    <section className="relative w-full h-full lg:min-h-[calc(90vh-5rem)] overflow-hidden group/spotlight flex items-start lg:items-center pt-5 lg:pt-0">
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
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75 sm:w-150 h-75 sm:h-150 bg-brand-secondary-500/10 dark:bg-brand-secondary-500/5 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none" />

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
                  <div className="absolute inset-x-0 bottom-0 z-20 lg:relative lg:inset-auto lg:w-1/2 flex flex-col justify-end lg:justify-center p-6 sm:p-8 lg:p-0 bg-linear-to-t from-slate-950/90 via-slate-950/60 to-transparent lg:bg-none lg:-0">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="max-w-xl"
                    >
                      <h2 className="text-3xl lg:text-7xl font-black text-white lg:text-slate-900 lg:dark:text-white leading-[1.05] tracking-tighter mb-3 uppercase">
                        {currentProduct.name.split(" ").map((word, i) => (
                          <span
                            key={i}
                            className={i === 0 ? "text-brand-secondary-500" : ""}
                          >
                            {word}{" "}
                          </span>
                        ))}
                      </h2>

                      <p className="text-xs lg:text-base text-slate-300 lg:text-slate-600 lg:dark:text-slate-400 mb-6 lg:mb-8 line-clamp-2 lg:line-clamp-none max-w-xl leading-relaxed">
                        {currentProduct.description ||
                          "Unlocking the next level of performance with precision engineering and state-of-the-art technology."}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8">
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
                            className="group flex items-center justify-center gap-3 px-4 py-2 bg-brand-secondary-500 hover:bg-brand-secondary-400 text-white rounded font-black uppercase tracking-widest text-[10px] transition-all shadow shadow-brand-secondary-500/20 hover:-translate-y-0.5"
                          >
                            Details
                            <ArrowRight
                              size={14}
                              className="group-hover:translate-x-1 transition-transform"
                            />
                          </Link>
                        </div>
                      </div>

                      {/* Carousel Controls - Below Price on Large Screens */}
                      <div className="hidden lg:flex items-center gap-8 mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            prevSlide();
                            setIsAutoPlaying(false);
                          }}
                          className="p-2 rounded bg-slate-100 dark:bg-slate-900 hover:bg-brand-secondary-500 hover:text-white text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 transition-all active:scale-90 pointer-events-auto group/nav"
                        >
                          <ChevronLeft className="size-6 group-hover/nav:-translate-x-0.5 transition-transform" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            nextSlide();
                            setIsAutoPlaying(false);
                          }}
                          className="p-2 rounded bg-slate-100 dark:bg-slate-900 hover:bg-brand-secondary-500 hover:text-white text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 transition-all active:scale-90 pointer-events-auto group/nav"
                        >
                          <ChevronRight className="size-6 group-hover/nav:translate-x-0.5 transition-transform" />
                        </button>

                        <div className="flex items-center gap-2 pointer-events-auto">
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
                                  ? "w-8 bg-brand-secondary-500"
                                  : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Right Side: Image with Content Wrapper (Background on Mobile, Relative Fixed on LG) */}
                  <div className="relative w-full lg:w-[56%] aspect-4/5 sm:aspect-16/10 lg:aspect-auto h-[75vh] sm:h-[65vh] lg:h-190 group/image overflow-hidden lg:rounded">
                    {/* Image */}
                    <AppImage
                      src={getImageUrl(currentProduct.image)}
                      alt={currentProduct.name}
                      fill
                      priority
                      className="object-cover object-center lg:object-contain transition-transform duration-1000 group-hover/image:scale-105"
                    />
                    <div className="absolute inset-0 group-hover/image:bg-transparent transition-colors duration-700" />

                    {/* Carousel Navigation - Arrows (Only on Mobile/Tablet) */}
                    <div className="lg:hidden absolute inset-0 z-30 pointer-events-none flex items-center justify-between px-4 sm:px-6">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          prevSlide();
                          setIsAutoPlaying(false);
                        }}
                        className="p-2 rounded bg-black/10 hover:bg-brand-secondary-500 text-white  border border-white/10 transition-all active:scale-90 pointer-events-auto group/nav"
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
                        className="p-2 rounded bg-black/10 hover:bg-brand-secondary-500 text-white  border border-white/10 transition-all active:scale-90 pointer-events-auto group/nav"
                      >
                        <ChevronRight className="size-5 sm:size-6 lg:size-7 group-hover/nav:translate-x-0.5 transition-transform" />
                      </button>
                    </div>

                    {/* Dots - Integrated in Image Bottom (Mobile/Tablet Only) */}
                    <div className="lg:hidden absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 pointer-events-auto">
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
                            i === safeCurrentIndex
                              ? "w-8 bg-brand-secondary-500"
                              : "w-2 dark:bg-white/40 bg-slate-600/40 hover:bg-white/60"
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
            key={safeCurrentIndex}
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{ duration: 8, ease: "linear" }}
            className="h-full bg-brand-secondary-500"
          />
        </div>
      )}
    </section>
  );
};

export default ProductSpotlight;
