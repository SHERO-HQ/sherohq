"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { m, AnimatePresence } from "motion/react";
import { X, ShoppingCart, Star, ArrowRight, Flame, Share2 } from "lucide-react";
import type { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useNotifications } from "@/hooks/useNotifications";
import { formatCurrency } from "@/utils/format";
import AppImage from "@/components/common/AppImage";
import { getImageUrl } from "@/services/api";
import { WhatsAppIcon } from "@/assets/icons/icons";
import { COMPANY_CONTACTS } from "@/constants/contacts";
import Link from "next/link";
import { getAbsoluteUrl } from "@/utils/subdomain";

interface ProductQuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductQuickViewModal({
  product,
  isOpen,
  onClose,
}: Readonly<ProductQuickViewModalProps>) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { addItem } = useCart();
  const { addNotification } = useNotifications();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : [product.image];

  const currentImage = selectedImage || images[0] || product.image;

  const discount = product.originalPrice
    ? Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100
    )
    : 0;

  const stockCount = typeof product.quantity === "number" ? product.quantity : 10;
  const isLowStock = product.inStock && stockCount > 0 && stockCount <= 5;

  const shareUrl = getAbsoluteUrl(`/shop/${product.slug || product.sku || product.id}`);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: shareUrl,
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(shareUrl);
      addNotification("Link Copied", "Product link copied to clipboard!", "success");
    }
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
      });
    }

    addNotification(
      "Added to Cart",
      `${quantity}x ${product.name} added to your cart.`,
      "success"
    );
    onClose();
  };

  const handleWhatsAppOrder = () => {
    const text = encodeURIComponent(
      `Hello SHERO! I'd like to order: ${product.name} (Qty: ${quantity}, Price: ${formatCurrency(product.price * quantity)}). URL: https://sherohq.com/shop/${product.slug || product.id}`
    );
    window.open(`https://wa.me/${COMPANY_CONTACTS.WHATSAPP}?text=${text}`, "_blank");
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Card */}
          <m.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col pointer-events-auto z-10"
          >
            {/* Header / Close Button */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate pr-4">Quick View</h3>
              <button
                onClick={onClose}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">

              {/* Media Section */}
              <div className="relative w-full rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 p-4 mb-6 flex items-center justify-center">
                <AppImage
                  src={getImageUrl(currentImage)}
                  alt={product.name}
                  width={500}
                  height={500}
                  className="w-full h-auto object-contain max-h-72 sm:max-h-80"
                />
                {discount > 0 && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white font-bold text-xs px-2 py-1 rounded shadow-sm">
                    -{discount}% OFF
                  </span>
                )}
                <button
                  onClick={handleShare}
                  className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-brand-secondary-600 shadow-sm"
                  title="Share product"
                >
                  <Share2 size={16} />
                </button>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
                  {images.map((img, idx) => (
                    <button
                      key={`${img}-${idx}`}
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-16 h-16 shrink-0 rounded border-2 overflow-hidden transition-all ${currentImage === img
                          ? "border-brand-secondary-500 scale-105"
                          : "border-slate-200 dark:border-white/10 opacity-70 hover:opacity-100"
                        }`}
                    >
                      <AppImage
                        src={getImageUrl(img)}
                        alt={`Thumbnail ${idx}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Product Info Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-secondary-500/10 text-brand-secondary-700 dark:text-brand-secondary-400 border border-brand-secondary-500/20 uppercase tracking-wider">
                    {product.category}
                  </span>
                  {isLowStock && (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 animate-pulse">
                      <Flame className="w-3.5 h-3.5" />
                      Only {stockCount} left!
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2 leading-tight">
                  {product.name}
                </h2>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={`star-${i}`}
                        className={`w-4 h-4 ${i < Math.floor(product.rating || 5)
                            ? "fill-current"
                            : "text-slate-300 dark:text-slate-700"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {product.rating || 5} ({product.reviews || 0} reviews)
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-3xl font-extrabold text-brand-secondary-600 dark:text-brand-secondary-400">
                    {formatCurrency(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-lg text-slate-400 dark:text-slate-500 line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  )}
                </div>

                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-3">
                  {product.description || "Premium high-quality tech hardware certified by SHERO Technologies. Backed by full warranty and fast doorstep delivery across Ghana."}
                </p>
              </div>

              {/* Controls & CTA */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                {/* Quantity selector */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Quantity</span>
                  <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-1">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 rounded transition-colors font-bold shadow-sm dark:shadow-none"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-sm text-slate-900 dark:text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 rounded transition-colors font-bold shadow-sm dark:shadow-none"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-secondary-600 hover:bg-brand-secondary-700 text-white font-bold rounded shadow-lg shadow-brand-secondary-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>

                  <button
                    onClick={handleWhatsAppOrder}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/40 text-[#128C7E] dark:text-[#25D366] font-bold rounded transition-all"
                  >
                    <WhatsAppIcon className="w-4 h-4 fill-current" />
                    Order on WhatsApp
                  </button>
                </div>

                <Link
                  href={getAbsoluteUrl(`/shop/${product.slug || product.sku || product.id}`)}
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-brand-secondary-600 dark:hover:text-brand-secondary-400 transition-colors pt-2"
                >
                  <span>View full product specs & reviews</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
