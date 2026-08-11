"use client";

import React from "react";
import { createPortal } from "react-dom";
import { m, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import AppImage from "@/components/common/AppImage";
import { getImageUrl } from "@/services/api";

interface ProductImagePreviewModalProps {
  mounted: boolean;
  isPreviewOpen: boolean;
  setIsPreviewOpen: (val: boolean) => void;
  images: string[];
  selectedImage: number;
  productName: string;
  prevImage: () => void;
  nextImage: () => void;
}

export function ProductImagePreviewModal({
  mounted,
  isPreviewOpen,
  setIsPreviewOpen,
  images,
  selectedImage,
  productName,
  prevImage,
  nextImage,
}: ProductImagePreviewModalProps) {
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isPreviewOpen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-100 bg-black/95"
          onClick={() => setIsPreviewOpen(false)}
        >
          <button
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded transition-colors z-110"
            onClick={(e) => {
              e.stopPropagation();
              setIsPreviewOpen(false);
            }}
          >
            <X size={24} />
          </button>

          <div className="absolute inset-0 p-4 sm:p-12 pointer-events-none flex items-center justify-center">
            <div className="pointer-events-auto flex items-center justify-center w-full h-full relative">
              {images[selectedImage] &&
              (images[selectedImage].startsWith("/uploads") ||
                images[selectedImage].startsWith("http")) ? (
                <AppImage
                  src={getImageUrl(images[selectedImage])}
                  alt={productName}
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-9xl select-none opacity-20 text-white">
                  {images[selectedImage]}
                </div>
              )}
            </div>
          </div>

          {images.length > 1 && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-2 sm:px-8 pointer-events-none z-110">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="pointer-events-auto p-2 bg-white/10 text-white rounded hover:bg-brand-secondary-500 hover:text-white transition-colors border border-white/10"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="pointer-events-auto p-2 bg-white/10 text-white rounded hover:bg-brand-secondary-500 hover:text-white transition-colors border border-white/10"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
