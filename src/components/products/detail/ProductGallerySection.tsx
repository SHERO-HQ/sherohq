"use client";

import React from "react";
import { m, AnimatePresence } from "motion/react";
import {
  Share2,
  Maximize2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AppImage from "@/components/common/AppImage";
import { getImageUrl } from "@/services/api";
import type { Product } from "@/types/product";

interface ProductGallerySectionProps {
  product: Product;
  images: string[];
  selectedImage: number;
  setSelectedImage: React.Dispatch<React.SetStateAction<number>>;
  discount: number;
  handleShare: (e: React.MouseEvent) => void;
  handleMaximize: (e: React.MouseEvent) => void;
  nextImage: () => void;
  prevImage: () => void;
}

export function ProductGallerySection({
  product,
  images,
  selectedImage,
  setSelectedImage,
  discount,
  handleShare,
  handleMaximize,
  nextImage,
  prevImage,
}: ProductGallerySectionProps) {
  return (
    <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-28">
      <div className="group relative aspect-4/5 max-h-110 sm:max-h-135 lg:max-h-170 bg-white dark:bg-white/5 sm:rounded overflow-hidden sm:border border-y sm:border-x border-slate-200 dark:border-white/10 flex items-center justify-center -mx-4 sm:mx-0 w-[calc(100%+2rem)] sm:w-full">
        <div className="absolute top-6 right-6 lg:opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 z-20">
          <button
            onClick={handleShare}
            className="p-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-brand-secondary-600 hover:border-brand-secondary-500 shadow-sm transition-all"
            aria-label="Share product"
            title="Share product"
          >
            <Share2 size={20} />
          </button>
          <button
            onClick={handleMaximize}
            className="p-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-brand-secondary-600 hover:border-brand-secondary-500 shadow-sm transition-all"
            aria-label="View Fullscreen"
            title="View Fullscreen"
          >
            <Maximize2 size={20} />
          </button>
        </div>
        <AnimatePresence mode="wait">
          <m.div
            key={selectedImage}
            initial={false}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="relative w-full h-full py-4 sm:py-6 px-6 sm:px-12 lg:px-16 flex items-center justify-center cursor-zoom-in"
            onClick={handleMaximize}
          >
            {images[selectedImage] &&
            (images[selectedImage].startsWith("/uploads") ||
              images[selectedImage].startsWith("http")) ? (
              <AppImage
                src={getImageUrl(images[selectedImage])}
                alt={product.name}
                fill
                priority
                className="w-full h-full object-contain max-w-full max-h-full mx-auto"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-9xl select-none opacity-20">
                {images[selectedImage]}
              </div>
            )}
          </m.div>
        </AnimatePresence>

        {images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
            <button
              onClick={prevImage}
              className="pointer-events-auto p-1.5 bg-white/20 dark:bg-slate-900/10 rounded border border-slate-200 dark:border-white/10 hover:bg-brand-secondary-500 hover:text-white transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextImage}
              className="pointer-events-auto p-1.5 bg-white/20 dark:bg-slate-900/10 rounded border border-slate-200 dark:border-white/10 hover:bg-brand-secondary-500 hover:text-white transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-6 left-6 flex flex-col gap-2">
          {product.badge && (
            <span className="px-2 py-1 rounded text-[9px] font-bold uppercase tracking-tighter bg-brand-secondary-600 text-white">
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span className="px-2 py-1 rounded text-[9px] font-bold uppercase tracking-tighter bg-red-600 text-white">
              -{discount}%
            </span>
          )}
          {!product.inStock && (
            <span className="px-2 py-1 rounded text-[9px] font-bold uppercase tracking-tighter bg-slate-900/90 text-white">
              Sold Out
            </span>
          )}
        </div>
      </div>

      {/* Thumbnail Selection */}
      {images.length > 1 && (
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2 pl-2">
          {images.map((img: string, idx: number) => (
            <button
              key={`detail-thumb-${idx}`}
              onClick={() => setSelectedImage(idx)}
              className={`shrink-0 w-14 h-14 rounded overflow-hidden border-2 transition duration-200 ${
                idx === selectedImage
                  ? "border-brand-secondary-500 scale-105"
                  : "border-transparent bg-white dark:bg-white/5 opacity-50 hover:opacity-100"
              }`}
            >
              <div className="relative w-full h-full p-2 flex items-center justify-center">
                {img &&
                (img.startsWith("/uploads") || img.startsWith("http")) ? (
                  <AppImage
                    src={getImageUrl(img)}
                    alt="Thumbnail"
                    fill
                    className="w-full h-full object-contain mx-auto"
                  />
                ) : (
                  <div className="text-3xl flex items-center justify-center h-full">
                    {img}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
