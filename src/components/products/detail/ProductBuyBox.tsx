"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  Minus,
  Plus,
  Check,
  ShoppingCart,
  Heart,
  BadgeCheck,
} from "lucide-react";
import type { Product } from "@/types/product";
import { formatCurrency } from "@/utils/format";
import { COMPANY_CONTACTS } from "@/constants/contacts";
import { WhatsAppIcon } from "@/assets/icons/icons";

interface ProductBuyBoxProps {
  product: Product;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  handleAddToCart: () => void;
  isAddedToCart: boolean;
  globalToggleWishlist: (item: {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
  }) => void;
  isWishlisted: boolean;
  shareUrl: string;
}

export function ProductBuyBox({
  product,
  quantity,
  setQuantity,
  handleAddToCart,
  isAddedToCart,
  globalToggleWishlist,
  isWishlisted,
  shareUrl,
}: ProductBuyBoxProps) {
  const router = useRouter();

  return (
    <div className="lg:col-span-5 flex flex-col gap-8">
      <div className="p-8 rounded bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest bg-brand-secondary-500/10 text-brand-secondary-600 dark:text-brand-secondary-400">
            {product.category}
          </span>
          {product.rating > 0 && (
            <div className="flex items-center gap-1.5">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold dark:text-slate-300">
                {product.rating}{" "}
                <span className="text-slate-500 font-medium ml-1 text-xs">
                  ({product.reviews} Reviews)
                </span>
              </span>
            </div>
          )}
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-4">
          {product.name}
        </h1>

        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8">
          {product.description}
        </p>

        {/* Quantity Selector */}
        <div className="flex justify-between items-center gap-6 mb-8 px-2 py-1 rounded bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Quantity
          </span>
          <div className="flex items-center gap-1 bg-white dark:bg-black/20 rounded border border-slate-200 dark:border-white/10 p-1">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center font-bold text-sm">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 px-1">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 line-through">
                Was {formatCurrency(product.originalPrice)}
              </span>
            )}
            <span className="text-xl font-bold text-brand-secondary-600 dark:text-brand-secondary-400">
              {formatCurrency(product.price)}
            </span>
          </div>
          <div
            className={`text-[10px] font-semibold tracking-tighter w-fit border border-brand-secondary-500/30 p-1 rounded${
              product.inStock
                ? " text-brand-secondary-600 dark:text-brand-secondary-400 bg-brand-secondary-500/10 dark:bg-brand-secondary-500/10"
                : " text-red-600 dark:text-red-400 bg-red-500/10 dark:bg-red-500/10"
            }`}
          >
            {product.inStock ? "In Stock" : "Out of Stock"}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock || isAddedToCart}
              className={`flex-1 flex items-center justify-center gap-2 h-10 px-4 rounded font-semibold text-sm tracking-widest transition-colors border-2 ${
                isAddedToCart
                  ? "bg-brand-secondary-500 border-brand-secondary-500 text-white"
                  : "bg-white dark:bg-white/5 border-brand-secondary-600 text-brand-secondary-600 dark:text-brand-secondary-400 hover:bg-brand-secondary-500 hover:text-white"
              }`}
            >
              {isAddedToCart ? (
                <Check className="w-5 h-5" />
              ) : (
                <ShoppingCart className="w-5 h-5" />
              )}
              {isAddedToCart ? "Added" : "Add"}
            </button>

            <button
              onClick={() => {
                handleAddToCart();
                router.push("/shop/checkout");
              }}
              disabled={!product.inStock}
              className="flex-1 px-2 h-10 bg-brand-secondary-600 text-white rounded font-semibold text-sm tracking-widest hover:bg-brand-secondary-500 transition-colors disabled:opacity-50"
            >
              Buy
            </button>

            <button
              onClick={() =>
                globalToggleWishlist({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                  category: product.category,
                })
              }
              className={`w-10 h-10 rounded flex items-center justify-center border-2 transition-colors shrink-0 ${
                isWishlisted
                  ? "bg-red-500 border-red-500 text-white"
                  : "border-slate-200 dark:border-white/10 text-slate-500 hover:border-red-500 hover:text-red-500"
              }`}
            >
              <Heart
                size={20}
                className={isWishlisted ? "fill-current" : ""}
              />
            </button>
          </div>
          <a
            href={`https://wa.me/${COMPANY_CONTACTS.WHATSAPP}?text=${encodeURIComponent(
              `Hello Shero, I'm interested in the ${product.name} (GHS${product.price}). Here is the link:\n${shareUrl}\n\nCould you please provide more details or assist me with the purchase? Thank you!`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 h-10 bg-[#25D366] text-black/90 rounded font-semibold text-sm tracking-widest hover:bg-[#20bd5a] transition-colors"
          >
            <WhatsAppIcon className="w-5 h-5" />
            Chat on WhatsApp
          </a>
        </div>
      </div>

      {/* Features Minimalist Section */}
      {product.features && product.features.length > 0 && (
        <div className="p-8 rounded border border-slate-200 dark:border-white/10">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <BadgeCheck className="text-brand-secondary-500" /> Key Features
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {product.features.map((feature: string, i: number) => (
              <div key={`feature-${i}`} className="flex items-center gap-4">
                <div className="mt-1 w-5 h-5 rounded-full bg-brand-secondary-500/10 flex items-center justify-center shrink-0">
                  <Check size={10} className="text-brand-secondary-600" />
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
