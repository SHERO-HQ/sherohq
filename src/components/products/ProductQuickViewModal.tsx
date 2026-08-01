"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShoppingCart, Star, ArrowRight, Flame } from "lucide-react";
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded shadow-2xl overflow-hidden z-10 my-auto text-white"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
              {/* Media Section */}
              <div className="flex flex-col gap-4">
                <div className="relative aspect-square rounded overflow-hidden bg-slate-950 border border-white/5 flex items-center justify-center">
                  <AppImage
                    src={getImageUrl(currentImage)}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                  />
                  {discount > 0 && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white font-bold text-xs px-2.5 py-1 rounded">
                      -{discount}% OFF
                    </span>
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    {images.map((img, idx) => (
                      <button
                        key={`${img}-${idx}`}
                        onClick={() => setSelectedImage(img)}
                        className={`relative w-14 h-14 rounded overflow-hidden border-2 transition-all flex-shrink-0 ${currentImage === img
                          ? "border-emerald-500 scale-105"
                          : "border-white/10 opacity-60 hover:opacity-100"
                          }`}
                      >
                        <AppImage
                          src={getImageUrl(img)}
                          alt={`${product.name} thumbnail ${idx}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info Section */}
              <div className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                      {product.category}
                    </span>
                    {isLowStock && (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 animate-pulse">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        Only {stockCount} left!
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
                    {product.name}
                  </h2>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={`star-${i}`}
                          className={`w-4 h-4 ${i < Math.floor(product.rating || 5)
                            ? "fill-current"
                            : "text-slate-700"
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {product.rating || 5.0} ({product.reviews || 0} reviews)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-3xl font-extrabold text-emerald-400">
                      {formatCurrency(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-lg text-slate-500 line-through">
                        {formatCurrency(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-slate-300 text-sm leading-relaxed mb-6 line-clamp-3">
                    {product.description || "Premium high-quality tech hardware certified by SHERO Technologies. Backed by full warranty and fast doorstep delivery across Ghana."}
                  </p>
                </div>

                {/* Controls & CTA */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  {/* Quantity selector */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-400">Quantity</span>
                    <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded p-1">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors font-bold"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold text-sm">{quantity}</span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={handleAddToCart}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>

                    <button
                      onClick={handleWhatsAppOrder}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/40 text-emerald-400 font-bold rounded transition-all"
                    >
                      <WhatsAppIcon className="w-4 h-4 fill-current" />
                      Order on WhatsApp
                    </button>
                  </div>

                  <Link
                    href={getAbsoluteUrl(`/shop/${product.slug || product.sku || product.id}`)}
                    onClick={onClose}
                    className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors pt-2"
                  >
                    <span>View full product specs & reviews</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
